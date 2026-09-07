import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { toast } from "sonner";
import {
  CalendarDays,
  Check,
  Clock3,
  Pause,
  Pencil,
  Play,
  Plus,
  Repeat2,
  Trash2,
  X,
} from "lucide-react";

import {
  calculateNextOccurrence,
  createRecurringTransaction,
  deleteRecurringTransaction,
  getRecurringTransactions,
  toggleRecurringTransaction,
} from "../utils/recurringTransactions";

import {
  formatCurrency,
  getCurrencySymbol,
} from "../utils/currency";

import { formatDate } from "../utils/date";

const incomeCategories = [
  "Salary",
  "Freelance",
  "Business",
  "Allowance",
  "Gift",
  "Investment",
  "Refund",
  "Other Income",
];

const expenseCategories = [
  "Food",
  "Transport",
  "Airtime",
  "Data",
  "Bills",
  "Shopping",
  "Entertainment",
  "Health",
  "Education",
  "Subscriptions",
  "Personal Care",
  "Rent/Housing",
  "Other Expense",
];

const frequencyOptions = [
  {
    value: "daily",
    label: "Daily",
  },
  {
    value: "weekly",
    label: "Weekly",
  },
  {
    value: "monthly",
    label: "Monthly",
  },
  {
    value: "yearly",
    label: "Yearly",
  },
];

function RecurringTransactions() {
  const {
    transactions,
    setTransactions,
    currency,
    dateFormat,
    notifications,
    setNotifications,
  } = useOutletContext();

  const [recurringTransactions, setRecurringTransactions] =
    useState(() => getRecurringTransactions());

  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    description: "",
    amount: "",
    type: "expense",
    category: expenseCategories[0],
    frequency: "monthly",
    startDate: new Date()
      .toISOString()
      .split("T")[0],
  });

  const categories = useMemo(() => {
    return form.type === "income"
      ? incomeCategories
      : expenseCategories;
  }, [form.type]);

  useEffect(() => {
    setForm((previous) => {
      if (categories.includes(previous.category)) {
        return previous;
      }

      return {
        ...previous,
        category: categories[0],
      };
    });
  }, [categories]);

  function handleCreate() {
    if (!form.description.trim()) {
      toast.error("Please enter a description.");
      return;
    }

    const numericAmount = Number(
      form.amount.replace(/,/g, ""),
    );

    if (!numericAmount || numericAmount <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }

    if (!form.startDate) {
      toast.error("Please select a start date.");
      return;
    }

    const recurring =
      createRecurringTransaction({
        ...form,
        amount: numericAmount,
      });

    setRecurringTransactions((previous) => [
      recurring,
      ...previous,
    ]);

    setForm({
      description: "",
      amount: "",
      type: "expense",
      category: expenseCategories[0],
      frequency: "monthly",
      startDate: new Date()
        .toISOString()
        .split("T")[0],
    });

    setShowForm(false);

    toast.success(
      "Recurring transaction created.",
    );
  }

  function handleDelete(id) {
    deleteRecurringTransaction(id);

    setRecurringTransactions((previous) =>
      previous.filter(
        (transaction) => transaction.id !== id,
      ),
    );

    toast.success(
      "Recurring transaction deleted.",
    );
  }

  function handleToggle(id) {
    const updated =
      toggleRecurringTransaction(id);

    setRecurringTransactions(updated);

    const item = updated.find(
      (transaction) => transaction.id === id,
    );

    toast.success(
      item?.active
        ? "Recurring transaction resumed."
        : "Recurring transaction paused.",
    );
  }

  function handleAmountChange(value) {
    const numbersOnly = value.replace(/\D/g, "");

    setForm((previous) => ({
      ...previous,
      amount: numbersOnly
        ? Number(numbersOnly).toLocaleString(
            "en-NG",
          )
        : "",
    }));
  }

  return (
    <div className="min-h-screen bg-[#0f1714] text-white">
      {/* HEADER */}

      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Recurring Transactions
          </h1>

          <p className="mt-1 text-sm text-gray-400">
            Automatically keep track of regular
            income and expenses.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowForm((previous) => !previous)}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#049552] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#049552]/20 transition hover:bg-[#038448]"
        >
          {showForm ? (
            <X size={17} />
          ) : (
            <Plus size={17} />
          )}

          {showForm
            ? "Cancel"
            : "Add recurring"}
        </button>
      </div>

      {/* CREATE FORM */}

      {showForm && (
        <div className="mb-8 rounded-2xl border border-white/10 bg-[#22332b]/50 p-5">
          <div className="mb-5">
            <h2 className="text-lg font-semibold">
              New recurring transaction
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              PennyPlot will automatically add it
              to your transactions when it is due.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* DESCRIPTION */}

            <div>
              <label className="mb-2 block text-sm text-gray-400">
                Description
              </label>

              <input
                type="text"
                placeholder="e.g. Netflix"
                value={form.description}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    description:
                      event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-[#049552] focus:ring-1 focus:ring-[#049552]/30"
              />
            </div>

            {/* AMOUNT */}

            <div>
              <label className="mb-2 block text-sm text-gray-400">
                Amount
              </label>

              <div className="flex overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] focus-within:border-[#049552] focus-within:ring-1 focus-within:ring-[#049552]/30">
                <span className="flex items-center border-r border-white/10 px-4 text-gray-400">
                  {getCurrencySymbol(currency)}
                </span>

                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={form.amount}
                  onChange={(event) =>
                    handleAmountChange(
                      event.target.value,
                    )
                  }
                  className="w-full bg-transparent px-4 py-3 text-sm text-white outline-none"
                />
              </div>
            </div>

            {/* TYPE */}

            <div>
              <label className="mb-2 block text-sm text-gray-400">
                Type
              </label>

              <select
                value={form.type}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    type: event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-white/10 bg-[#1b2922] px-4 py-3 text-sm text-white outline-none focus:border-[#049552]"
              >
                <option value="expense">
                  Expense
                </option>

                <option value="income">
                  Income
                </option>
              </select>
            </div>

            {/* CATEGORY */}

            <div>
              <label className="mb-2 block text-sm text-gray-400">
                Category
              </label>

              <select
                value={form.category}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    category:
                      event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-white/10 bg-[#1b2922] px-4 py-3 text-sm text-white outline-none focus:border-[#049552]"
              >
                {categories.map((category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* FREQUENCY */}

            <div>
              <label className="mb-2 block text-sm text-gray-400">
                Frequency
              </label>

              <select
                value={form.frequency}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    frequency:
                      event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-white/10 bg-[#1b2922] px-4 py-3 text-sm text-white outline-none focus:border-[#049552]"
              >
                {frequencyOptions.map(
                  (option) => (
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  ),
                )}
              </select>
            </div>

            {/* START DATE */}

            <div>
              <label className="mb-2 block text-sm text-gray-400">
                Start date
              </label>

              <input
                type="date"
                value={form.startDate}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    startDate:
                      event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-white/10 bg-[#1b2922] px-4 py-3 text-sm text-white outline-none focus:border-[#049552]"
              />
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={handleCreate}
              className="flex items-center gap-2 rounded-xl bg-[#049552] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#038448]"
            >
              <Check size={17} />
              Create recurring transaction
            </button>
          </div>
        </div>
      )}

      {/* EMPTY STATE */}

      {recurringTransactions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-[#22332b]/30 px-5 py-20 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/5 text-gray-500">
            <Repeat2 size={24} />
          </div>

          <h2 className="mt-4 font-semibold text-white">
            No recurring transactions
          </h2>

          <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
            Add recurring income or expenses so
            PennyPlot can keep them up to date
            automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {recurringTransactions.map(
            (recurring) => (
              <div
                key={recurring.id}
                className={`rounded-2xl border p-4 transition ${
                  recurring.active
                    ? "border-white/10 bg-[#22332b]/40 hover:border-white/15"
                    : "border-white/[0.06] bg-[#22332b]/20 opacity-60"
                }`}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-white">
                        {recurring.description}
                      </p>

                      {!recurring.active && (
                        <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-500">
                          Paused
                        </span>
                      )}
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                      <span>
                        {recurring.category}
                      </span>

                      <span>•</span>

                      <span className="capitalize">
                        {recurring.frequency}
                      </span>

                      <span>•</span>

                      <span className="flex items-center gap-1">
                        <CalendarDays
                          size={13}
                        />

                        Next:{" "}
                        {formatDate(
                          recurring.nextOccurrence,
                          dateFormat,
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-5 md:justify-end">
                    <span
                      className={
                        recurring.type ===
                        "income"
                          ? "font-semibold text-[#049552]"
                          : "font-semibold text-red-400"
                      }
                    >
                      {recurring.type ===
                      "income"
                        ? "+"
                        : "-"}
                      {formatCurrency(
                        recurring.amount,
                        currency,
                      )}
                    </span>

                    <div className="flex items-center gap-1">
                      {/* PAUSE / RESUME */}

                      <button
                        type="button"
                        onClick={() =>
                          handleToggle(
                            recurring.id,
                          )
                        }
                        title={
                          recurring.active
                            ? "Pause"
                            : "Resume"
                        }
                        className="rounded-lg p-2 text-gray-500 transition hover:-translate-y-0.5 hover:bg-white/5 hover:text-white"
                      >
                        {recurring.active ? (
                          <Pause size={16} />
                        ) : (
                          <Play size={16} />
                        )}
                      </button>

                      {/* DELETE */}

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(
                            recurring.id,
                          )
                        }
                        title="Delete"
                        className="rounded-lg p-2 text-gray-500 transition hover:-translate-y-0.5 hover:bg-red-500/10 hover:text-red-400"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
}

export default RecurringTransactions;