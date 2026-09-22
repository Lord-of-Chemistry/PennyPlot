import { useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
  ChevronDown,
  Plus,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  getCurrencyName,
  getCurrencySymbol,
} from "../utils/currency";
import DatePicker from "../components/DatePicker";

const defaultIncomeCategories = [
  "Salary",
  "Freelance",
  "Business",
  "Allowance",
  "Gift",
  "Investment",
  "Refund",
  "Other Income",
];

const defaultExpenseCategories = [
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

function readCustomCategories(key) {
  try {
    const categories = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(categories) ? categories : [];
  } catch {
    return [];
  }
}

function getToday() {
  return new Date().toISOString().split("T")[0];
}

function AddTransaction({ onClose }) {
  const { setTransactions, dateFormat, currency } = useOutletContext();

  const [type, setType] = useState("expense");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [date, setDate] = useState(getToday());
  const [error, setError] = useState("");

  const [typeOpen, setTypeOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);

  const [customIncomeCategories, setCustomIncomeCategories] = useState(() =>
    readCustomCategories("pennyplot-custom-income-categories"),
  );

  const [customExpenseCategories, setCustomExpenseCategories] = useState(() =>
    readCustomCategories("pennyplot-custom-expense-categories"),
  );

  const dropdownRef = useRef(null);
  const descriptionRef = useRef(null);

  const currencySymbol = getCurrencySymbol(currency);
  const currencyName = getCurrencyName(currency);

  const categories =
    type === "income"
      ? [...defaultIncomeCategories, ...customIncomeCategories]
      : [...defaultExpenseCategories, ...customExpenseCategories];

  useEffect(() => {
    descriptionRef.current?.focus();
  }, []);

  useEffect(() => {
    function refreshCategories() {
      setCustomIncomeCategories(
        readCustomCategories("pennyplot-custom-income-categories"),
      );

      setCustomExpenseCategories(
        readCustomCategories("pennyplot-custom-expense-categories"),
      );
    }

    function handleStorageChange(event) {
      if (
        event.key === "pennyplot-custom-income-categories" ||
        event.key === "pennyplot-custom-expense-categories"
      ) {
        refreshCategories();
      }
    }

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("focus", refreshCategories);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", refreshCategories);
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setTypeOpen(false);
        setCategoryOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key !== "Escape") return;

      if (typeOpen || categoryOpen) {
        setTypeOpen(false);
        setCategoryOpen(false);
        return;
      }

      onClose?.();
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [typeOpen, categoryOpen, onClose]);

  function formatAmount(value) {
    if (!value) return "";

    return Number(value).toLocaleString("en-NG");
  }

  function handleAmountChange(event) {
    const numbersOnly = event.target.value.replace(/\D/g, "");
    setAmount(numbersOnly);
    setError("");
  }

  function selectType(value) {
    setType(value);
    setTypeOpen(false);

    setCategory(value === "income" ? "Salary" : "Food");
    setError("");
  }

  function selectCategory(value) {
    setCategory(value);
    setCategoryOpen(false);
    setError("");
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const trimmedDescription = description.trim();
    const numericAmount = Number(amount);

    if (!trimmedDescription) {
      setError("Add a description for this transaction.");
      return;
    }

    if (!numericAmount || numericAmount <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }

    if (!date) {
      setError("Select a date for this transaction.");
      return;
    }

    const newTransaction = {
      id: Date.now(),
      type,
      description: trimmedDescription,
      amount: numericAmount,
      category,
      date,
    };

    setTransactions((previousTransactions) => [
      newTransaction,
      ...previousTransactions,
    ]);

    toast.success(
      `${type === "income" ? "Income" : "Expense"} added successfully.`,
    );

    onClose?.();
  }

  return (
    <section className="w-full">
      <div className="overflow-hidden rounded-2xl bg-card">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-5 pb-5 pt-6 sm:px-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-primary">
              New transaction
            </p>

            <h2 className="mt-1 text-xl font-semibold tracking-tight text-foreground">
              Add something
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Record money coming in or going out.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Type switch */}
          <div className="px-5 sm:px-6">
            <div className="grid grid-cols-2 rounded-xl bg-muted/60 p-1">
              <button
                type="button"
                onClick={() => selectType("expense")}
                className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  type === "expense"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <ArrowUpRight
                  size={16}
                  className={
                    type === "expense" ? "text-destructive" : ""
                  }
                />
                Expense
              </button>

              <button
                type="button"
                onClick={() => selectType("income")}
                className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  type === "income"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <ArrowDownLeft
                  size={16}
                  className={type === "income" ? "text-primary" : ""}
                />
                Income
              </button>
            </div>
          </div>

          {/* Main fields */}
          <div className="space-y-5 px-5 pb-6 pt-6 sm:px-6">
            {/* Amount */}
            <div>
              <label
                htmlFor="transaction-amount"
                className="mb-2 block text-xs font-medium text-muted-foreground"
              >
                Amount
              </label>

              <div className="flex items-center rounded-xl border border-border bg-background px-4 transition-colors focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/10">
                <span className="mr-2 text-lg font-medium text-primary">
                  {currencySymbol}
                </span>

                <input
                  id="transaction-amount"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={formatAmount(amount)}
                  onChange={handleAmountChange}
                  placeholder="0"
                  className="min-w-0 flex-1 bg-transparent py-3.5 text-2xl font-semibold tracking-tight text-foreground outline-none placeholder:text-muted-foreground/30"
                />
              </div>

              <p className="mt-1.5 text-[11px] text-muted-foreground/60">
                {amount
                  ? `${currencySymbol}${formatAmount(amount)}`
                  : `Amount in ${currencyName}`}
              </p>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="transaction-description"
                className="mb-2 block text-xs font-medium text-muted-foreground"
              >
                Description
              </label>

              <input
                ref={descriptionRef}
                id="transaction-description"
                type="text"
                value={description}
                onChange={(event) => {
                  setDescription(event.target.value);
                  setError("");
                }}
                placeholder={
                  type === "expense"
                    ? "What did you spend on?"
                    : "Where did the money come from?"
                }
                autoComplete="off"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/40 focus:border-primary/60 focus:ring-2 focus:ring-primary/10"
              />
            </div>

            {/* Category / Date */}
            <div
              ref={dropdownRef}
              className="grid gap-4 sm:grid-cols-2"
            >
              <div className="relative">
                <label className="mb-2 block text-xs font-medium text-muted-foreground">
                  Category
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setCategoryOpen((open) => !open);
                    setTypeOpen(false);
                  }}
                  className="flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 py-3 text-left text-sm text-foreground transition-colors hover:border-border/80 focus:outline-none focus:ring-2 focus:ring-primary/10"
                >
                  <span className="truncate">{category}</span>

                  <ChevronDown
                    size={16}
                    className={`shrink-0 text-muted-foreground transition-transform duration-200 ${
                      categoryOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <div
                  className={`absolute bottom-full left-0 right-0 z-30 mb-2 origin-bottom rounded-xl border border-border bg-popover p-1.5 shadow-2xl transition-all duration-150 ${
                    categoryOpen
                      ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
                      : "pointer-events-none translate-y-1 scale-[0.98] opacity-0"
                  }`}
                >
                  <div className="max-h-52 overflow-y-auto">
                    {categories.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => selectCategory(item)}
                        className={`flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                          category === item
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <CalendarDays size={13} />
                  Date
                </label>

                <DatePicker
                  value={date}
                  onChange={(value) => {
                    setDate(value);
                    setError("");
                  }}
                  dateFormat={dateFormat}
                />
              </div>
            </div>

            {/* Error */}
            <div
              className={`overflow-hidden transition-all duration-200 ${
                error
                  ? "max-h-20 opacity-100"
                  : "max-h-0 opacity-0"
              }`}
            >
              <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-3.5 py-3 text-xs text-destructive">
                {error}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/15 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-primary/25 active:translate-y-0"
            >
              <Plus size={17} />
              Add transaction
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default AddTransaction;