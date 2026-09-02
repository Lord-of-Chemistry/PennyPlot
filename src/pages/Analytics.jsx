import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Receipt,
  BarChart3,
  PieChart,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";

function Analytics() {
  const { transactions } = useOutletContext();

  const [period, setPeriod] = useState("monthly");

  function formatCurrency(amount) {
    return `₦${Number(amount || 0).toLocaleString("en-NG")}`;
  }

  function formatPercent(value) {
    if (!Number.isFinite(value)) return "0%";

    return `${value >= 0 ? "+" : ""}${Math.round(value)}%`;
  }

  const income = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((total, transaction) => total + Number(transaction.amount), 0);

  const expenses = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((total, transaction) => total + Number(transaction.amount), 0);

  const balance = income - expenses;

  /*
    Get the start of a given period.
  */
  function getPeriodStart(date, selectedPeriod) {
    const result = new Date(date);

    if (selectedPeriod === "daily") {
      result.setHours(0, 0, 0, 0);
    }

    if (selectedPeriod === "weekly") {
      const day = result.getDay();
      const difference = day === 0 ? 6 : day - 1;

      result.setDate(result.getDate() - difference);
      result.setHours(0, 0, 0, 0);
    }

    if (selectedPeriod === "monthly") {
      result.setDate(1);
      result.setHours(0, 0, 0, 0);
    }

    if (selectedPeriod === "yearly") {
      result.setMonth(0, 1);
      result.setHours(0, 0, 0, 0);
    }

    return result;
  }

  /*
    Add/subtract one period.
  */
  function movePeriod(date, selectedPeriod, amount) {
    const result = new Date(date);

    if (selectedPeriod === "daily") {
      result.setDate(result.getDate() + amount);
    }

    if (selectedPeriod === "weekly") {
      result.setDate(result.getDate() + amount * 7);
    }

    if (selectedPeriod === "monthly") {
      result.setMonth(result.getMonth() + amount);
    }

    if (selectedPeriod === "yearly") {
      result.setFullYear(result.getFullYear() + amount);
    }

    return result;
  }

  /*
    Format the label shown on the chart.
  */
  function formatPeriodLabel(date, selectedPeriod) {
    if (selectedPeriod === "daily") {
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        day: "numeric",
      });
    }

    if (selectedPeriod === "weekly") {
      return `Week ${date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
      })}`;
    }

    if (selectedPeriod === "monthly") {
      return date.toLocaleDateString("en-US", {
        month: "short",
      });
    }

    return date.getFullYear().toString();
  }

  /*
    Build the chart data based on the selected period.
  */
  const periodData = useMemo(() => {
    const validTransactions = transactions
      .map((transaction) => {
        const date = new Date(transaction.date);

        return {
          ...transaction,
          parsedDate: date,
          numericAmount: Number(transaction.amount) || 0,
        };
      })
      .filter((transaction) => !Number.isNaN(transaction.parsedDate.getTime()));

    if (validTransactions.length === 0) {
      return [];
    }

    const latestDate = validTransactions.reduce(
      (latest, transaction) =>
        transaction.parsedDate > latest ? transaction.parsedDate : latest,
      validTransactions[0].parsedDate,
    );

    const currentPeriodStart = getPeriodStart(latestDate, period);

    /*
      Show:
      Daily   → last 7 days
      Weekly  → last 8 weeks
      Monthly → last 6 months
      Yearly   → last 5 years
    */
    const numberOfPeriods =
      period === "daily"
        ? 7
        : period === "weekly"
          ? 8
          : period === "monthly"
            ? 6
            : 5;

    const periods = [];

    for (let i = numberOfPeriods - 1; i >= 0; i--) {
      const start = movePeriod(currentPeriodStart, period, -i);

      const end = movePeriod(start, period, 1);

      const periodTransactions = validTransactions.filter(
        (transaction) =>
          transaction.parsedDate >= start && transaction.parsedDate < end,
      );

      const periodIncome = periodTransactions
        .filter((transaction) => transaction.type === "income")
        .reduce((total, transaction) => total + transaction.numericAmount, 0);

      const periodExpenses = periodTransactions
        .filter((transaction) => transaction.type === "expense")
        .reduce((total, transaction) => total + transaction.numericAmount, 0);

      periods.push({
        key: start.toISOString(),
        date: start,
        label: formatPeriodLabel(start, period),
        income: periodIncome,
        expenses: periodExpenses,
      });
    }

    return periods;
  }, [transactions, period]);

  /*
    Current and previous period comparison.
  */
  const comparison = useMemo(() => {
    if (periodData.length < 2) {
      return {
        incomeChange: 0,
        expenseChange: 0,
        netChange: 0,
        hasPrevious: false,
      };
    }

    const current = periodData[periodData.length - 1];
    const previous = periodData[periodData.length - 2];

    function calculateChange(currentValue, previousValue) {
      if (previousValue === 0) {
        if (currentValue === 0) return 0;
        return 100;
      }

      return ((currentValue - previousValue) / previousValue) * 100;
    }

    return {
      incomeChange: calculateChange(current.income, previous.income),

      expenseChange: calculateChange(current.expenses, previous.expenses),

      netChange: calculateChange(
        current.income - current.expenses,
        previous.income - previous.expenses,
      ),

      hasPrevious: true,
    };
  }, [periodData]);

  /*
    Category spending.
  */
  const categoryData = useMemo(() => {
    const categories = {};

    transactions
      .filter((transaction) => transaction.type === "expense")
      .forEach((transaction) => {
        const amount = Number(transaction.amount) || 0;

        categories[transaction.category] =
          (categories[transaction.category] || 0) + amount;
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

  const periodNames = {
    daily: {
      label: "Today",
      previous: "yesterday",
      description: "daily",
    },

    weekly: {
      label: "This Week",
      previous: "last week",
      description: "weekly",
    },

    monthly: {
      label: "This Month",
      previous: "last month",
      description: "monthly",
    },

    yearly: {
      label: "This Year",
      previous: "last year",
      description: "yearly",
    },
  };

  const currentPeriod = periodNames[period];

  const chartConfig = {
    income: {
      label: "Income",
      color: "#049552",
    },

    expenses: {
      label: "Expenses",
      color: "#f87171",
    },
  };

  /*
    Empty state.
  */
  if (transactions.length === 0) {
    return (
      <div className="min-h-screen bg-[#0f1714]">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Analytics</h1>

          <p className="mt-1 text-sm text-gray-400">
            Understand your financial patterns and spending habits.
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
              Add a few income and expense transactions and PennyPlot will start
              turning your activity into useful financial insights.
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
        <h1 className="text-3xl font-bold text-white">Analytics</h1>

        <p className="mt-1 text-sm text-gray-400">
          Understand your financial patterns and spending habits.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-white/10 bg-[#22332b]/40">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Income</p>

                <p className="mt-2 text-2xl font-bold text-white">
                  {formatCurrency(income)}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#049552]/10 text-[#049552]">
                <TrendingUp size={20} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-[#22332b]/40">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Expenses</p>

                <p className="mt-2 text-2xl font-bold text-white">
                  {formatCurrency(expenses)}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
                <TrendingDown size={20} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-[#22332b]/40">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Net Balance</p>

                <p
                  className={`mt-2 text-2xl font-bold ${
                    balance >= 0 ? "text-[#049552]" : "text-red-400"
                  }`}
                >
                  {formatCurrency(balance)}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 text-gray-300">
                <Wallet size={20} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-[#22332b]/40">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Transactions</p>

                <p className="mt-2 text-2xl font-bold text-white">
                  {transactions.length}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#049552]/10 text-[#049552]">
                <Receipt size={20} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Income vs Expenses */}
      <Card className="mt-6 border-white/10 bg-[#22332b]/40">
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <CardTitle className="text-lg text-white">
                Income vs Expenses
              </CardTitle>

              <p className="mt-1 text-sm text-gray-500">
                Compare your financial activity over time.
              </p>
            </div>

            {/* Period Selector */}
            <div className="flex w-full rounded-xl border border-white/10 bg-[#0f1714] p-1 lg:w-auto">
              {["daily", "weekly", "monthly", "yearly"].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setPeriod(item)}
                  className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium capitalize transition sm:px-4 ${
                    period === item
                      ? "bg-[#049552] text-white shadow-lg shadow-[#049552]/20"
                      : "text-gray-500 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Comparison Insight */}
          {comparison.hasPrevious && (
            <div className="mb-6 grid gap-3 sm:grid-cols-2">
              {/* Income comparison */}
              <div className="rounded-2xl border border-white/10 bg-[#0f1714]/60 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Income</p>

                    <p className="mt-1 text-sm text-gray-300">
                      {formatPercent(comparison.incomeChange)}{" "}
                      {comparison.incomeChange >= 0 ? "higher" : "lower"} than{" "}
                      {currentPeriod.previous}
                    </p>
                  </div>

                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                      comparison.incomeChange >= 0
                        ? "bg-[#049552]/10 text-[#049552]"
                        : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    {comparison.incomeChange >= 0 ? (
                      <TrendingUp size={17} />
                    ) : (
                      <TrendingDown size={17} />
                    )}
                  </div>
                </div>
              </div>

              {/* Expense comparison */}
              <div className="rounded-2xl border border-white/10 bg-[#0f1714]/60 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Expenses</p>

                    <p className="mt-1 text-sm text-gray-300">
                      {formatPercent(comparison.expenseChange)}{" "}
                      {comparison.expenseChange >= 0 ? "higher" : "lower"} than{" "}
                      {currentPeriod.previous}
                    </p>
                  </div>

                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                      comparison.expenseChange <= 0
                        ? "bg-[#049552]/10 text-[#049552]"
                        : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    {comparison.expenseChange <= 0 ? (
                      <TrendingDown size={17} />
                    ) : (
                      <TrendingUp size={17} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {periodData.length < 1 ? (
            <div className="flex h-[320px] items-center justify-center text-sm text-gray-500">
              Not enough date information to display this chart.
            </div>
          ) : (
            <ChartContainer config={chartConfig} className="h-[320px] w-full">
              <LineChart
                data={periodData}
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
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{
                    fill: "#6b7280",
                    fontSize: 12,
                  }}
                />

                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{
                    fill: "#6b7280",
                    fontSize: 12,
                  }}
                  tickFormatter={(value) =>
                    `₦${Number(value).toLocaleString("en-NG")}`
                  }
                  width={85}
                />

                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => formatCurrency(Number(value))}
                    />
                  }
                />

                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="var(--color-income)"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 5 }}
                />

                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="var(--color-expenses)"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Spending + Insight */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Spending Breakdown */}
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

                <p className="mt-1 text-sm text-gray-500">
                  Where your money is going.
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {topCategories.length === 0 ? (
              <div className="flex min-h-[280px] items-center justify-center text-center text-sm text-gray-500">
                No expense data yet.
              </div>
            ) : (
              <div className="space-y-5">
                {topCategories.map((item, index) => {
                  const percentage =
                    expenses > 0 ? (item.amount / expenses) * 100 : 0;

                  return (
                    <div key={item.category}>
                      <div className="mb-2 flex items-center justify-between gap-4">
                        <span className="text-sm text-gray-300">
                          {item.category}
                        </span>

                        <span className="text-sm font-medium text-white">
                          {formatCurrency(item.amount)}
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-white/5">
                        <div
                          className={`h-full rounded-full ${
                            index === 0 ? "bg-[#049552]" : "bg-[#049552]/40"
                          }`}
                          style={{
                            width: `${Math.min(percentage, 100)}%`,
                          }}
                        />
                      </div>

                      <p className="mt-1 text-xs text-gray-600">
                        {percentage.toFixed(1)}% of total expenses
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Spending Insight */}
        <Card className="border-white/10 bg-[#22332b]/40">
          <CardHeader>
            <CardTitle className="text-lg text-white">
              Spending Insight
            </CardTitle>

            <p className="mt-1 text-sm text-gray-500">
              A quick look at your financial habits.
            </p>
          </CardHeader>

          <CardContent>
            {!topCategory ? (
              <div className="flex min-h-[280px] items-center justify-center text-center text-sm text-gray-500">
                Add some expenses to unlock spending insights.
              </div>
            ) : (
              <div className="space-y-5">
                <div className="rounded-2xl border border-[#049552]/15 bg-[#049552]/5 p-5">
                  <p className="text-sm text-gray-500">Top spending category</p>

                  <p className="mt-2 text-2xl font-bold text-white">
                    {topCategory.category}
                  </p>

                  <p className="mt-1 text-sm text-gray-400">
                    {formatCurrency(topCategory.amount)} spent
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#0f1714]/60 p-5">
                  <p className="text-sm leading-6 text-gray-400">
                    {topCategory.category} accounts for{" "}
                    <span className="font-semibold text-white">
                      {expenses > 0
                        ? ((topCategory.amount / expenses) * 100).toFixed(1)
                        : 0}
                      %
                    </span>{" "}
                    of your total recorded expenses.
                  </p>
                </div>

                {comparison.hasPrevious && (
                  <div className="rounded-2xl border border-white/10 bg-[#0f1714]/60 p-5">
                    <p className="text-sm leading-6 text-gray-400">
                      Your income is{" "}
                      <span
                        className={
                          comparison.incomeChange >= 0
                            ? "font-semibold text-[#049552]"
                            : "font-semibold text-red-400"
                        }
                      >
                        {formatPercent(comparison.incomeChange)}
                      </span>{" "}
                      compared with {currentPeriod.previous}.
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Analytics;
