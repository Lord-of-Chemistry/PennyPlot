import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  formatCurrency,
  getCurrencySymbol,
} from "../utils/currency";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { downloadBudgetsCSV } from "../utils/exportBudgetsCsv";
import { downloadBudgetsPDF } from "../utils/exportBudgetsPdf";
import { downloadBudgetsPNG } from "../utils/exportBudgetsPng";
import {
  Plus,
  Wallet,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  X,
  Trash2,
  ChevronDown,
  Download,
} from "lucide-react";

function Budgets() {
  const {
    transactions,
    currency,
  } = useOutletContext();

  const [budgets, setBudgets] = useState(() => {
    try {
      const savedBudgets = localStorage.getItem(
        "pennyplot-budgets",
      );

      return savedBudgets
        ? JSON.parse(savedBudgets)
        : [];
    } catch (error) {
      console.error(
        "Failed to load budgets:",
        error,
      );

      return [];
    }
  });

  const [showForm, setShowForm] =
    useState(false);

  const [category, setCategory] =
    useState("Food");

  const [amount, setAmount] =
    useState("");

  const [period, setPeriod] =
    useState("monthly");

  const [error, setError] =
    useState("");

  const [isDownloadOpen, setIsDownloadOpen] =
    useState(false);

  const categories = [
    "Food",
    "Transport",
    "Shopping",
    "Bills",
    "Entertainment",
    "Other",
  ];

  function formatAmount(value) {
    if (!value) return "";

    return Number(value).toLocaleString(
      "en-NG",
    );
  }

  function handleAmountChange(e) {
    const numbersOnly =
      e.target.value.replace(/\D/g, "");

    setAmount(numbersOnly);
  }

  function saveBudgets(updatedBudgets) {
    setBudgets(updatedBudgets);

    localStorage.setItem(
      "pennyplot-budgets",
      JSON.stringify(updatedBudgets),
    );
  }

  function handleCreateBudget(e) {
    e.preventDefault();

    setError("");

    const numericAmount =
      Number(amount);

    if (
      !numericAmount ||
      numericAmount <= 0
    ) {
      setError(
        "Please enter a valid budget amount.",
      );

      return;
    }

    const alreadyExists =
      budgets.some(
        (budget) =>
          budget.category ===
            category &&
          budget.period === period,
      );

    if (alreadyExists) {
      setError(
        `You already have a ${period} budget for ${category}.`,
      );

      return;
    }

    const newBudget = {
      id: Date.now(),
      category,
      amount: numericAmount,
      period,
    };

    saveBudgets([
      ...budgets,
      newBudget,
    ]);

    setAmount("");
    setCategory("Food");
    setPeriod("monthly");
    setError("");
    setShowForm(false);
  }

  function deleteBudget(id) {
    const updatedBudgets =
      budgets.filter(
        (budget) =>
          budget.id !== id,
      );

    saveBudgets(updatedBudgets);
  }

  function getBudgetSpent(budget) {
    const now = new Date();

    return transactions
      .filter(
        (transaction) =>
          transaction.type ===
            "expense" &&
          transaction.category ===
            budget.category,
      )
      .filter((transaction) => {
        const transactionDate =
          new Date(
            transaction.date,
          );

        if (
          Number.isNaN(
            transactionDate.getTime(),
          )
        ) {
          return false;
        }

        if (
          budget.period ===
          "monthly"
        ) {
          return (
            transactionDate.getMonth() ===
              now.getMonth() &&
            transactionDate.getFullYear() ===
              now.getFullYear()
          );
        }

        if (
          budget.period ===
          "yearly"
        ) {
          return (
            transactionDate.getFullYear() ===
            now.getFullYear()
          );
        }

        return false;
      })
      .reduce(
        (total, transaction) =>
          total +
          Number(
            transaction.amount || 0,
          ),
        0,
      );
  }

  const budgetData = useMemo(() => {
    return budgets.map((budget) => {
      const spent =
        getBudgetSpent(budget);

      const percentage =
        budget.amount > 0
          ? (spent /
              budget.amount) *
            100
          : 0;

      const remaining =
        budget.amount - spent;

      let status = "safe";

      if (percentage >= 100) {
        status = "exceeded";
      } else if (
        percentage >= 75
      ) {
        status = "warning";
      }

      return {
        ...budget,
        spent,
        percentage,
        remaining,
        status,
      };
    });
  }, [
    budgets,
    transactions,
  ]);

  const totalBudget =
    budgetData.reduce(
      (total, budget) =>
        total + budget.amount,
      0,
    );

  const totalSpent =
    budgetData.reduce(
      (total, budget) =>
        total + budget.spent,
      0,
    );

  const totalRemaining =
    totalBudget - totalSpent;

  const overallPercentage =
    totalBudget > 0
      ? (totalSpent /
          totalBudget) *
        100
      : 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Budgets
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Set spending limits and stay in control of your money.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          {budgetData.length > 0 && (
            <div className="relative">
              {/* Download button */}
              <button
                type="button"
                onClick={() =>
                  setIsDownloadOpen(
                    (prev) => !prev,
                  )
                }
                className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold text-muted-foreground transition hover:border-primary/30 hover:bg-accent hover:text-foreground"
              >
                <Download size={17} />

                Download

                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${
                    isDownloadOpen
                      ? "rotate-180"
                      : ""
                  }`}
                />
              </button>

              {/* Download dropdown */}
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
                      downloadBudgetsCSV(
                        budgetData,
                        currency,
                      );

                      toast.success(
                        "Budgets exported successfully.",
                      );
                    } catch (error) {
                      console.error(
                        "Budgets CSV export failed:",
                        error,
                      );

                      toast.error(
                        "Failed to export budgets.",
                      );
                    }

                    setIsDownloadOpen(
                      false,
                    );
                  }}
                  className="group flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors duration-150 hover:bg-foreground/[0.06]"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                    <Download size={16} />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-foreground">
                      CSV
                    </p>

                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Budget data
                    </p>
                  </div>
                </button>

                {/* PDF */}
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await downloadBudgetsPDF(
                        budgetData,
                        currency,
                      );

                      toast.success(
                        "Budget report exported successfully.",
                      );
                    } catch (error) {
                      console.error(
                        "Budgets PDF export failed:",
                        error,
                      );

                      toast.error(
                        "Failed to export budget report.",
                      );
                    }

                    setIsDownloadOpen(
                      false,
                    );
                  }}
                  className="group flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors duration-150 hover:bg-foreground/[0.06]"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                    <span className="text-[10px] font-bold tracking-wide">
                      PDF
                    </span>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-foreground">
                      PDF
                    </p>

                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Budget report
                    </p>
                  </div>
                </button>

                {/* PNG */}
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await downloadBudgetsPNG(
                        budgetData,
                        currency,
                      );

                      toast.success(
                        "Budget snapshot exported successfully.",
                      );
                    } catch (error) {
                      console.error(
                        "Budgets PNG export failed:",
                        error,
                      );

                      toast.error(
                        "Failed to export budget snapshot.",
                      );
                    }

                    setIsDownloadOpen(
                      false,
                    );
                  }}
                  className="group flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors duration-150 hover:bg-foreground/[0.06]"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                    <span className="text-[10px] font-bold tracking-wide">
                      PNG
                    </span>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-foreground">
                      PNG
                    </p>

                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Budget snapshot
                    </p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Create Budget */}
          <button
            type="button"
            onClick={() => {
              setShowForm(
                (prev) => !prev,
              );

              setError("");
            }}
            className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary/90"
          >
            {showForm ? (
              <X size={18} />
            ) : (
              <Plus size={18} />
            )}

            {showForm
              ? "Close"
              : "Create Budget"}
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border bg-card/40">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">
              Total Budget
            </p>

            <p className="mt-2 text-2xl font-bold text-foreground">
              {formatCurrency(
                totalBudget,
                currency,
              )}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/40">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">
              Total Spent
            </p>

            <p className="mt-2 text-2xl font-bold text-red-400">
              {formatCurrency(
                totalSpent,
                currency,
              )}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/40">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">
              Remaining
            </p>

            <p
              className={`mt-2 text-2xl font-bold ${
                totalRemaining >= 0
                  ? "text-primary"
                  : "text-red-400"
              }`}
            >
              {formatCurrency(
                totalRemaining,
                currency,
              )}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/40">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">
              Overall Usage
            </p>

            <p className="mt-2 text-2xl font-bold text-foreground">
              {Math.min(
                Math.round(
                  overallPercentage,
                ),
                999,
              )}
              %
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Create Budget Form */}
      {showForm && (
        <Card className="mt-6 border-primary/20 bg-card/40">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">
              Create a Budget
            </CardTitle>

            <p className="text-sm text-muted-foreground">
              Set a spending limit for a category.
            </p>
          </CardHeader>

          <CardContent>
            <form
              onSubmit={
                handleCreateBudget
              }
              className="grid gap-5 md:grid-cols-3"
            >
              {/* Category */}
              <div>
                <label className="mb-2 block text-sm font-medium text-muted-foreground">
                  Category
                </label>

                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) =>
                      setCategory(
                        e.target.value,
                      )
                    }
                    className="w-full appearance-none rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition hover:border-border/80 focus:border-primary focus:ring-2 focus:ring-primary/15"
                  >
                    {categories.map(
                      (item) => (
                        <option
                          key={item}
                          value={item}
                          className="bg-popover text-popover-foreground"
                        >
                          {item}
                        </option>
                      ),
                    )}
                  </select>

                  <ChevronDown
                    size={17}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="mb-2 block text-sm font-medium text-muted-foreground">
                  Budget Amount
                </label>

                <div className="flex overflow-hidden rounded-xl border border-border bg-background transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
                  <div className="flex items-center border-r border-border px-4 font-bold text-primary">
                    {getCurrencySymbol(
                      currency,
                    )}
                  </div>

                  <input
                    type="text"
                    inputMode="numeric"
                    value={formatAmount(
                      amount,
                    )}
                    onChange={
                      handleAmountChange
                    }
                    placeholder="50,000"
                    className="w-full bg-transparent px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
                  />
                </div>
              </div>

              {/* Period */}
              <div>
                <label className="mb-2 block text-sm font-medium text-muted-foreground">
                  Period
                </label>

                <div className="flex rounded-xl border border-border bg-background p-1">
                  {[
                    "monthly",
                    "yearly",
                  ].map(
                    (item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() =>
                          setPeriod(
                            item,
                          )
                        }
                        className={`flex-1 rounded-lg px-3 py-2.5 text-sm capitalize transition ${
                          period === item
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {item}
                      </button>
                    ),
                  )}
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center justify-between rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-400 md:col-span-3">
                  <span>{error}</span>

                  <button
                    type="button"
                    onClick={() =>
                      setError("")
                    }
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {/* Submit */}
              <div className="md:col-span-3">
                <button
                  type="submit"
                  className="w-full rounded-xl bg-primary px-4 py-3.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                >
                  Create Budget
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Budgets */}
      <div className="mt-6">
        {budgetData.length === 0 ? (
          <div className="flex min-h-[420px] items-center justify-center rounded-3xl border border-border bg-card/40">
            <div className="max-w-md px-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Wallet size={30} />
              </div>

              <h2 className="mt-5 text-xl font-semibold text-foreground">
                No budgets yet
              </h2>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Create your first budget to
                start tracking how much
                you're spending in each
                category.
              </p>

              <button
                type="button"
                onClick={() =>
                  setShowForm(true)
                }
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
              >
                <Plus size={17} />
                Create Your First Budget
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {budgetData.map(
              (budget) => (
                <Card
                  key={budget.id}
                  className="border-border bg-card/40"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <CardTitle className="text-lg text-foreground">
                          {budget.category}
                        </CardTitle>

                        <p className="mt-1 text-xs capitalize text-muted-foreground">
                          {budget.period}{" "}
                          budget
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          deleteBudget(
                            budget.id,
                          )
                        }
                        className="rounded-lg p-2 text-muted-foreground/50 transition hover:bg-red-500/10 hover:text-red-400"
                        title="Delete budget"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="mb-3 flex items-end justify-between gap-4">
                      <div>
                        <p className="text-2xl font-bold text-foreground">
                          {formatCurrency(
                            budget.spent,
                            currency,
                          )}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          of{" "}
                          {formatCurrency(
                            budget.amount,
                            currency,
                          )}
                        </p>
                      </div>

                      <p
                        className={`text-sm font-semibold ${
                          budget.status ===
                          "exceeded"
                            ? "text-red-400"
                            : budget.status ===
                              "warning"
                              ? "text-yellow-400"
                              : "text-primary"
                        }`}
                      >
                        {Math.round(
                          budget.percentage,
                        )}
                        %
                      </p>
                    </div>

                    {/* Progress */}
                    <div className="h-3 overflow-hidden rounded-full bg-foreground/5">
                      <div
                        className={`h-full rounded-full transition-all ${
                          budget.status ===
                          "exceeded"
                            ? "bg-red-500"
                            : budget.status ===
                              "warning"
                              ? "bg-yellow-400"
                              : "bg-primary"
                        }`}
                        style={{
                          width: `${Math.min(
                            budget.percentage,
                            100,
                          )}%`,
                        }}
                      />
                    </div>

                    {/* Status */}
                    <div className="mt-4 flex items-center gap-2">
                      {budget.status ===
                        "safe" && (
                        <>
                          <CheckCircle2
                            size={17}
                            className="text-primary"
                          />

                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(
                              budget.remaining,
                              currency,
                            )}{" "}
                            remaining
                          </p>
                        </>
                      )}

                      {budget.status ===
                        "warning" && (
                        <>
                          <AlertTriangle
                            size={17}
                            className="text-yellow-400"
                          />

                          <p className="text-sm text-yellow-400">
                            You're getting
                            close to your
                            limit
                          </p>
                        </>
                      )}

                      {budget.status ===
                        "exceeded" && (
                        <>
                          <AlertTriangle
                            size={17}
                            className="text-red-400"
                          />

                          <p className="text-sm text-red-400">
                            Budget exceeded
                            by{" "}
                            {formatCurrency(
                              Math.abs(
                                budget.remaining,
                              ),
                              currency,
                            )}
                          </p>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ),
            )}
          </div>
        )}
      </div>

      {/* Budget Tip */}
      {budgetData.length > 0 && (
        <div className="mt-6 rounded-2xl border border-primary/10 bg-primary/5 p-5">
          <div className="flex items-start gap-3">
            <TrendingUp
              size={19}
              className="mt-0.5 shrink-0 text-primary"
            />

            <div>
              <p className="text-sm font-medium text-foreground">
                Budget tip
              </p>

              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Keep an eye on categories
                approaching 75% of their
                limit. Small adjustments
                early can help prevent
                overspending later.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Budgets;