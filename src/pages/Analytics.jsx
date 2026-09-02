import { useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Receipt,
  BarChart3,
  PieChart,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  XAxis,
  YAxis,
} from "recharts";

function Analytics() {
  const { transactions } = useOutletContext();

  function formatCurrency(amount) {
    return `₦${amount.toLocaleString("en-NG")}`;
  }

  // -----------------------------
  // OVERVIEW
  // -----------------------------

  const income = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((total, transaction) => total + transaction.amount, 0);

  const expenses = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((total, transaction) => total + transaction.amount, 0);

  const balance = income - expenses;

  // -----------------------------
  // MONTHLY DATA
  // -----------------------------

  const monthlyData = useMemo(() => {
    const months = {};

    transactions.forEach((transaction) => {
      const date = new Date(transaction.date);

      if (Number.isNaN(date.getTime())) return;

      const key = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      if (!months[key]) {
        months[key] = {
          key,
          month: date.toLocaleString("en-US", {
            month: "short",
          }),
          income: 0,
          expenses: 0,
        };
      }

      if (transaction.type === "income") {
        months[key].income += transaction.amount;
      } else {
        months[key].expenses += transaction.amount;
      }
    });

    return Object.values(months)
      .sort((a, b) => a.key.localeCompare(b.key))
      .slice(-6);
  }, [transactions]);

  // -----------------------------
  // CATEGORY DATA
  // -----------------------------

  const categoryData = useMemo(() => {
    const categories = {};

    transactions
      .filter((transaction) => transaction.type === "expense")
      .forEach((transaction) => {
        categories[transaction.category] =
          (categories[transaction.category] || 0) +
          transaction.amount;
      });

    return Object.entries(categories)
      .map(([category, amount]) => ({
        category,
        amount,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  const topCategories = categoryData.slice(0, 6);

  const topCategory = categoryData[0];

  // -----------------------------
  // CHART CONFIG
  // -----------------------------

  const monthlyChartConfig = {
    income: {
      label: "Income",
      color: "#049552",
    },
    expenses: {
      label: "Expenses",
      color: "#f87171",
    },
  };

  const categoryChartConfig = {
    amount: {
      label: "Spending",
      color: "#049552",
    },
  };

  // -----------------------------
  // EMPTY STATE
  // -----------------------------

  if (transactions.length === 0) {
    return (
      <div className="min-h-screen bg-[#0f1714]">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">
            Analytics
          </h1>

          <p className="mt-1 text-sm text-gray-400">
            Understand where your money is going.
          </p>
        </div>

        <div className="flex min-h-[500px] items-center justify-center rounded-3xl border border-white/10 bg-[#22332b]/40">
          <div className="max-w-md px-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#049552]/10 text-[#049552]">
              <BarChart3 size={30} />
            </div>

            <h2 className="mt-5 text-xl font-semibold text-white">
              Your analytics are waiting
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Add a few income and expense transactions and
              PennyPlot will start turning your activity into
              useful financial insights.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1714]">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          Analytics
        </h1>

        <p className="mt-1 text-sm text-gray-400">
          Understand your financial patterns and spending habits.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-white/10 bg-[#22332b]/60">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">
              Total Income
            </CardTitle>

            <TrendingUp
              size={20}
              className="text-[#049552]"
            />
          </CardHeader>

          <CardContent>
            <p className="text-2xl font-bold text-[#049552]">
              {formatCurrency(income)}
            </p>

            <p className="mt-2 text-xs text-gray-500">
              Money received
            </p>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-[#22332b]/60">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">
              Total Expenses
            </CardTitle>

            <TrendingDown
              size={20}
              className="text-red-400"
            />
          </CardHeader>

          <CardContent>
            <p className="text-2xl font-bold text-red-400">
              {formatCurrency(expenses)}
            </p>

            <p className="mt-2 text-xs text-gray-500">
              Money spent
            </p>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-[#22332b]/60">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">
              Net Balance
            </CardTitle>

            <Wallet
              size={20}
              className={
                balance >= 0
                  ? "text-[#049552]"
                  : "text-red-400"
              }
            />
          </CardHeader>

          <CardContent>
            <p
              className={`text-2xl font-bold ${
                balance >= 0
                  ? "text-[#049552]"
                  : "text-red-400"
              }`}
            >
              {formatCurrency(balance)}
            </p>

            <p className="mt-2 text-xs text-gray-500">
              Income minus expenses
            </p>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-[#22332b]/60">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">
              Transactions
            </CardTitle>

            <Receipt
              size={20}
              className="text-[#049552]"
            />
          </CardHeader>

          <CardContent>
            <p className="text-2xl font-bold text-white">
              {transactions.length}
            </p>

            <p className="mt-2 text-xs text-gray-500">
              Recorded transactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Income vs Expenses */}
      <Card className="mt-6 border-white/10 bg-[#22332b]/40">
        <CardHeader>
          <CardTitle className="text-lg text-white">
            Income vs Expenses
          </CardTitle>

          <p className="text-sm text-gray-500">
            Your financial activity across the last six active months.
          </p>
        </CardHeader>

        <CardContent>
          {monthlyData.length < 1 ? (
            <div className="flex h-[320px] items-center justify-center text-sm text-gray-500">
              Not enough date information to display this chart.
            </div>
          ) : (
            <ChartContainer
              config={monthlyChartConfig}
              className="h-[320px] w-full"
            >
              <LineChart
                data={monthlyData}
                margin={{
                  top: 10,
                  right: 10,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid
                  vertical={false}
                  stroke="rgba(255,255,255,0.06)"
                />

                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                />

                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  tickFormatter={(value) =>
                    `₦${Number(value).toLocaleString("en-NG")}`
                  }
                  width={85}
                />

                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) =>
                        formatCurrency(Number(value))
                      }
                    />
                  }
                />

                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="var(--color-income)"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{
                    r: 5,
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="var(--color-expenses)"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{
                    r: 5,
                  }}
                />
              </LineChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Spending Breakdown */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="border-white/10 bg-[#22332b]/40">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#049552]/10 text-[#049552]">
                <PieChart size={19} />
              </div>

              <div>
                <CardTitle className="text-lg text-white">
                  Spending Breakdown
                </CardTitle>

                <p className="text-sm text-gray-500">
                  Your expenses by category.
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {topCategories.length === 0 ? (
              <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
                <Receipt
                  size={30}
                  className="mb-3 text-gray-600"
                />

                <p className="text-sm font-medium text-gray-400">
                  No expenses yet
                </p>

                <p className="mt-1 max-w-xs text-xs text-gray-600">
                  Add an expense to start seeing your spending
                  breakdown.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-[180px_1fr] md:items-center">
                <ChartContainer
                  config={categoryChartConfig}
                  className="mx-auto h-[220px] w-full max-w-[220px]"
                >
                  <BarChart
                    data={topCategories}
                    layout="vertical"
                    margin={{
                      left: 0,
                      right: 10,
                      top: 5,
                      bottom: 5,
                    }}
                  >
                    <XAxis
                      type="number"
                      hide
                    />

                    <YAxis
                      type="category"
                      dataKey="category"
                      hide
                    />

                    <Bar
                      dataKey="amount"
                      radius={[0, 6, 6, 0]}
                    >
                      {topCategories.map((entry, index) => (
                        <Cell
                          key={`cell-${entry.category}`}
                          fill={
                            index === 0
                              ? "#049552"
                              : "rgba(4,149,82,0.45)"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>

                <div className="space-y-4">
                  {topCategories.map((item, index) => {
                    const percentage =
                      expenses > 0
                        ? (item.amount / expenses) * 100
                        : 0;

                    return (
                      <div key={item.category}>
                        <div className="mb-1.5 flex items-center justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-2">
                            <span className="text-xs text-gray-600">
                              {index + 1}
                            </span>

                            <span className="truncate text-sm text-gray-300">
                              {item.category}
                            </span>
                          </div>

                          <span className="shrink-0 text-sm font-medium text-white">
                            {formatCurrency(item.amount)}
                          </span>
                        </div>

                        <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                          <div
                            className="h-full rounded-full bg-[#049552]"
                            style={{
                              width: `${percentage}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Spending Insight */}
        <Card className="border-white/10 bg-[#22332b]/40">
          <CardHeader>
            <CardTitle className="text-lg text-white">
              Spending Insight
            </CardTitle>

            <p className="text-sm text-gray-500">
              A quick look at your biggest expense.
            </p>
          </CardHeader>

          <CardContent>
            {!topCategory ? (
              <div className="flex min-h-[260px] flex-col items-center justify-center text-center">
                <BarChart3
                  size={30}
                  className="mb-3 text-gray-600"
                />

                <p className="text-sm font-medium text-gray-400">
                  No spending insight yet
                </p>

                <p className="mt-1 max-w-xs text-xs text-gray-600">
                  Your biggest spending category will appear here.
                </p>
              </div>
            ) : (
              <div className="flex min-h-[260px] flex-col justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    Biggest spending category
                  </p>

                  <p className="mt-2 text-3xl font-bold text-white">
                    {topCategory.category}
                  </p>

                  <p className="mt-2 text-2xl font-semibold text-[#049552]">
                    {formatCurrency(topCategory.amount)}
                  </p>

                  <p className="mt-2 text-sm text-gray-500">
                    {expenses > 0
                      ? `${(
                          (topCategory.amount / expenses) *
                          100
                        ).toFixed(0)}% of your total expenses`
                      : "No expenses recorded"}
                  </p>
                </div>

                <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
                  <p className="text-xs leading-5 text-gray-500">
                    Keep an eye on this category as you continue
                    recording transactions. Your spending patterns
                    will become clearer over time.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Analytics;