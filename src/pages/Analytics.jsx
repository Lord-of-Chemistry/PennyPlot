import { useEffect, useMemo, useState, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { formatCurrency } from "../utils/currency";
import { toast } from "sonner";
import { downloadAnalyticsCSV } from "../utils/exportAnalyticsCsv";
import { downloadAnalyticsPDF } from "../utils/exportAnalyticsPdf";
import { downloadAnalyticsPNG } from "../utils/exportAnalyticsPng";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Receipt,
  BarChart3,
  PieChart,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Download,
  ChevronDown,
} from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

function Analytics() {
  const { transactions, currency } = useOutletContext();
  const [period, setPeriod] = useState("monthly");
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const chartScrollRef = useRef(null);

  function formatPercent(value) {
    if (!Number.isFinite(value)) {
      return "0%";
    }

    return `${value >= 0 ? "+" : ""}${Math.round(value)}%`;
  }

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

  function formatPeriodLabel(date, selectedPeriod) {
    if (selectedPeriod === "daily") {
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        day: "numeric",
        month: "short",
      });
    }

    if (selectedPeriod === "weekly") {
      return date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
      });
    }

    if (selectedPeriod === "monthly") {
      return date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
    }

    return date.getFullYear().toString();
  }

  const validTransactions = useMemo(() => {
    return transactions
      .map((transaction) => ({
        ...transaction,
        parsedDate: new Date(transaction.date),
        numericAmount: Number(transaction.amount) || 0,
      }))
      .filter((transaction) => !Number.isNaN(transaction.parsedDate.getTime()));
  }, [transactions]);

  const income = validTransactions
    .filter((transaction) => transaction.type === "income")
    .reduce((total, transaction) => total + transaction.numericAmount, 0);

  const expenses = validTransactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((total, transaction) => total + transaction.numericAmount, 0);

  const balance = income - expenses;

  /*
   * COMPLETE PERIOD TIMELINE
   *
   * Starts at the earliest transaction period
   * and continues through the current period.
   *
   * Empty periods are intentionally preserved.
   */
  const periodData = useMemo(() => {
    if (validTransactions.length === 0) {
      return [];
    }

    const today = new Date();

    const earliestTransaction = validTransactions.reduce(
      (earliest, transaction) =>
        transaction.parsedDate < earliest ? transaction.parsedDate : earliest,
      validTransactions[0].parsedDate,
    );

    const latestTransaction = validTransactions.reduce(
      (latest, transaction) =>
        transaction.parsedDate > latest ? transaction.parsedDate : latest,
      validTransactions[0].parsedDate,
    );

    const firstPeriodStart = getPeriodStart(earliestTransaction, period);

    const currentPeriodStart = getPeriodStart(today, period);

    const latestTransactionPeriodStart = getPeriodStart(
      latestTransaction,
      period,
    );

    const lastPeriodStart =
      latestTransactionPeriodStart > currentPeriodStart
        ? latestTransactionPeriodStart
        : currentPeriodStart;

    const periods = [];
    let current = new Date(firstPeriodStart);

    while (current <= lastPeriodStart) {
      const start = new Date(current);
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
        key: start.getTime(),
        date: start,
        label: formatPeriodLabel(start, period),
        income: periodIncome,
        expenses: periodExpenses,
        net: periodIncome - periodExpenses,
      });

      current = end;
    }

    return periods;
  }, [validTransactions, period]);

  const currentPeriodData = periodData[periodData.length - 1] || {
    income: 0,
    expenses: 0,
    net: 0,
  };

  /*
   * COMPARISON
   */
  const comparison = useMemo(() => {
    if (periodData.length < 2) {
      return {
        incomeChange: 0,
        expenseChange: 0,
        netChange: 0,
      };
    }

    const current = periodData[periodData.length - 1];
    const previous = periodData[periodData.length - 2];

    function calculateChange(currentValue, previousValue) {
      if (previousValue === 0) {
        if (currentValue === 0) {
          return 0;
        }

        return 100;
      }

      return ((currentValue - previousValue) / Math.abs(previousValue)) * 100;
    }

    return {
      incomeChange: calculateChange(current.income, previous.income),
      expenseChange: calculateChange(current.expenses, previous.expenses),
      netChange: calculateChange(current.net, previous.net),
    };
  }, [periodData]);

  /*
   * PERIOD-AWARE SPENDING BREAKDOWN
   */
  const spendingBreakdown = useMemo(() => {
    const today = new Date();

    const currentPeriodStart = getPeriodStart(today, period);
    const currentPeriodEnd = movePeriod(currentPeriodStart, period, 1);

    const currentPeriodTransactions = validTransactions.filter(
      (transaction) =>
        transaction.parsedDate >= currentPeriodStart &&
        transaction.parsedDate < currentPeriodEnd &&
        transaction.type === "expense",
    );

    const categories = {};

    currentPeriodTransactions.forEach((transaction) => {
      const category = transaction.category || "Other";

      categories[category] =
        (categories[category] || 0) + transaction.numericAmount;
    });

    return Object.entries(categories)
      .map(([category, amount]) => ({
        category,
        amount,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [validTransactions, period]);

  const currentPeriodExpenses = currentPeriodData.expenses;

  const topCategories = spendingBreakdown.slice(0, 6);

  /*
   * SAVINGS RATE
   */
  const savingsRate =
    currentPeriodData.income > 0
      ? (currentPeriodData.net / currentPeriodData.income) * 100
      : 0;

  /*
   * AVERAGE SPENDING
   *
   * Includes empty periods so the average represents
   * the complete timeline.
   */
  const averageSpending =
    periodData.length > 0
      ? periodData.reduce((total, item) => total + item.expenses, 0) /
        periodData.length
      : 0;

  /*
   * HIGHEST / LOWEST SPENDING PERIOD
   */
  const highestSpendingPeriod =
    periodData.length > 0
      ? [...periodData].sort((a, b) => b.expenses - a.expenses)[0]
      : null;

  const spendingPeriods = periodData.filter((item) => item.expenses > 0);

  const lowestSpendingPeriod =
    spendingPeriods.length > 0
      ? [...spendingPeriods].sort((a, b) => a.expenses - b.expenses)[0]
      : null;

  /*
   * PERIOD NAME
   */
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

  /*
   * CHART CONFIG
   */
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
   * DYNAMIC CHART WIDTH
   *
   * The chart grows with the number of periods.
   * The outer container handles horizontal scrolling.
   */
  const chartWidth = Math.max(700, periodData.length * 90);

  /*
   * EMPTY STATE
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

  useEffect(() => {
    const container = chartScrollRef.current;

    if (!container) return;

    requestAnimationFrame(() => {
      container.scrollLeft = container.scrollWidth;
    });
  }, [period, periodData]);

  return (
    <div className="min-h-screen bg-[#0f1714]">
      {/* HEADER */}
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics</h1>

          <p className="mt-1 text-sm text-gray-400">
            Understand your financial patterns and spending habits.
          </p>
        </div>

        {/* DOWNLOAD */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setIsDownloadOpen((previous) => !previous)}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
              isDownloadOpen
                ? "border-[#049552] bg-[#049552]/10 text-[#8ff0bc]"
                : "border-white/10 bg-[#1b2922] text-gray-300 hover:border-white/20 hover:bg-[#22332b] hover:text-white"
            }`}
          >
            <Download size={16} />

            <span>Download</span>

            <ChevronDown
              size={15}
              className={`transition-transform duration-200 ${
                isDownloadOpen ? "rotate-180 text-[#049552]" : "text-gray-500"
              }`}
            />
          </button>

          <div
            className={`absolute right-0 top-[calc(100%+8px)] z-50 w-64 origin-top-right rounded-xl border border-white/10 bg-[#1b2922] p-1.5 shadow-2xl shadow-black/40 transition-all duration-200 ${
              isDownloadOpen
                ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
                : "pointer-events-none -translate-y-2 scale-95 opacity-0"
            }`}
          >
            {/* CSV */}
            <button
              type="button"
              onClick={() => {
                try {
                  downloadAnalyticsCSV(periodData, currency);
                  toast.success("Analytics exported successfully.");
                } catch (error) {
                  console.error("Analytics CSV export failed:", error);
                  toast.error("Failed to export analytics.");
                }

                setIsDownloadOpen(false);
              }}
              className="group flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors duration-150 hover:bg-white/[0.06]"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#049552]/10 text-[#8ff0bc] transition-colors group-hover:bg-[#049552]/15">
                <Download size={16} />
              </div>

              <div>
                <p className="text-sm font-medium text-white">CSV</p>

                <p className="mt-0.5 text-xs text-gray-500">Analytics data</p>
              </div>
            </button>

            {/* PDF */}
            <button
              type="button"
              onClick={async () => {
                try {
                  await downloadAnalyticsPDF(
                    periodData,
                    spendingBreakdown,
                    currency,
                    period,
                  );

                  toast.success("Analytics report exported successfully.");
                } catch (error) {
                  console.error("Analytics PDF export failed:", error);
                  toast.error("Failed to export analytics report.");
                }

                setIsDownloadOpen(false);
              }}
              className="group flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors duration-150 hover:bg-white/[0.06]"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#049552]/10 text-[#8ff0bc] transition-colors group-hover:bg-[#049552]/15">
                <span className="text-[10px] font-bold tracking-wide">PDF</span>
              </div>

              <div>
                <p className="text-sm font-medium text-white">PDF</p>

                <p className="mt-0.5 text-xs text-gray-500">Analytics report</p>
              </div>
            </button>

            {/* PNG */}
            <button
              type="button"
              onClick={async () => {
                try {
                  await downloadAnalyticsPNG(
                    periodData,
                    spendingBreakdown,
                    currency,
                    period,
                  );

                  toast.success("Analytics snapshot exported successfully.");
                } catch (error) {
                  console.error("Analytics PNG export failed:", error);
                  toast.error("Failed to export analytics snapshot.");
                }

                setIsDownloadOpen(false);
              }}
              className="group flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors duration-150 hover:bg-white/[0.06]"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#049552]/10 text-[#8ff0bc]">
                <span className="text-[10px] font-bold tracking-wide">PNG</span>
              </div>

              <div>
                <p className="text-sm font-medium text-white">PNG</p>

                <p className="mt-0.5 text-xs text-gray-500">
                  Analytics snapshot
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* OVERVIEW CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-white/10 bg-[#22332b]/60 transition-all duration-200 hover:-translate-y-1 hover:border-[#049552]/30">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">
              Total Balance
            </CardTitle>

            <Wallet
              size={20}
              className={balance >= 0 ? "text-[#049552]" : "text-red-400"}
            />
          </CardHeader>

          <CardContent>
            <p
              className={`text-2xl font-bold ${
                balance >= 0 ? "text-[#049552]" : "text-red-400"
              }`}
            >
              {formatCurrency(balance, currency)}
            </p>

            <p className="mt-2 text-xs text-gray-500">Income minus expenses</p>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-[#22332b]/60 transition-all duration-200 hover:-translate-y-1 hover:border-[#049552]/30">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">
              Total Income
            </CardTitle>

            <TrendingUp size={20} className="text-[#049552]" />
          </CardHeader>

          <CardContent>
            <p className="text-2xl font-bold text-[#049552]">
              {formatCurrency(income, currency)}
            </p>

            <p className="mt-2 text-xs text-gray-500">Total money received</p>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-[#22332b]/60 transition-all duration-200 hover:-translate-y-1 hover:border-red-400/30">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">
              Total Expenses
            </CardTitle>

            <TrendingDown size={20} className="text-red-400" />
          </CardHeader>

          <CardContent>
            <p className="text-2xl font-bold text-red-400">
              {formatCurrency(expenses, currency)}
            </p>

            <p className="mt-2 text-xs text-gray-500">Total money spent</p>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-[#22332b]/60 transition-all duration-200 hover:-translate-y-1 hover:border-[#049552]/30">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-medium text-gray-400">
              Savings Rate
            </CardTitle>

            <PiggyBank
              size={20}
              className={savingsRate >= 0 ? "text-[#049552]" : "text-red-400"}
            />
          </CardHeader>

          <CardContent>
            <p
              className={`text-2xl font-bold ${
                savingsRate >= 0 ? "text-[#049552]" : "text-red-400"
              }`}
            >
              {Math.round(savingsRate)}%
            </p>

            <p className="mt-2 text-xs text-gray-500">{currentPeriod.label}</p>
          </CardContent>
        </Card>
      </div>

      {/* INCOME VS EXPENSES */}
      <Card className="mt-6 border-white/10 bg-[#22332b]/40">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg text-white">
                Income vs Expenses
              </CardTitle>

              <p className="mt-1 text-sm text-gray-500">
                Compare your financial activity over time.
              </p>
            </div>

            <div className="flex flex-wrap rounded-xl border border-white/10 bg-white/[0.03] p-1">
              {[
                ["daily", "Daily"],
                ["weekly", "Weekly"],
                ["monthly", "Monthly"],
                ["yearly", "Yearly"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPeriod(value)}
                  className={`rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                    period === value
                      ? "bg-[#049552] text-white shadow-lg shadow-[#049552]/20"
                      : "text-gray-500 hover:text-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* COMPARISON CARDS */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">Income</p>
                <ArrowUpRight size={16} className="text-[#049552]" />
              </div>

              <p className="mt-2 text-xl font-bold text-[#049552]">
                {formatCurrency(currentPeriodData.income, currency)}
              </p>

              <p
                className={`mt-1 text-xs ${
                  comparison.incomeChange >= 0
                    ? "text-[#049552]"
                    : "text-red-400"
                }`}
              >
                {formatPercent(comparison.incomeChange)} vs{" "}
                {currentPeriod.previous}
              </p>
            </div>

            <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">Expenses</p>
                <ArrowDownRight size={16} className="text-red-400" />
              </div>

              <p className="mt-2 text-xl font-bold text-red-400">
                {formatCurrency(currentPeriodData.expenses, currency)}
              </p>

              <p
                className={`mt-1 text-xs ${
                  comparison.expenseChange <= 0
                    ? "text-[#049552]"
                    : "text-red-400"
                }`}
              >
                {formatPercent(comparison.expenseChange)} vs{" "}
                {currentPeriod.previous}
              </p>
            </div>

            <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">Net</p>

                {currentPeriodData.net >= 0 ? (
                  <TrendingUp size={16} className="text-[#049552]" />
                ) : (
                  <TrendingDown size={16} className="text-red-400" />
                )}
              </div>

              <p
                className={`mt-2 text-xl font-bold ${
                  currentPeriodData.net >= 0 ? "text-[#049552]" : "text-red-400"
                }`}
              >
                {formatCurrency(currentPeriodData.net, currency)}
              </p>

              <p
                className={`mt-1 text-xs ${
                  comparison.netChange >= 0 ? "text-[#049552]" : "text-red-400"
                }`}
              >
                {formatPercent(comparison.netChange)} vs{" "}
                {currentPeriod.previous}
              </p>
            </div>
          </div>

          {/* CHART */}
          <div className="mt-8 overflow-hidden rounded-xl">
            <div
              ref={chartScrollRef}
              className=" overflow-x-auto pb-2 [scrollbar-color:#049552_transparent] [scrollbar-width:thin]"
            >
              <div
                style={{
                  width: `${chartWidth}px`,
                  minWidth: "100%",
                }}
              >
                <ChartContainer
                  config={chartConfig}
                  className="h-[300px] w-full"
                >
                  <LineChart
                    data={periodData}
                    margin={{
                      top: 10,
                      right: 20,
                      left: 0,
                      bottom: 0,
                    }}
                  >
                    <CartesianGrid
                      vertical={false}
                      strokeDasharray="3 3"
                      className="stroke-white/5"
                    />

                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={10}
                      interval={0}
                      className="text-xs"
                    />

                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      width={60}
                      tickFormatter={(value) => {
                        const symbols = {
                          NGN: "₦",
                          USD: "$",
                          GBP: "£",
                          EUR: "€",
                        };

                        return `${symbols[currency] || "₦"}${Number(
                          value,
                        ).toLocaleString("en-NG", {
                          notation: "compact",
                        })}`;
                      }}
                    />

                    <ChartTooltip
                      cursor={{
                        stroke: "#ffffff",
                        strokeOpacity: 0.1,
                      }}
                      content={
                        <ChartTooltipContent
                          formatter={(value) => formatCurrency(value, currency)}
                        />
                      }
                    />

                    <Line
                      type="monotone"
                      dataKey="income"
                      name="Income"
                      stroke="var(--color-income)"
                      strokeWidth={3}
                      dot={{
                        r: 4,
                        fill: "#049552",
                        strokeWidth: 0,
                      }}
                      activeDot={{
                        r: 6,
                        strokeWidth: 3,
                        stroke: "#049552",
                      }}
                    />

                    <Line
                      type="monotone"
                      dataKey="expenses"
                      name="Expenses"
                      stroke="var(--color-expenses)"
                      strokeWidth={3}
                      dot={{
                        r: 4,
                        fill: "#f87171",
                        strokeWidth: 0,
                      }}
                      activeDot={{
                        r: 6,
                        strokeWidth: 3,
                        stroke: "#f87171",
                      }}
                    />
                  </LineChart>
                </ChartContainer>
              </div>
            </div>

            {/* LEGEND */}
            <div className="mt-4 flex justify-center gap-6">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#049552]" />
                <span className="text-xs text-gray-500">Income</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <span className="text-xs text-gray-500">Expenses</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PERIOD INSIGHTS */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* SPENDING BREAKDOWN */}
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
                  Where your money is going {currentPeriod.description}.
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {topCategories.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 px-5 py-10 text-center">
                <Receipt size={30} className="mx-auto mb-3 text-gray-600" />

                <p className="text-sm font-medium text-gray-400">
                  No spending in this period
                </p>

                <p className="mt-1 text-xs text-gray-600">
                  Expense categories will appear here when you spend money.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {topCategories.map(({ category, amount }) => {
                  const percentage =
                    currentPeriodExpenses === 0
                      ? 0
                      : (amount / currentPeriodExpenses) * 100;

                  return (
                    <div key={category}>
                      <div className="mb-2 flex items-center justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-2">
                          <span className="truncate text-sm text-gray-300">
                            {category}
                          </span>
                        </div>

                        <div className="shrink-0 text-right">
                          <span className="text-sm font-semibold text-white">
                            {formatCurrency(amount, currency)}
                          </span>

                          <span className="ml-2 text-xs text-gray-500">
                            {Math.round(percentage)}%
                          </span>
                        </div>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-white/5">
                        <div
                          className="h-full rounded-full bg-[#049552] transition-all duration-700"
                          style={{
                            width: `${Math.min(percentage, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}

                {spendingBreakdown.length > 6 && (
                  <p className="pt-1 text-center text-xs text-gray-600">
                    Showing your top 6 categories.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* SPENDING INSIGHTS */}
        <Card className="border-white/10 bg-[#22332b]/40">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#049552]/10 text-[#049552]">
                <BarChart3 size={19} />
              </div>

              <div>
                <CardTitle className="text-lg text-white">
                  Spending Insights
                </CardTitle>

                <p className="mt-1 text-sm text-gray-500">
                  A quick look at your spending patterns.
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {/* AVERAGE */}
              <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
                <p className="text-xs text-gray-500">Average Spending</p>

                <p className="mt-2 text-lg font-bold text-white">
                  {formatCurrency(averageSpending, currency)}
                </p>

                <p className="mt-1 text-xs text-gray-600">
                  Per{" "}
                  {period === "daily"
                    ? "day"
                    : period === "weekly"
                      ? "week"
                      : period === "monthly"
                        ? "month"
                        : "year"}
                </p>
              </div>

              {/* TOP CATEGORY */}
              <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
                <p className="text-xs text-gray-500">Top Category</p>

                <p className="mt-2 truncate text-lg font-bold text-white">
                  {topCategories[0]?.category || "—"}
                </p>

                <p className="mt-1 text-xs text-gray-600">
                  {topCategories[0]
                    ? formatCurrency(topCategories[0].amount, currency)
                    : "No spending"}
                </p>
              </div>

              {/* HIGHEST */}
              <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">Highest Spending</p>

                  <ArrowUpRight size={15} className="text-red-400" />
                </div>

                <p className="mt-2 text-lg font-bold text-red-400">
                  {highestSpendingPeriod
                    ? formatCurrency(highestSpendingPeriod.expenses, currency)
                    : "—"}
                </p>

                <p className="mt-1 text-xs text-gray-600">
                  {highestSpendingPeriod
                    ? highestSpendingPeriod.label
                    : "No spending"}
                </p>
              </div>

              {/* LOWEST */}
              <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">Lowest Spending</p>

                  <ArrowDownRight size={15} className="text-[#049552]" />
                </div>

                <p className="mt-2 text-lg font-bold text-[#049552]">
                  {lowestSpendingPeriod
                    ? formatCurrency(lowestSpendingPeriod.expenses, currency)
                    : "—"}
                </p>

                <p className="mt-1 text-xs text-gray-600">
                  {lowestSpendingPeriod
                    ? lowestSpendingPeriod.label
                    : "No spending"}
                </p>
              </div>
            </div>

            {/* SMART INSIGHT */}
            <div className="mt-4 rounded-xl border border-[#049552]/10 bg-[#049552]/5 p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">
                  {currentPeriodData.net > 0 ? (
                    <TrendingUp size={18} className="text-[#049552]" />
                  ) : currentPeriodData.net < 0 ? (
                    <TrendingDown size={18} className="text-red-400" />
                  ) : (
                    <Minus size={18} className="text-gray-500" />
                  )}
                </div>

                <div>
                  <p className="text-sm font-medium text-white">
                    {currentPeriodData.net > 0
                      ? "You're spending within your income."
                      : currentPeriodData.net < 0
                        ? "Your expenses are currently higher than your income."
                        : "Your income and expenses are currently balanced."}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    {topCategories[0]
                      ? `${topCategories[0].category} is your biggest spending category for ${currentPeriod.description} activity.`
                      : "Add more expense transactions to unlock more detailed spending insights."}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* PERIOD SUMMARY */}
      <Card className="mt-6 border-white/10 bg-[#22332b]/40">
        <CardContent className="p-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs text-gray-500">{currentPeriod.label}</p>

              <p className="mt-1 text-lg font-semibold text-white">
                {formatCurrency(currentPeriodData.net, currency)}
              </p>

              <p className="mt-1 text-xs text-gray-600">Net result</p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Savings Rate</p>

              <p
                className={`mt-1 text-lg font-semibold ${
                  savingsRate >= 0 ? "text-[#049552]" : "text-red-400"
                }`}
              >
                {Math.round(savingsRate)}%
              </p>

              <p className="mt-1 text-xs text-gray-600">
                Income kept after expenses
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Period Spending</p>

              <p className="mt-1 text-lg font-semibold text-red-400">
                {formatCurrency(currentPeriodExpenses, currency)}
              </p>

              <p className="mt-1 text-xs text-gray-600">Total expenses</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Analytics;
