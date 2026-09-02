import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Plus,
  Wallet,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  X,
  Trash2,
  ChevronDown,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function Budgets() {
  const { transactions } = useOutletContext();

  const [budgets, setBudgets] = useState(() => {
    try {
      const savedBudgets = localStorage.getItem("pennyplot-budgets");

      return savedBudgets ? JSON.parse(savedBudgets) : [];
    } catch (error) {
      console.error("Failed to load budgets:", error);
      return [];
    }
  });

  const [showForm, setShowForm] = useState(false);

  const [category, setCategory] = useState("Food");
  const [amount, setAmount] = useState("");
  const [period, setPeriod] = useState("monthly");
  const [error, setError] = useState("");

  const categories = [
    "Food",
    "Transport",
    "Shopping",
    "Bills",
    "Entertainment",
    "Other",
  ];

  function formatCurrency(value) {
    return `₦${Number(value || 0).toLocaleString("en-NG")}`;
  }

  function formatAmount(value) {
    if (!value) return "";

    return Number(value).toLocaleString("en-NG");
  }

  function handleAmountChange(e) {
    const numbersOnly = e.target.value.replace(/\D/g, "");

    setAmount(numbersOnly);
  }

  function saveBudgets(updatedBudgets) {
    setBudgets(updatedBudgets);

    localStorage.setItem(
      "pennyplot-budgets",
      JSON.stringify(updatedBudgets)
    );
  }

  function handleCreateBudget(e) {
    e.preventDefault();
    setError("");

    const numericAmount = Number(amount);

    if (!numericAmount || numericAmount <= 0) {
      setError("Please enter a valid budget amount.");
      return;
    }

    const alreadyExists = budgets.some(
      (budget) =>
        budget.category === category &&
        budget.period === period
    );

    if (alreadyExists) {
      setError(
        `You already have a ${period} budget for ${category}.`
      );
      return;
    }

    const newBudget = {
      id: Date.now(),
      category,
      amount: numericAmount,
      period,
    };

    saveBudgets([...budgets, newBudget]);

    setAmount("");
    setCategory("Food");
    setPeriod("monthly");
    setError("");
    setShowForm(false);
  }

  function deleteBudget(id) {
    const updatedBudgets = budgets.filter(
      (budget) => budget.id !== id
    );

    saveBudgets(updatedBudgets);
  }

  /*
    Calculate how much has been spent
    against a specific budget.
  */
  function getBudgetSpent(budget) {
    const now = new Date();

    return transactions
      .filter(
        (transaction) =>
          transaction.type === "expense" &&
          transaction.category === budget.category
      )
      .filter((transaction) => {
        const transactionDate = new Date(transaction.date);

        if (Number.isNaN(transactionDate.getTime())) {
          return false;
        }

        if (budget.period === "monthly") {
          return (
            transactionDate.getMonth() === now.getMonth() &&
            transactionDate.getFullYear() ===
              now.getFullYear()
          );
        }

        if (budget.period === "yearly") {
          return (
            transactionDate.getFullYear() ===
            now.getFullYear()
          );
        }

        return false;
      })
      .reduce(
        (total, transaction) =>
          total + Number(transaction.amount || 0),
        0
      );
  }

  const budgetData = useMemo(() => {
    return budgets.map((budget) => {
      const spent = getBudgetSpent(budget);

      const percentage =
        budget.amount > 0
          ? (spent / budget.amount) * 100
          : 0;

      const remaining = budget.amount - spent;

      let status = "safe";

      if (percentage >= 100) {
        status = "exceeded";
      } else if (percentage >= 75) {
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
  }, [budgets, transactions]);

  const totalBudget = budgetData.reduce(
    (total, budget) => total + budget.amount,
    0
  );

  const totalSpent = budgetData.reduce(
    (total, budget) => total + budget.spent,
    0
  );

  const totalRemaining = totalBudget - totalSpent;

  const overallPercentage =
    totalBudget > 0
      ? (totalSpent / totalBudget) * 100
      : 0;

  return (
    <div className="min-h-screen bg-[#0f1714]">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Budgets
          </h1>

          <p className="mt-1 text-sm text-gray-400">
            Set spending limits and stay in control of your money.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowForm((prev) => !prev);
            setError("");
          }}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#049552] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#049552]/20 transition hover:bg-[#038448]"
        >
          {showForm ? <X size={18} /> : <Plus size={18} />}

          {showForm ? "Close" : "Create Budget"}
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-white/10 bg-[#22332b]/40">
          <CardContent className="p-5">
            <p className="text-sm text-gray-500">
              Total Budget
            </p>

            <p className="mt-2 text-2xl font-bold text-white">
              {formatCurrency(totalBudget)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-[#22332b]/40">
          <CardContent className="p-5">
            <p className="text-sm text-gray-500">
              Total Spent
            </p>

            <p className="mt-2 text-2xl font-bold text-red-400">
              {formatCurrency(totalSpent)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-[#22332b]/40">
          <CardContent className="p-5">
            <p className="text-sm text-gray-500">
              Remaining
            </p>

            <p
              className={`mt-2 text-2xl font-bold ${
                totalRemaining >= 0
                  ? "text-[#049552]"
                  : "text-red-400"
              }`}
            >
              {formatCurrency(totalRemaining)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-[#22332b]/40">
          <CardContent className="p-5">
            <p className="text-sm text-gray-500">
              Overall Usage
            </p>

            <p className="mt-2 text-2xl font-bold text-white">
              {Math.min(Math.round(overallPercentage), 999)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Create Budget Form */}
      {showForm && (
        <Card className="mt-6 border-[#049552]/20 bg-[#22332b]/40">
          <CardHeader>
            <CardTitle className="text-lg text-white">
              Create a Budget
            </CardTitle>

            <p className="text-sm text-gray-500">
              Set a spending limit for a category.
            </p>
          </CardHeader>

          <CardContent>
            <form
              onSubmit={handleCreateBudget}
              className="grid gap-5 md:grid-cols-3"
            >
              {/* Category */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Category
                </label>

                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) =>
                      setCategory(e.target.value)
                    }
                    className="w-full appearance-none rounded-xl border border-white/15 bg-[#0f1714] px-4 py-3 text-sm text-white outline-none transition hover:border-white/25 focus:border-[#049552] focus:ring-2 focus:ring-[#049552]/15"
                  >
                    {categories.map((item) => (
                      <option
                        key={item}
                        value={item}
                        className="bg-[#17221d]"
                      >
                        {item}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    size={17}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                  />
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Budget Amount
                </label>

                <div className="flex overflow-hidden rounded-xl border border-white/15 bg-[#0f1714] transition focus-within:border-[#049552] focus-within:ring-2 focus-within:ring-[#049552]/15">
                  <div className="flex items-center border-r border-white/15 px-4 font-bold text-[#049552]">
                    ₦
                  </div>

                  <input
                    type="text"
                    inputMode="numeric"
                    value={formatAmount(amount)}
                    onChange={handleAmountChange}
                    placeholder="50,000"
                    className="w-full bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600"
                  />
                </div>
              </div>

              {/* Period */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Period
                </label>

                <div className="flex rounded-xl border border-white/15 bg-[#0f1714] p-1">
                  {["monthly", "yearly"].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setPeriod(item)}
                      className={`flex-1 rounded-lg px-3 py-2.5 text-sm capitalize transition ${
                        period === item
                          ? "bg-[#049552] text-white"
                          : "text-gray-500 hover:text-white"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="md:col-span-3 flex items-center justify-between rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  <span>{error}</span>

                  <button
                    type="button"
                    onClick={() => setError("")}
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              <div className="md:col-span-3">
                <button
                  type="submit"
                  className="w-full rounded-xl bg-[#049552] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[#038448]"
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
          <div className="flex min-h-[420px] items-center justify-center rounded-3xl border border-white/10 bg-[#22332b]/40">
            <div className="max-w-md px-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#049552]/10 text-[#049552]">
                <Wallet size={30} />
              </div>

              <h2 className="mt-5 text-xl font-semibold text-white">
                No budgets yet
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Create your first budget to start tracking how
                much you're spending in each category.
              </p>

              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#049552] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#038448]"
              >
                <Plus size={17} />
                Create Your First Budget
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {budgetData.map((budget) => (
              <Card
                key={budget.id}
                className="border-white/10 bg-[#22332b]/40"
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg text-white">
                        {budget.category}
                      </CardTitle>

                      <p className="mt-1 text-xs capitalize text-gray-500">
                        {budget.period} budget
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => deleteBudget(budget.id)}
                      className="rounded-lg p-2 text-gray-600 transition hover:bg-red-500/10 hover:text-red-400"
                      title="Delete budget"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="mb-3 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-2xl font-bold text-white">
                        {formatCurrency(budget.spent)}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        of {formatCurrency(budget.amount)}
                      </p>
                    </div>

                    <p
                      className={`text-sm font-semibold ${
                        budget.status === "exceeded"
                          ? "text-red-400"
                          : budget.status === "warning"
                          ? "text-yellow-400"
                          : "text-[#049552]"
                      }`}
                    >
                      {Math.round(budget.percentage)}%
                    </p>
                  </div>

                  {/* Progress */}
                  <div className="h-3 overflow-hidden rounded-full bg-white/5">
                    <div
                      className={`h-full rounded-full transition-all ${
                        budget.status === "exceeded"
                          ? "bg-red-500"
                          : budget.status === "warning"
                          ? "bg-yellow-400"
                          : "bg-[#049552]"
                      }`}
                      style={{
                        width: `${Math.min(
                          budget.percentage,
                          100
                        )}%`,
                      }}
                    />
                  </div>

                  {/* Status */}
                  <div className="mt-4 flex items-center gap-2">
                    {budget.status === "safe" && (
                      <>
                        <CheckCircle2
                          size={17}
                          className="text-[#049552]"
                        />

                        <p className="text-sm text-gray-400">
                          {formatCurrency(budget.remaining)} remaining
                        </p>
                      </>
                    )}

                    {budget.status === "warning" && (
                      <>
                        <AlertTriangle
                          size={17}
                          className="text-yellow-400"
                        />

                        <p className="text-sm text-yellow-400">
                          You're getting close to your limit
                        </p>
                      </>
                    )}

                    {budget.status === "exceeded" && (
                      <>
                        <AlertTriangle
                          size={17}
                          className="text-red-400"
                        />

                        <p className="text-sm text-red-400">
                          Budget exceeded by{" "}
                          {formatCurrency(
                            Math.abs(budget.remaining)
                          )}
                        </p>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Budget Tip */}
      {budgetData.length > 0 && (
        <div className="mt-6 rounded-2xl border border-[#049552]/10 bg-[#049552]/5 p-5">
          <div className="flex items-start gap-3">
            <TrendingUp
              size={19}
              className="mt-0.5 shrink-0 text-[#049552]"
            />

            <div>
              <p className="text-sm font-medium text-white">
                Budget tip
              </p>

              <p className="mt-1 text-sm leading-6 text-gray-500">
                Keep an eye on categories approaching 75% of
                their limit. Small adjustments early can help
                prevent overspending later.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Budgets;