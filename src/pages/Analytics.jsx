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
  ChevronLeft,
  ChevronRight,
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

  const CHART_VISIBLE_PERIODS = 8;

  const [chartStartIndex, setChartStartIndex] = useState(0);
  const [showAllHistory, setShowAllHistory] = useState(false);

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

  /*
   * VALID TRANSACTIONS
   */
  const validTransactions = useMemo(() => {
    return transactions
      .map((transaction) => ({
        ...transaction,
        parsedDate: new Date(transaction.date),
        numericAmount: Number(transaction.amount) || 0,
      }))
      .filter((transaction) => !Number.isNaN(transaction.parsedDate.getTime()));
  }, [transactions]);

  /*
   * TOTALS
   */
  const { income, expenses } = useMemo(() => {
    let totalIncome = 0;
    let totalExpenses = 0;

    for (const transaction of validTransactions) {
      if (transaction.type === "income") {
        totalIncome += transaction.numericAmount;
      } else if (transaction.type === "expense") {
        totalExpenses += transaction.numericAmount;
      }
    }

    return {
      income: totalIncome,
      expenses: totalExpenses,
    };
  }, [validTransactions]);

  const balance = income - expenses;

  /*
   * PERIOD TIMELINE
   *
   * IMPORTANT:
   * We aggregate transactions ONCE instead of filtering
   * the entire transaction list for every single period.
   *
   * This is what prevents Daily mode from freezing with
   * several years of transaction data.
   */
  const periodData = useMemo(() => {
    if (validTransactions.length === 0) {
      return [];
    }

    const today = new Date();

    let earliestTransaction = validTransactions[0].parsedDate;
    let latestTransaction = validTransactions[0].parsedDate;

    for (const transaction of validTransactions) {
      if (transaction.parsedDate < earliestTransaction) {
        earliestTransaction = transaction.parsedDate;
      }

      if (transaction.parsedDate > latestTransaction) {
        latestTransaction = transaction.parsedDate;
      }
    }

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

    /*
     * Aggregate every transaction into its period.
     *
     * Map key = period start timestamp.
     */
    const periodTotals = new Map();

    for (const transaction of validTransactions) {
      const periodStart = getPeriodStart(transaction.parsedDate, period);

      const key = periodStart.getTime();

      const existing = periodTotals.get(key);

      if (existing) {
        if (transaction.type === "income") {
          existing.income += transaction.numericAmount;
        } else if (transaction.type === "expense") {
          existing.expenses += transaction.numericAmount;
        }
      } else {
        periodTotals.set(key, {
          income: transaction.type === "income" ? transaction.numericAmount : 0,

          expenses:
            transaction.type === "expense" ? transaction.numericAmount : 0,
        });
      }
    }

    /*
     * Build the complete timeline.
     *
     * This loop only creates the periods themselves.
     * It does NOT scan transactions.
     */
    const periods = [];

    let current = new Date(firstPeriodStart);

    while (current <= lastPeriodStart) {
      const start = new Date(current);
      const key = start.getTime();

      const totals = periodTotals.get(key) || {
        income: 0,
        expenses: 0,
      };

      periods.push({
        key,
        date: start,
        label: formatPeriodLabel(start, period),
        income: totals.income,
        expenses: totals.expenses,
        net: totals.income - totals.expenses,
      });

      current = movePeriod(start, period, 1);
    }

    return periods;
  }, [validTransactions, period]);

  /*
   * CURRENT PERIOD
   */
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

    const categories = {};

    for (const transaction of validTransactions) {
      if (transaction.type !== "expense") {
        continue;
      }

      if (
        transaction.parsedDate < currentPeriodStart ||
        transaction.parsedDate >= currentPeriodEnd
      ) {
        continue;
      }

      const category = transaction.category || "Other";

      categories[category] =
        (categories[category] || 0) + transaction.numericAmount;
    }

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
   */
  const averageSpending =
    periodData.length > 0
      ? periodData.reduce((total, item) => total + item.expenses, 0) /
        periodData.length
      : 0;

  /*
   * HIGHEST / LOWEST SPENDING PERIOD
   *
   * Uses a single pass instead of sorting the entire
   * periodData array.
   */
  const { highestSpendingPeriod, lowestSpendingPeriod } = useMemo(() => {
    let highest = null;
    let lowest = null;

    for (const item of periodData) {
      if (item.expenses > 0) {
        if (!highest || item.expenses > highest.expenses) {
          highest = item;
        }

        if (!lowest || item.expenses < lowest.expenses) {
          lowest = item;
        }
      }
    }

    return {
      highestSpendingPeriod: highest,
      lowestSpendingPeriod: lowest,
    };
  }, [periodData]);

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
      color: "#4FAF7B",
    },

    expenses: {
      label: "Expenses",
      color: "#D66B6B",
    },
  };

  /*
   * DYNAMIC CHART WIDTH
   */
  const chartWidth = Math.max(700, periodData.length * 90);

  /*
   * CHART HISTORY NAVIGATION
   */
  const chartEndIndex = Math.min(
    chartStartIndex + CHART_VISIBLE_PERIODS,
    periodData.length,
  );

  const visibleChartData = showAllHistory
    ? periodData
    : periodData.slice(chartStartIndex, chartEndIndex);

  const hasPreviousChartPeriods = chartStartIndex > 0;

  const hasNextChartPeriods =
    !showAllHistory && chartEndIndex < periodData.length;

  const latestChartStartIndex = Math.max(
    0,
    periodData.length - CHART_VISIBLE_PERIODS,
  );

  const isAtLatest =
    !showAllHistory && chartStartIndex >= latestChartStartIndex;

  const visibleStartPeriod =
    visibleChartData.length > 0 ? visibleChartData[0] : null;

  const visibleEndPeriod =
    visibleChartData.length > 0
      ? visibleChartData[visibleChartData.length - 1]
      : null;

  const chartRangeLabel =
    visibleStartPeriod && visibleEndPeriod
      ? visibleStartPeriod.date.getTime() === visibleEndPeriod.date.getTime()
        ? visibleStartPeriod.label
        : `${visibleStartPeriod.label} — ${visibleEndPeriod.label}`
      : "No history";

  function goToPreviousChartPeriods() {
    setShowAllHistory(false);

    setChartStartIndex((currentIndex) =>
      Math.max(0, currentIndex - CHART_VISIBLE_PERIODS),
    );
  }

  function goToNextChartPeriods() {
    setShowAllHistory(false);

    setChartStartIndex((currentIndex) => {
      const nextIndex = currentIndex + CHART_VISIBLE_PERIODS;

      const maximumStartIndex = Math.max(
        0,
        periodData.length - CHART_VISIBLE_PERIODS,
      );

      return Math.min(nextIndex, maximumStartIndex);
    });
  }

  function goToLatestChartPeriods() {
    setShowAllHistory(false);

    setChartStartIndex(latestChartStartIndex);
  }

  function toggleAllHistory() {
    setShowAllHistory((current) => !current);

    if (!showAllHistory) {
      setChartStartIndex(0);
    } else {
      setChartStartIndex(latestChartStartIndex);
    }
  }

  /*
   * RESET CHART WINDOW WHEN PERIOD CHANGES
   *
   * Also reacts when a new period is created by
   * newly imported/added transactions.
   */
  useEffect(() => {
    if (periodData.length === 0) {
      setChartStartIndex(0);
      setShowAllHistory(false);
      return;
    }

    setChartStartIndex(Math.max(0, periodData.length - CHART_VISIBLE_PERIODS));

    setShowAllHistory(false);
  }, [period, periodData.length]);

  /*
   * KEEP THE COMPACT CHART AT THE NEWEST PERIOD
   */
  useEffect(() => {
    const container = chartScrollRef.current;

    if (!container || showAllHistory) {
      return;
    }

    requestAnimationFrame(() => {
      container.scrollLeft = container.scrollWidth;
    });
  }, [period, chartStartIndex, showAllHistory, visibleChartData.length]);

  /*
   * EMPTY STATE
   */
  if (transactions.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Understand your financial patterns and spending habits.
          </p>
        </div>

        <div className="flex min-h-[500px] items-center justify-center rounded-3xl border border-border bg-card/40">
          <div className="max-w-md px-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <BarChart3 size={30} />
            </div>

            <h2 className="mt-5 text-xl font-semibold text-foreground">
              Your analytics are waiting
            </h2>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Add a few income and expense transactions and PennyPlot will start
              turning your activity into useful financial insights.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* HEADER */}
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>

          <p className="mt-1 text-sm text-muted-foreground">
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
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:bg-accent hover:text-foreground"
            }`}
          >
            <Download size={16} />

            <span>Download</span>

            <ChevronDown
              size={15}
              className={`transition-transform duration-200 ${
                isDownloadOpen
                  ? "rotate-180 text-primary"
                  : "text-muted-foreground"
              }`}
            />
          </button>

          <div
            className={`absolute right-0 top-[calc(100%+8px)] z-50 w-64 origin-top-right rounded-xl border border-border bg-popover p-1.5 shadow-2xl shadow-black/40 transition-all duration-200 ${
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
              className="group flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors duration-150 hover:bg-accent"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                <Download size={16} />
              </div>

              <div>
                <p className="text-sm font-medium text-foreground">CSV</p>

                <p className="mt-0.5 text-xs text-muted-foreground">
                  Analytics data
                </p>
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
              className="group flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors duration-150 hover:bg-accent"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                <span className="text-[10px] font-bold tracking-wide">PDF</span>
              </div>

              <div>
                <p className="text-sm font-medium text-foreground">PDF</p>

                <p className="mt-0.5 text-xs text-muted-foreground">
                  Analytics report
                </p>
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
              className="group flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors duration-150 hover:bg-accent"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <span className="text-[10px] font-bold tracking-wide">PNG</span>
              </div>

              <div>
                <p className="text-sm font-medium text-foreground">PNG</p>

                <p className="mt-0.5 text-xs text-muted-foreground">
                  Analytics snapshot
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* OVERVIEW CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border bg-card transition-all duration-200 hover:-translate-y-1 hover:border-primary/30">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Balance
            </CardTitle>

            <Wallet
              size={20}
              className={balance >= 0 ? "text-primary" : "text-destructive"}
            />
          </CardHeader>

          <CardContent>
            <p
              className={`text-2xl font-bold ${
                balance >= 0 ? "text-primary" : "text-destructive"
              }`}
            >
              {formatCurrency(balance, currency)}
            </p>

            <p className="mt-2 text-xs text-muted-foreground">
              Income minus expenses
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card transition-all duration-200 hover:-translate-y-1 hover:border-primary/30">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Income
            </CardTitle>

            <TrendingUp size={20} className="text-primary" />
          </CardHeader>

          <CardContent>
            <p className="text-2xl font-bold text-primary">
              {formatCurrency(income, currency)}
            </p>

            <p className="mt-2 text-xs text-muted-foreground">
              Total money received
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card transition-all duration-200 hover:-translate-y-1 hover:border-primary/30">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Expenses
            </CardTitle>

            <TrendingDown size={20} className="text-destructive" />
          </CardHeader>

          <CardContent>
            <p className="text-2xl font-bold text-destructive">
              {formatCurrency(expenses, currency)}
            </p>

            <p className="mt-2 text-xs text-muted-foreground">
              Total money spent
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card transition-all duration-200 hover:-translate-y-1 hover:border-primary/30">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Savings Rate
            </CardTitle>

            <PiggyBank
              size={20}
              className={savingsRate >= 0 ? "text-primary" : "text-destructive"}
            />
          </CardHeader>

          <CardContent>
            <p
              className={`text-2xl font-bold ${
                savingsRate >= 0 ? "text-primary" : "text-destructive"
              }`}
            >
              {Math.round(savingsRate)}%
            </p>

            <p className="mt-2 text-xs text-muted-foreground">
              {currentPeriod.label}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* INCOME VS EXPENSES */}
      <Card className="mt-6 border-border bg-card/70">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg text-foreground">
                Income vs Expenses
              </CardTitle>

              <p className="mt-1 text-sm text-muted-foreground">
                Compare your financial activity over time.
              </p>
            </div>

            <div className="flex flex-wrap rounded-xl border border-border bg-background/50 p-1">
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
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : "text-muted-foreground hover:text-foreground"
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
            <div className="rounded-xl border border-border/60 bg-background/40 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Income</p>

                <ArrowUpRight size={16} className="text-primary" />
              </div>

              <p className="mt-2 text-xl font-bold text-primary">
                {formatCurrency(currentPeriodData.income, currency)}
              </p>

              <p
                className={`mt-1 text-xs ${
                  comparison.incomeChange >= 0
                    ? "text-primary"
                    : "text-destructive"
                }`}
              >
                {formatPercent(comparison.incomeChange)} vs{" "}
                {currentPeriod.previous}
              </p>
            </div>

            <div className="rounded-xl border border-border/60 bg-background/40 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Expenses</p>

                <ArrowDownRight size={16} className="text-destructive" />
              </div>

              <p className="mt-2 text-xl font-bold text-destructive">
                {formatCurrency(currentPeriodData.expenses, currency)}
              </p>

              <p
                className={`mt-1 text-xs ${
                  comparison.expenseChange <= 0
                    ? "text-primary"
                    : "text-destructive"
                }`}
              >
                {formatPercent(comparison.expenseChange)} vs{" "}
                {currentPeriod.previous}
              </p>
            </div>

            <div className="rounded-xl border border-border/60 bg-background/40 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Net</p>

                {currentPeriodData.net >= 0 ? (
                  <TrendingUp size={16} className="text-primary" />
                ) : (
                  <TrendingDown size={16} className="text-destructive" />
                )}
              </div>

              <p
                className={`mt-2 text-xl font-bold ${
                  currentPeriodData.net >= 0
                    ? "text-primary"
                    : "text-destructive"
                }`}
              >
                {formatCurrency(currentPeriodData.net, currency)}
              </p>

              <p
                className={`mt-1 text-xs ${
                  comparison.netChange >= 0
                    ? "text-primary"
                    : "text-destructive"
                }`}
              >
                {formatPercent(comparison.netChange)} vs{" "}
                {currentPeriod.previous}
              </p>
            </div>
          </div>

          {/* CHART */}
          <div className="mt-8 overflow-hidden rounded-xl">
            {/* CHART NAVIGATION */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  {showAllHistory ? "Full history" : "Visible history"}
                </p>

                <p className="mt-1 text-sm font-semibold text-foreground">
                  {chartRangeLabel}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* PREVIOUS */}
                <button
                  type="button"
                  onClick={goToPreviousChartPeriods}
                  disabled={!hasPreviousChartPeriods}
                  className="flex items-center gap-1.5 rounded-lg border border-border bg-background/50 px-3 py-2 text-xs font-medium text-secondary-foreground transition-colors hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="View previous periods"
                >
                  <ChevronLeft size={14} />

                  <span>Previous</span>
                </button>

                {/* NEXT */}
                <button
                  type="button"
                  onClick={goToNextChartPeriods}
                  disabled={!hasNextChartPeriods}
                  className="flex items-center gap-1.5 rounded-lg border border-border bg-background/50 px-3 py-2 text-xs font-medium text-secondary-foreground transition-colors hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="View next periods"
                >
                  <span>Next</span>

                  <ChevronRight size={14} />
                </button>

                {/* LATEST */}
                <button
                  type="button"
                  onClick={goToLatestChartPeriods}
                  disabled={isAtLatest}
                  className="rounded-lg border border-border bg-background/50 px-3 py-2 text-xs font-medium text-secondary-foreground transition-colors hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Latest
                </button>

                {/* ALL HISTORY */}
                <button
                  type="button"
                  onClick={toggleAllHistory}
                  className={`rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                    showAllHistory
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : "border border-border bg-background/50 text-secondary-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  {showAllHistory ? "Compact view" : "View all history"}
                </button>
              </div>
            </div>

            {/* CHART */}
            <div className="overflow-hidden rounded-xl">
              <div
                ref={chartScrollRef}
                className="overflow-x-auto pb-2 [scrollbar-color:#4FAF7B_transparent] [scrollbar-width:thin]"
              >
                <div
                  style={{
                    width: showAllHistory
                      ? `${chartWidth}px`
                      : `${Math.max(700, visibleChartData.length * 90)}px`,
                    minWidth: "100%",
                  }}
                >
                  <ChartContainer
                    config={chartConfig}
                    className="h-[300px] w-full"
                  >
                    <LineChart
                      data={visibleChartData}
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
                        className="stroke-border/50"
                      />

                      <XAxis
                        dataKey="label"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={10}
                        interval={0}
                        className="text-xs"
                        tick={{
                          fill: "#98A39D",
                        }}
                      />

                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        width={60}
                        tick={{
                          fill: "#98A39D",
                        }}
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
                          stroke: "#F1F5F2",
                          strokeOpacity: 0.1,
                        }}
                        content={
                          <ChartTooltipContent
                            formatter={(value) =>
                              formatCurrency(value, currency)
                            }
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
                          fill: "#4FAF7B",
                          strokeWidth: 0,
                        }}
                        activeDot={{
                          r: 6,
                          strokeWidth: 3,
                          stroke: "#4FAF7B",
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
                          fill: "#D66B6B",
                          strokeWidth: 0,
                        }}
                        activeDot={{
                          r: 6,
                          strokeWidth: 3,
                          stroke: "#D66B6B",
                        }}
                      />
                    </LineChart>
                  </ChartContainer>
                </div>
              </div>

              {/* HISTORY POSITION */}
              <div className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <span>
                  {showAllHistory
                    ? `Showing all ${periodData.length} ${period}${
                        periodData.length === 1 ? "" : "s"
                      }`
                    : `Showing ${visibleChartData.length} of ${
                        periodData.length
                      } ${period}${periodData.length === 1 ? "" : "s"}`}
                </span>
              </div>

              {/* LEGEND */}
              <div className="mt-4 flex justify-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-primary" />

                  <span className="text-xs text-muted-foreground">Income</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-destructive" />

                  <span className="text-xs text-muted-foreground">
                    Expenses
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PERIOD INSIGHTS */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* SPENDING BREAKDOWN */}
        <Card className="border-border bg-card/70">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <PieChart size={19} />
              </div>

              <div>
                <CardTitle className="text-lg text-foreground">
                  Spending Breakdown
                </CardTitle>

                <p className="mt-1 text-sm text-muted-foreground">
                  Where your money is going {currentPeriod.description}.
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {topCategories.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border px-5 py-10 text-center">
                <Receipt
                  size={30}
                  className="mx-auto mb-3 text-muted-foreground/50"
                />

                <p className="text-sm font-medium text-muted-foreground">
                  No spending in this period
                </p>

                <p className="mt-1 text-xs text-muted-foreground/60">
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
                          <span className="truncate text-sm text-secondary-foreground">
                            {category}
                          </span>
                        </div>

                        <div className="shrink-0 text-right">
                          <span className="text-sm font-semibold text-foreground">
                            {formatCurrency(amount, currency)}
                          </span>

                          <span className="ml-2 text-xs text-muted-foreground">
                            {Math.round(percentage)}%
                          </span>
                        </div>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-700"
                          style={{
                            width: `${Math.min(percentage, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}

                {spendingBreakdown.length > 6 && (
                  <p className="pt-1 text-center text-xs text-muted-foreground/60">
                    Showing your top 6 categories.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* SPENDING INSIGHTS */}
        <Card className="border-border bg-card/70">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <BarChart3 size={19} />
              </div>

              <div>
                <CardTitle className="text-lg text-foreground">
                  Spending Insights
                </CardTitle>

                <p className="mt-1 text-sm text-muted-foreground">
                  A quick look at your spending patterns.
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {/* AVERAGE */}
              <div className="rounded-xl border border-border/60 bg-background/40 p-4">
                <p className="text-xs text-muted-foreground">
                  Average Spending
                </p>

                <p className="mt-2 text-lg font-bold text-foreground">
                  {formatCurrency(averageSpending, currency)}
                </p>

                <p className="mt-1 text-xs text-muted-foreground/60">
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
              <div className="rounded-xl border border-border/60 bg-background/40 p-4">
                <p className="text-xs text-muted-foreground">Top Category</p>

                <p className="mt-2 truncate text-lg font-bold text-foreground">
                  {topCategories[0]?.category || "—"}
                </p>

                <p className="mt-1 text-xs text-muted-foreground/60">
                  {topCategories[0]
                    ? formatCurrency(topCategories[0].amount, currency)
                    : "No spending"}
                </p>
              </div>

              {/* HIGHEST */}
              <div className="rounded-xl border border-border/60 bg-background/40 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Highest Spending
                  </p>

                  <ArrowUpRight size={15} className="text-destructive" />
                </div>

                <p className="mt-2 text-lg font-bold text-destructive">
                  {highestSpendingPeriod
                    ? formatCurrency(highestSpendingPeriod.expenses, currency)
                    : "—"}
                </p>

                <p className="mt-1 text-xs text-muted-foreground/60">
                  {highestSpendingPeriod
                    ? highestSpendingPeriod.label
                    : "No spending"}
                </p>
              </div>

              {/* LOWEST */}
              <div className="rounded-xl border border-border/60 bg-background/40 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Lowest Spending
                  </p>

                  <ArrowDownRight size={15} className="text-primary" />
                </div>

                <p className="mt-2 text-lg font-bold text-primary">
                  {lowestSpendingPeriod
                    ? formatCurrency(lowestSpendingPeriod.expenses, currency)
                    : "—"}
                </p>

                <p className="mt-1 text-xs text-muted-foreground/60">
                  {lowestSpendingPeriod
                    ? lowestSpendingPeriod.label
                    : "No spending"}
                </p>
              </div>
            </div>

            {/* SMART INSIGHT */}
            <div className="mt-4 rounded-xl border border-primary/10 bg-primary/5 p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">
                  {currentPeriodData.net > 0 ? (
                    <TrendingUp size={18} className="text-primary" />
                  ) : currentPeriodData.net < 0 ? (
                    <TrendingDown size={18} className="text-destructive" />
                  ) : (
                    <Minus size={18} className="text-muted-foreground" />
                  )}
                </div>

                <div>
                  <p className="text-sm font-medium text-foreground">
                    {currentPeriodData.net > 0
                      ? "You're spending within your income."
                      : currentPeriodData.net < 0
                        ? "Your expenses are currently higher than your income."
                        : "Your income and expenses are currently balanced."}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
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
      <Card className="mt-6 border-border bg-card/70">
        <CardContent className="p-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs text-muted-foreground">
                {currentPeriod.label}
              </p>

              <p className="mt-1 text-lg font-semibold text-foreground">
                {formatCurrency(currentPeriodData.net, currency)}
              </p>

              <p className="mt-1 text-xs text-muted-foreground/60">
                Net result
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Savings Rate</p>

              <p
                className={`mt-1 text-lg font-semibold ${
                  savingsRate >= 0 ? "text-primary" : "text-destructive"
                }`}
              >
                {Math.round(savingsRate)}%
              </p>

              <p className="mt-1 text-xs text-muted-foreground/60">
                Income kept after expenses
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Period Spending</p>

              <p className="mt-1 text-lg font-semibold text-destructive">
                {formatCurrency(currentPeriodExpenses, currency)}
              </p>

              <p className="mt-1 text-xs text-muted-foreground/60">
                Total expenses
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Analytics;
