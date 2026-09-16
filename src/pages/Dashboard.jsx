import { Link, useOutletContext } from "react-router-dom";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  ChevronRight,
  Utensils,
  Car,
  Smartphone,
  Receipt,
  ShoppingBag,
  Clapperboard,
  HeartPulse,
  GraduationCap,
  House,
  UserRound,
  BriefcaseBusiness,
  Gift,
  Banknote,
  WalletCards,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "../utils/currency";
import { formatDate } from "../utils/date";

const categoryIcons = {
  Food: Utensils,
  Transport: Car,
  Airtime: Smartphone,
  Data: Smartphone,
  Bills: Receipt,
  Shopping: ShoppingBag,
  Entertainment: Clapperboard,
  Health: HeartPulse,
  Education: GraduationCap,
  "Rent/Housing": House,
  "Personal Care": UserRound,

  Salary: BriefcaseBusiness,
  Freelance: BriefcaseBusiness,
  Business: BriefcaseBusiness,
  Allowance: WalletCards,
  Gift,
  Investment: Banknote,
  Refund: Receipt,
};

function Dashboard() {
  const { transactions, currency, dateFormat, profile } = useOutletContext();

  /*
    ============================================================
    DATE / GREETING
    ============================================================
  */

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const hour = now.getHours();

  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const monthName = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(now);

  const profileName = profile?.name?.trim()?.split(" ")[0] || "there";

  /*
    ============================================================
    FINANCIAL SUMMARY
    ============================================================
  */

  const income = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((total, transaction) => total + transaction.amount, 0);

  const expenses = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((total, transaction) => total + transaction.amount, 0);

  const balance = income - expenses;

  /*
    ============================================================
    CURRENT MONTH
    ============================================================
  */

  const currentMonthTransactions = transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);

    if (Number.isNaN(transactionDate.getTime())) {
      return false;
    }

    return (
      transactionDate.getMonth() === currentMonth &&
      transactionDate.getFullYear() === currentYear
    );
  });

  const monthlyIncome = currentMonthTransactions
    .filter((transaction) => transaction.type === "income")
    .reduce((total, transaction) => total + transaction.amount, 0);

  const monthlyExpenses = currentMonthTransactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((total, transaction) => total + transaction.amount, 0);

  const monthlyNet = monthlyIncome - monthlyExpenses;

  /*
    ============================================================
    PREVIOUS MONTH
    ============================================================
  */

  const previousMonthDate = new Date(currentYear, currentMonth - 1, 1);
  const previousMonth = previousMonthDate.getMonth();
  const previousMonthYear = previousMonthDate.getFullYear();

  const previousMonthExpenses = transactions
    .filter((transaction) => {
      if (transaction.type !== "expense") {
        return false;
      }

      const transactionDate = new Date(transaction.date);

      if (Number.isNaN(transactionDate.getTime())) {
        return false;
      }

      return (
        transactionDate.getMonth() === previousMonth &&
        transactionDate.getFullYear() === previousMonthYear
      );
    })
    .reduce((total, transaction) => total + transaction.amount, 0);

  let spendingChange = null;

  if (previousMonthExpenses > 0) {
    spendingChange =
      ((monthlyExpenses - previousMonthExpenses) / previousMonthExpenses) * 100;
  }

  /*
    ============================================================
    SPENDING BY CATEGORY
    ============================================================
  */

  const spendingByCategory = currentMonthTransactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((categories, transaction) => {
      const category = transaction.category;

      categories[category] = (categories[category] || 0) + transaction.amount;

      return categories;
    }, {});

  const categoryEntries = Object.entries(spendingByCategory).sort(
    ([, amountA], [, amountB]) => amountB - amountA,
  );

  const totalCategorySpending = categoryEntries.reduce(
    (total, [, amount]) => total + amount,
    0,
  );

  const topCategories = categoryEntries.slice(0, 3);

  /*
    ============================================================
    RECENT TRANSACTIONS
    ============================================================
  */

  const recentTransactions = [...transactions]
    .sort((a, b) => {
      const dateDifference =
        new Date(b.date).getTime() - new Date(a.date).getTime();

      if (dateDifference !== 0) {
        return dateDifference;
      }

      return String(b.id).localeCompare(String(a.id));
    })
    .slice(0, 4);

  /*
    ============================================================
    MONTHLY COMPARISON
    ============================================================
  */

  const monthlyComparisonTotal = Math.max(monthlyIncome, monthlyExpenses);

  const incomePercentage =
    monthlyComparisonTotal > 0
      ? (monthlyIncome / monthlyComparisonTotal) * 100
      : 0;

  const expensePercentage =
    monthlyComparisonTotal > 0
      ? (monthlyExpenses / monthlyComparisonTotal) * 100
      : 0;

  /*
    ============================================================
    HELPERS
    ============================================================
  */

  const getCategoryIcon = (category) => {
    return categoryIcons[category] || WalletCards;
  };

  return (
    <div className="relative min-h-full overflow-hidden px-4 pb-24 pt-6 md:px-8 md:pb-8 md:pt-8">
      {/* Ambient background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/5 blur-3xl"
      />

      <div className="mx-auto max-w-6xl space-y-8">
        {/* ======================================================
            HEADER
        ====================================================== */}

        <header className="animate-in fade-in slide-in-from-bottom-2 flex items-start justify-between gap-4 duration-500">
          <div>
            <p className="text-sm text-muted-foreground">
              {greeting}, {profileName}
            </p>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              Your finances
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Here's your financial overview.
            </p>
          </div>

          <Link
            to="/transactions"
            className="group inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/10 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/20 sm:h-auto sm:w-auto sm:gap-2 sm:rounded-xl sm:px-4 sm:py-2.5 sm:text-sm sm:font-medium"
            aria-label="Add transaction"
          >
            <Plus
              size={18}
              className="transition-transform duration-200 group-hover:rotate-90"
            />

            <span className="hidden sm:inline">Add transaction</span>
          </Link>
        </header>

        {/* ======================================================
            BALANCE HERO
        ====================================================== */}

        <section className="animate-in fade-in slide-in-from-bottom-3 relative overflow-hidden rounded-[2rem] border border-border/50 bg-card p-6 shadow-2xl shadow-black/10 duration-700 sm:p-8">
          {/* Decorative light */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 left-1/3 h-32 w-32 rounded-full bg-primary/5 blur-3xl"
          />

          <div className="relative">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total balance
                </p>

                <p className="mt-1 text-xs text-muted-foreground/70">
                  Across all recorded transactions
                </p>
              </div>

              <div className="hidden rounded-full border border-border/60 bg-background/40 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur-sm sm:block">
                All time
              </div>
            </div>

            <p className="mt-6 text-4xl font-semibold tracking-[-0.04em] text-foreground sm:text-6xl">
              {formatCurrency(balance, currency)}
            </p>

            <div className="mt-8 grid grid-cols-2 gap-3 sm:flex sm:gap-3">
              <div className="flex items-center gap-3 rounded-2xl border border-border/40 bg-background/30 px-3 py-3 backdrop-blur-sm transition-colors hover:bg-background/50">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <ArrowDownLeft size={16} />
                </div>

                <div className="min-w-0">
                  <p className="text-[11px] text-muted-foreground">Income</p>

                  <p className="truncate text-sm font-medium text-foreground">
                    {formatCurrency(income, currency)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-border/40 bg-background/30 px-3 py-3 backdrop-blur-sm transition-colors hover:bg-background/50">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                  <ArrowUpRight size={16} />
                </div>

                <div className="min-w-0">
                  <p className="text-[11px] text-muted-foreground">Expenses</p>

                  <p className="truncate text-sm font-medium text-foreground">
                    {formatCurrency(expenses, currency)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================
            MONTHLY OVERVIEW
        ====================================================== */}

        <section className="animate-in fade-in slide-in-from-bottom-3 duration-700 delay-100">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Spending overview</p>

              <h2 className="mt-1 text-lg font-semibold text-foreground">
                {monthName}
              </h2>
            </div>

            {spendingChange !== null && (
              <div
                className={`hidden items-center gap-1.5 text-xs font-medium sm:flex ${
                  spendingChange < 0
                    ? "text-primary"
                    : spendingChange > 0
                      ? "text-destructive"
                      : "text-muted-foreground"
                }`}
              >
                {spendingChange < 0 ? (
                  <ArrowDownLeft size={14} />
                ) : spendingChange > 0 ? (
                  <ArrowUpRight size={14} />
                ) : null}
                {Math.abs(spendingChange).toFixed(1)}%{" "}
                {spendingChange < 0
                  ? "less than last month"
                  : spendingChange > 0
                    ? "more than last month"
                    : "same as last month"}
              </div>
            )}
          </div>

          <Card className="group relative overflow-hidden border-border/40 bg-card/70 p-5 shadow-none transition-all duration-300 hover:border-border/70 hover:bg-card sm:p-6">
            <div className="flex items-end justify-between gap-6">
              <div>
                <p className="text-xs text-muted-foreground">
                  Spent this month
                </p>

                <p className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
                  {formatCurrency(monthlyExpenses, currency)}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs text-muted-foreground">Net</p>

                <p
                  className={`mt-1 text-sm font-semibold ${
                    monthlyNet >= 0 ? "text-primary" : "text-destructive"
                  }`}
                >
                  {monthlyNet >= 0 ? "+" : "-"}
                  {formatCurrency(Math.abs(monthlyNet), currency)}
                </p>
              </div>
            </div>

            {spendingChange !== null && (
              <div className="mt-4 flex items-center gap-1.5 text-xs sm:hidden">
                {spendingChange < 0 ? (
                  <ArrowDownLeft size={14} className="text-primary" />
                ) : spendingChange > 0 ? (
                  <ArrowUpRight size={14} className="text-destructive" />
                ) : null}

                <span
                  className={
                    spendingChange < 0
                      ? "text-primary"
                      : spendingChange > 0
                        ? "text-destructive"
                        : "text-muted-foreground"
                  }
                >
                  {Math.abs(spendingChange).toFixed(1)}%{" "}
                  {spendingChange < 0
                    ? "less than last month"
                    : spendingChange > 0
                      ? "more than last month"
                      : "same as last month"}
                </span>
              </div>
            )}

            <div className="mt-7 space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Income</span>

                  <span className="font-medium text-foreground">
                    {formatCurrency(monthlyIncome, currency)}
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-[width] duration-700 ease-out"
                    style={{
                      width: `${incomePercentage}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Expenses</span>

                  <span className="font-medium text-foreground">
                    {formatCurrency(monthlyExpenses, currency)}
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-destructive transition-[width] duration-700 ease-out"
                    style={{
                      width: `${expensePercentage}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* ======================================================
            CONTENT GRID
        ====================================================== */}

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          {/* ====================================================
              RECENT TRANSACTIONS
          ==================================================== */}

          <section className="animate-in fade-in slide-in-from-bottom-3 duration-700 delay-150">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Activity</p>

                <h2 className="mt-1 text-lg font-semibold text-foreground">
                  Recent transactions
                </h2>
              </div>

              <Link
                to="/transactions"
                className="group inline-flex items-center gap-1 text-sm font-medium text-primary transition-opacity hover:opacity-80"
              >
                View all
                <ChevronRight
                  size={15}
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </Link>
            </div>

            {recentTransactions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/60 bg-card/30 px-5 py-10 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <WalletCards size={22} />
                </div>

                <h3 className="mt-4 text-sm font-semibold text-foreground">
                  Your activity will appear here
                </h3>

                <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-muted-foreground">
                  Add your first income or expense to start tracking your
                  finances.
                </p>

                <Link
                  to="/transactions"
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-medium text-primary-foreground shadow-lg shadow-primary/10 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-primary/20"
                >
                  <Plus size={15} />
                  Add transaction
                </Link>
              </div>
            ) : (
              <div className="space-y-1">
                {recentTransactions.map((transaction) => {
                  const Icon = getCategoryIcon(transaction.category);

                  return (
                    <div
                      key={transaction.id}
                      className="group flex items-center justify-between gap-4 rounded-2xl px-3 py-3 transition-all duration-200 hover:bg-muted/40 sm:px-4"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-transform duration-200 group-hover:scale-105 ${
                            transaction.type === "income"
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <Icon size={18} />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">
                            {transaction.description}
                          </p>

                          <p className="mt-0.5 truncate text-xs text-muted-foreground">
                            {transaction.category} ·{" "}
                            {formatDate(transaction.date, dateFormat)}
                          </p>
                        </div>
                      </div>

                      <p
                        className={`shrink-0 text-sm font-semibold ${
                          transaction.type === "income"
                            ? "text-primary"
                            : "text-foreground"
                        }`}
                      >
                        {transaction.type === "income" ? "+" : "-"}
                        {formatCurrency(transaction.amount, currency)}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* ====================================================
              SPENDING BREAKDOWN
          ==================================================== */}

          <section className="animate-in fade-in slide-in-from-bottom-3 duration-700 delay-200">
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">Where it goes</p>

              <h2 className="mt-1 text-lg font-semibold text-foreground">
                Spending breakdown
              </h2>
            </div>

            <Card className="border-border/40 bg-card/70 p-5 shadow-none transition-all duration-300 hover:border-border/70 hover:bg-card">
              {topCategories.length === 0 ? (
                <p className="py-5 text-sm text-muted-foreground">
                  No expenses recorded this month.
                </p>
              ) : (
                <div className="space-y-5">
                  {topCategories.map(([category, amount]) => {
                    const percentage =
                      totalCategorySpending > 0
                        ? (amount / totalCategorySpending) * 100
                        : 0;

                    const Icon = getCategoryIcon(category);

                    return (
                      <div key={category}>
                        <div className="mb-2 flex items-center justify-between gap-4">
                          <div className="flex min-w-0 items-center gap-2.5">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                              <Icon size={14} />
                            </div>

                            <span className="truncate text-sm font-medium text-foreground">
                              {category}
                            </span>
                          </div>

                          <span className="shrink-0 text-xs text-muted-foreground">
                            {formatCurrency(amount, currency)}
                          </span>
                        </div>

                        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary transition-[width] duration-700 ease-out"
                            style={{
                              width: `${percentage}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
