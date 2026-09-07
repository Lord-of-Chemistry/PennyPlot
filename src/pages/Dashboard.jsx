import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AddTransaction from "@/components/AddTransaction";
import { Link, useOutletContext } from "react-router-dom";
import { formatCurrency } from "../utils/currency";
import { formatDate } from "../utils/date";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  CalendarDays,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  Receipt,
} from "lucide-react";

function Dashboard() {
  const { transactions, currency, dateFormat } = useOutletContext();

  const income = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((total, transaction) => total + transaction.amount, 0);

  const expenses = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((total, transaction) => total + transaction.amount, 0);

  const balance = income - expenses;
  const savings = balance > 0 ? balance : 0;

  // THIS MONTH
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const thisMonthTransactions = transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);

    return (
      transactionDate.getMonth() === currentMonth &&
      transactionDate.getFullYear() === currentYear
    );
  });

  const monthlyIncome = thisMonthTransactions
    .filter((transaction) => transaction.type === "income")
    .reduce((total, transaction) => total + transaction.amount, 0);

  const monthlyExpenses = thisMonthTransactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((total, transaction) => total + transaction.amount, 0);

  const monthlyNet = monthlyIncome - monthlyExpenses;

  // SPENDING BREAKDOWN
  const spendingByCategory = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((categories, transaction) => {
      categories[transaction.category] =
        (categories[transaction.category] || 0) + transaction.amount;

      return categories;
    }, {});

  const spendingBreakdown = Object.entries(spendingByCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const totalCategorySpending = expenses;

  const cards = [
    {
      title: "Total Balance",
      value: formatCurrency(balance, currency),
      description: "Current available balance",
      icon: Wallet,
      color: "text-primary",
    },
    {
      title: "Income",
      value: formatCurrency(income, currency),
      description: "Total money received",
      icon: TrendingUp,
      color: "text-primary",
    },
    {
      title: "Expenses",
      value: formatCurrency(expenses, currency),
      description: "Total money spent",
      icon: TrendingDown,
      color: "text-red-400",
    },
    {
      title: "Savings",
      value: formatCurrency(savings, currency),
      description: "Current savings",
      icon: PiggyBank,
      color: "text-primary",
    },
  ];

  return (
    <div className="bg-background">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Here's your financial overview.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <Card
              key={card.title}
              className="border-border bg-card transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:bg-accent"
            >
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>

                <Icon size={20} className={card.color} />
              </CardHeader>

              <CardContent>
                <p className={`text-3xl font-bold ${card.color}`}>
                  {card.value}
                </p>

                <p className="mt-3 text-xs text-muted-foreground">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* This Month */}
      <section className="mt-8 rounded-2xl border border-border bg-card/60 p-5">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CalendarDays size={19} />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground">
              This Month
            </h2>

            <p className="text-sm text-muted-foreground">
              Your financial activity for{" "}
              {now.toLocaleString("en-US", { month: "long" })}
            </p>
          </div>
        </div>

        {thisMonthTransactions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border px-5 py-8 text-center">
            <CalendarDays
              size={28}
              className="mx-auto mb-3 text-muted-foreground/50"
            />

            <p className="text-sm font-medium text-muted-foreground">
              Nothing recorded this month
            </p>

            <p className="mt-1 text-xs text-muted-foreground/60">
              Add a transaction to start tracking this month's activity.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {/* Monthly Income */}
            <div className="rounded-xl border border-border/50 bg-foreground/[0.03] p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Income</p>

                <ArrowUpRight size={17} className="text-primary" />
              </div>

              <p className="mt-3 text-2xl font-bold text-primary">
                {formatCurrency(monthlyIncome, currency)}
              </p>
            </div>

            {/* Monthly Expenses */}
            <div className="rounded-xl border border-border/50 bg-foreground/[0.03] p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Expenses</p>

                <ArrowDownRight size={17} className="text-red-400" />
              </div>

              <p className="mt-3 text-2xl font-bold text-red-400">
                {formatCurrency(monthlyExpenses, currency)}
              </p>
            </div>

            {/* Monthly Net */}
            <div className="rounded-xl border border-border/50 bg-foreground/[0.03] p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Net</p>

                <Wallet
                  size={17}
                  className={monthlyNet >= 0 ? "text-primary" : "text-red-400"}
                />
              </div>

              <p
                className={`mt-3 text-2xl font-bold ${
                  monthlyNet >= 0 ? "text-primary" : "text-red-400"
                }`}
              >
                {formatCurrency(monthlyNet, currency)}
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Income vs Expenses + Spending Breakdown */}
      <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* Income vs Expenses */}
        <section className="flex-1 rounded-2xl border border-border bg-card/60 p-5">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground">
              Income vs Expenses
            </h2>

            <p className="text-sm text-muted-foreground">
              Compare your overall money coming in and going out.
            </p>
          </div>

          {income === 0 && expenses === 0 ? (
            <div className="rounded-xl border border-dashed border-border px-5 py-10 text-center">
              <TrendingUp
                size={30}
                className="mx-auto mb-3 text-muted-foreground/50"
              />

              <p className="text-sm font-medium text-muted-foreground">
                No financial activity yet
              </p>

              <p className="mt-1 text-xs text-muted-foreground/60">
                Your income and expenses will appear here once you add
                transactions.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Income */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Income</span>

                  <span className="text-sm font-semibold text-primary">
                    {formatCurrency(income, currency)}
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-foreground/5">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{
                      width: `${
                        income + expenses === 0
                          ? 0
                          : (income / (income + expenses)) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>

              {/* Expenses */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Expenses
                  </span>

                  <span className="text-sm font-semibold text-red-400">
                    {formatCurrency(expenses, currency)}
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-foreground/5">
                  <div
                    className="h-full rounded-full bg-red-400 transition-all duration-500"
                    style={{
                      width: `${
                        income + expenses === 0
                          ? 0
                          : (expenses / (income + expenses)) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div className="rounded-xl border border-border/50 bg-foreground/[0.03] p-4">
                <p className="text-xs text-muted-foreground">Net balance</p>

                <p
                  className={`mt-1 text-xl font-bold ${
                    balance >= 0 ? "text-primary" : "text-red-400"
                  }`}
                >
                  {formatCurrency(balance, currency)}
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Spending Breakdown */}
        <section className="flex-1 rounded-2xl border border-border bg-card/60 p-5">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <PieChart size={19} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Spending Breakdown
              </h2>

              <p className="text-sm text-muted-foreground">
                Where your money is going.
              </p>
            </div>
          </div>

          {spendingBreakdown.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border px-5 py-10 text-center">
              <Receipt
                size={30}
                className="mx-auto mb-3 text-muted-foreground/50"
              />

              <p className="text-sm font-medium text-muted-foreground">
                No spending to analyze
              </p>

              <p className="mt-1 text-xs text-muted-foreground/60">
                Expense categories will appear here as you spend.
              </p>
            </div>
          ) : (
            <div className="max-h-51 space-y-4 overflow-y-auto overscroll-contain pr-2 [scrollbar-color:#4FAF7B_transparent] [scrollbar-width:thin]">
              {spendingBreakdown.map(([category, amount]) => {
                const percentage =
                  totalCategorySpending === 0
                    ? 0
                    : (amount / totalCategorySpending) * 100;

                return (
                  <div key={category}>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {category}
                      </span>

                      <span className="text-sm font-medium text-foreground">
                        {formatCurrency(amount, currency)}
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-foreground/5">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>

                    <p className="mt-1 text-right text-xs text-muted-foreground/60">
                      {percentage.toFixed(0)}%
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Recent Transactions + Add Transaction */}
      <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* Recent Transactions */}
        <section className="flex-1 rounded-2xl border border-border bg-card/60 p-5">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-foreground">
              Recent Transactions
            </h2>

            <p className="text-sm text-muted-foreground">
              Your latest financial activity
            </p>
          </div>

          <div className="space-y-3">
            {transactions.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border px-5 py-10 text-center">
                <Receipt
                  size={30}
                  className="mx-auto mb-3 text-muted-foreground/50"
                />

                <p className="text-sm font-medium text-muted-foreground">
                  Your transactions will appear here
                </p>

                <p className="mt-1 text-xs text-muted-foreground/60">
                  Start by adding your first income or expense.
                </p>

                <Link
                  to="/transactions"
                  className="mt-4 inline-block text-xs font-medium text-primary transition hover:text-primary/80"
                >
                  Go to Transactions →
                </Link>
              </div>
            ) : (
              <>
                {[...transactions]
                  .sort((a, b) => {
                    const dateDifference =
                      new Date(b.date).getTime() - new Date(a.date).getTime();

                    if (dateDifference !== 0) {
                      return dateDifference;
                    }

                    return b.id - a.id;
                  })
                  .slice(0, 3)
                  .map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between rounded-xl border border-border/50 bg-foreground/[0.03] p-4 transition hover:bg-foreground/[0.05]"
                    >
                      <div>
                        <p className="font-medium text-foreground">
                          {transaction.description}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          {transaction.category} ·{" "}
                          {formatDate(transaction.date, dateFormat)}
                        </p>
                      </div>

                      <span
                        className={
                          transaction.type === "income"
                            ? "font-semibold text-primary"
                            : "font-semibold text-red-400"
                        }
                      >
                        {transaction.type === "income" ? "+" : "-"}
                        {formatCurrency(transaction.amount, currency)}
                      </span>
                    </div>
                  ))}

                {transactions.length > 3 && (
                  <div className="pt-2 text-center">
                    <Link
                      to="/transactions"
                      className="text-sm font-medium text-primary transition hover:text-primary/80"
                    >
                      View All Transactions →
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* Add Transaction */}
        <div className="flex-1">
          <AddTransaction />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
