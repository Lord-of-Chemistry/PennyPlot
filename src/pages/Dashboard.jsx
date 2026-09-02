import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AddTransaction from "@/components/AddTransaction";
import { Link, useOutletContext } from "react-router-dom";
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
  const { transactions } = useOutletContext();

  const income = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((total, transaction) => total + transaction.amount, 0);

  const expenses = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((total, transaction) => total + transaction.amount, 0);

  const balance = income - expenses;
  const savings = balance > 0 ? balance : 0;

  function formatCurrency(amount) {
    return `₦${amount.toLocaleString("en-NG")}`;
  }

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
    .slice(0, 5);

  const totalCategorySpending = expenses;

  const cards = [
    {
      title: "Total Balance",
      value: formatCurrency(balance),
      description: "Current available balance",
      icon: Wallet,
      color: "text-[#049552]",
    },
    {
      title: "Income",
      value: formatCurrency(income),
      description: "Total money received",
      icon: TrendingUp,
      color: "text-[#049552]",
    },
    {
      title: "Expenses",
      value: formatCurrency(expenses),
      description: "Total money spent",
      icon: TrendingDown,
      color: "text-red-400",
    },
    {
      title: "Savings",
      value: formatCurrency(savings),
      description: "Current savings",
      icon: PiggyBank,
      color: "text-[#049552]",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0f1714]">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-400">
          Here's your financial overview.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <Card
              key={card.title}
              className="border-white/10 bg-[#22332b]/60 transition-all duration-200 hover:-translate-y-1 hover:border-[#049552]/30 hover:bg-[#049552]/10"
            >
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-sm font-medium text-gray-400">
                  {card.title}
                </CardTitle>

                <Icon size={20} className={card.color} />
              </CardHeader>

              <CardContent>
                <p className={`text-3xl font-bold ${card.color}`}>
                  {card.value}
                </p>

                <p className="mt-3 text-xs text-gray-500">{card.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* This Month */}
      <section className="mt-8 rounded-2xl border border-white/10 bg-[#22332b]/40 p-5">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#049552]/10 text-[#049552]">
            <CalendarDays size={19} />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white">This Month</h2>

            <p className="text-sm text-gray-500">
              Your financial activity for{" "}
              {now.toLocaleString("en-US", { month: "long" })}
            </p>
          </div>
        </div>

        {thisMonthTransactions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 px-5 py-8 text-center">
            <CalendarDays size={28} className="mx-auto mb-3 text-gray-600" />

            <p className="text-sm font-medium text-gray-400">
              Nothing recorded this month
            </p>

            <p className="mt-1 text-xs text-gray-600">
              Add a transaction to start tracking this month's activity.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {/* Monthly Income */}
            <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400">Income</p>

                <ArrowUpRight size={17} className="text-[#049552]" />
              </div>

              <p className="mt-3 text-2xl font-bold text-[#049552]">
                {formatCurrency(monthlyIncome)}
              </p>
            </div>

            {/* Monthly Expenses */}
            <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400">Expenses</p>

                <ArrowDownRight size={17} className="text-red-400" />
              </div>

              <p className="mt-3 text-2xl font-bold text-red-400">
                {formatCurrency(monthlyExpenses)}
              </p>
            </div>

            {/* Monthly Net */}
            <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400">Net</p>

                <Wallet
                  size={17}
                  className={
                    monthlyNet >= 0 ? "text-[#049552]" : "text-red-400"
                  }
                />
              </div>

              <p
                className={`mt-3 text-2xl font-bold ${
                  monthlyNet >= 0 ? "text-[#049552]" : "text-red-400"
                }`}
              >
                {formatCurrency(monthlyNet)}
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Income vs Expenses + Spending Breakdown */}
      <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* Income vs Expenses */}
        <section className="flex-1 rounded-2xl border border-white/10 bg-[#22332b]/40 p-5">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white">
              Income vs Expenses
            </h2>

            <p className="text-sm text-gray-500">
              Compare your overall money coming in and going out.
            </p>
          </div>

          {income === 0 && expenses === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 px-5 py-10 text-center">
              <TrendingUp size={30} className="mx-auto mb-3 text-gray-600" />

              <p className="text-sm font-medium text-gray-400">
                No financial activity yet
              </p>

              <p className="mt-1 text-xs text-gray-600">
                Your income and expenses will appear here once you add
                transactions.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Income */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-gray-400">Income</span>

                  <span className="text-sm font-semibold text-[#049552]">
                    {formatCurrency(income)}
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-[#049552] transition-all duration-500"
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
                  <span className="text-sm text-gray-400">Expenses</span>

                  <span className="text-sm font-semibold text-red-400">
                    {formatCurrency(expenses)}
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-white/5">
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

              <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
                <p className="text-xs text-gray-500">Net balance</p>

                <p
                  className={`mt-1 text-xl font-bold ${
                    balance >= 0 ? "text-[#049552]" : "text-red-400"
                  }`}
                >
                  {formatCurrency(balance)}
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Spending Breakdown */}
        <section className="flex-1 rounded-2xl border border-white/10 bg-[#22332b]/40 p-5">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#049552]/10 text-[#049552]">
              <PieChart size={19} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white">
                Spending Breakdown
              </h2>

              <p className="text-sm text-gray-500">
                Where your money is going.
              </p>
            </div>
          </div>

          {spendingBreakdown.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 px-5 py-10 text-center">
              <Receipt size={30} className="mx-auto mb-3 text-gray-600" />

              <p className="text-sm font-medium text-gray-400">
                No spending to analyze
              </p>

              <p className="mt-1 text-xs text-gray-600">
                Expense categories will appear here as you spend.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {spendingBreakdown.map(([category, amount]) => {
                const percentage =
                  totalCategorySpending === 0
                    ? 0
                    : (amount / totalCategorySpending) * 100;

                return (
                  <div key={category}>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm text-gray-300">{category}</span>

                      <span className="text-sm font-medium text-white">
                        {formatCurrency(amount)}
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full bg-[#049552]"
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>

                    <p className="mt-1 text-right text-xs text-gray-600">
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
        <section className="flex-1 rounded-2xl border border-white/10 bg-[#22332b]/40 p-5">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-white">
              Recent Transactions
            </h2>

            <p className="text-sm text-gray-500">
              Your latest financial activity
            </p>
          </div>

          <div className="space-y-3">
            {transactions.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 px-5 py-10 text-center">
                <Receipt size={30} className="mx-auto mb-3 text-gray-600" />

                <p className="text-sm font-medium text-gray-400">
                  Your transactions will appear here
                </p>

                <p className="mt-1 text-xs text-gray-600">
                  Start by adding your first income or expense.
                </p>

                <Link
                  to="/transactions"
                  className="mt-4 inline-block text-xs font-medium text-[#049552] transition hover:text-[#05b864]"
                >
                  Go to Transactions →
                </Link>
              </div>
            ) : (
              <>
                {transactions.slice(0, 3).map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] p-4 transition hover:bg-white/[0.05]"
                  >
                    <div>
                      <p className="font-medium text-white">
                        {transaction.description}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {transaction.category} · {transaction.date}
                      </p>
                    </div>

                    <span
                      className={
                        transaction.type === "income"
                          ? "font-semibold text-[#049552]"
                          : "font-semibold text-red-400"
                      }
                    >
                      {transaction.type === "income" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </span>
                  </div>
                ))}

                {transactions.length > 3 && (
                  <div className="pt-2 text-center">
                    <Link
                      to="/transactions"
                      className="text-sm font-medium text-[#049552] transition hover:text-[#05b864]"
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
