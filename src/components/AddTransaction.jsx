import { useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Plus, X, Wallet, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { getCurrencyName, getCurrencySymbol } from "../utils/currency";
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

function AddTransaction() {
  const { setTransactions } = useOutletContext();
  const { dateFormat } = useOutletContext();
  const [type, setType] = useState("expense");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [error, setError] = useState("");

  const [typeOpen, setTypeOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);

  const [customIncomeCategories, setCustomIncomeCategories] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("pennyplot-custom-income-categories") || "[]",
      );
    } catch {
      return [];
    }
  });

  const [customExpenseCategories, setCustomExpenseCategories] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("pennyplot-custom-expense-categories") || "[]",
      );
    } catch {
      return [];
    }
  });

  const dropdownRef = useRef(null);

  /*
    Keep custom categories updated when
    localStorage changes in another tab/window.
  */
  useEffect(() => {
    function handleStorageChange(event) {
      if (
        event.key === "pennyplot-custom-income-categories" ||
        event.key === "pennyplot-custom-expense-categories"
      ) {
        try {
          setCustomIncomeCategories(
            JSON.parse(
              localStorage.getItem("pennyplot-custom-income-categories") ||
                "[]",
            ),
          );

          setCustomExpenseCategories(
            JSON.parse(
              localStorage.getItem("pennyplot-custom-expense-categories") ||
                "[]",
            ),
          );
        } catch {
          setCustomIncomeCategories([]);
          setCustomExpenseCategories([]);
        }
      }
    }

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  /*
    Read the latest categories whenever
    the Add Transaction component becomes active.
  */
  useEffect(() => {
    function refreshCategories() {
      try {
        setCustomIncomeCategories(
          JSON.parse(
            localStorage.getItem("pennyplot-custom-income-categories") || "[]",
          ),
        );

        setCustomExpenseCategories(
          JSON.parse(
            localStorage.getItem("pennyplot-custom-expense-categories") || "[]",
          ),
        );
      } catch {
        setCustomIncomeCategories([]);
        setCustomExpenseCategories([]);
      }
    }

    window.addEventListener("focus", refreshCategories);

    return () => {
      window.removeEventListener("focus", refreshCategories);
    };
  }, []);

  const categories =
    type === "income"
      ? [...defaultIncomeCategories, ...customIncomeCategories]
      : [...defaultExpenseCategories, ...customExpenseCategories];

  /*
    Close dropdowns when clicking outside.
  */
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setTypeOpen(false);
        setCategoryOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /*
    Close dropdowns with Escape.
  */
  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape") {
        setTypeOpen(false);
        setCategoryOpen(false);
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function formatAmount(value) {
    if (!value) return "";
    return Number(value).toLocaleString("en-NG");
  }

  function handleAmountChange(e) {
    const numbersOnly = e.target.value.replace(/\D/g, "");
    setAmount(numbersOnly);
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!description.trim()) {
      setError("Please enter a description.");
      toast.error("Please enter a description.");
      return;
    }

    const numericAmount = Number(amount);

    if (!numericAmount || numericAmount <= 0) {
      setError("Please enter a valid amount.");
      toast.error("Please enter a valid amount.");
      return;
    }

    if (!date) {
      setError("Please select a date.");
      toast.error("Please select a date.");
      return;
    }

    const newTransaction = {
      id: Date.now(),
      type,
      description: description.trim(),
      amount: numericAmount,
      category,
      date,
    };

    setTransactions((prev) => [newTransaction, ...prev]);

    toast.success(
      `${type === "income" ? "Income" : "Expense"} added successfully.`,
    );

    setDescription("");
    setAmount("");
    setType("expense");
    setCategory("Food");
    setDate(new Date().toISOString().split("T")[0]);
    setError("");

    setTypeOpen(false);
    setCategoryOpen(false);
  }

  function selectType(value) {
    setType(value);
    setTypeOpen(false);

    if (value === "income") {
      setCategory("Salary");
    } else {
      setCategory("Food");
    }
  }

  function selectCategory(value) {
    setCategory(value);
    setCategoryOpen(false);
  }

  return (
    <section className="w-full">
      <div className="relative z-10 overflow-visible rounded-3xl border-2 border-[#049552]/30 bg-[#1b2922] pt-2 shadow-2xl shadow-black/30">
        {/* Header */}
        <div className="border-b border-white/10 px-5 py-6 md:px-7">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#049552]/15 text-[#049552] ring-1 ring-[#049552]/20">
              <Wallet size={21} />
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white">
                Add Transaction
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Record a new income or expense
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="p-5 md:p-7">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Description */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Description
              </label>

              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Lunch, Salary, Transport"
                className="w-full rounded-xl border border-white/15 bg-[#0f1714] px-4 py-3 text-sm text-white outline-none transition-all duration-200 placeholder:text-gray-600 hover:border-white/25 focus:border-[#049552] focus:ring-2 focus:ring-[#049552]/15"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Amount
              </label>

              <div className="flex overflow-hidden rounded-xl border border-white/15 bg-[#0f1714] transition-all duration-200 hover:border-white/25 focus-within:border-[#049552] focus-within:ring-2 focus-within:ring-[#049552]/15">
                <div className="flex items-center border-r border-white/15 bg-white/[0.02] px-4 text-base font-bold text-[#049552]">
                  {getCurrencySymbol()}
                </div>

                <input
                  type="text"
                  inputMode="numeric"
                  value={formatAmount(amount)}
                  onChange={handleAmountChange}
                  placeholder="0"
                  className="w-full bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600"
                />
              </div>

              <p className="mt-2 text-xs text-gray-600 transition-all duration-200">
                {amount
                  ? `${getCurrencySymbol()}${formatAmount(amount)}`
                  : `Enter amount in ${getCurrencyName()}`}
              </p>
            </div>

            {/* Type / Category / Date */}
            <div ref={dropdownRef} className="grid gap-5 md:grid-cols-3">
              {/* Type */}
              <div className="relative z-50">
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Type
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setTypeOpen((prev) => !prev);
                    setCategoryOpen(false);
                  }}
                  className="flex w-full items-center justify-between rounded-xl border border-white/15 bg-[#0f1714] px-4 py-3 text-sm text-white outline-none transition-all duration-200 hover:border-white/25 focus:border-[#049552] focus:ring-2 focus:ring-[#049552]/15"
                >
                  <span
                    className={
                      type === "income" ? "text-[#049552]" : "text-red-400"
                    }
                  >
                    {type === "expense" ? "Expense" : "Income"}
                  </span>

                  <ChevronDown
                    size={17}
                    className={`text-gray-500 transition-transform duration-200 ${
                      typeOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Type Dropdown */}
                <div
                  className={`absolute bottom-full left-0 right-0 z-50 mb-2 origin-bottom rounded-xl border border-white/15 bg-[#17221d] p-1.5 shadow-2xl shadow-black/50 ring-1 ring-black/20 transition-all duration-200 ease-out md:top-full md:bottom-auto md:mt-2 md:mb-0 md:origin-top ${
                    typeOpen
                      ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
                      : "pointer-events-none translate-y-1 scale-95 opacity-0"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => selectType("expense")}
                    className={`flex w-full rounded-lg px-3 py-2.5 text-left text-sm transition-all duration-150 ${
                      type === "expense"
                        ? "bg-red-500/10 text-red-400"
                        : "text-gray-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    Expense
                  </button>

                  <button
                    type="button"
                    onClick={() => selectType("income")}
                    className={`mt-1 flex w-full rounded-lg px-3 py-2.5 text-left text-sm transition-all duration-150 ${
                      type === "income"
                        ? "bg-[#049552]/10 text-[#049552]"
                        : "text-gray-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    Income
                  </button>
                </div>
              </div>

              {/* Category */}
              <div className="relative z-50">
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Category
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setCategoryOpen((prev) => !prev);
                    setTypeOpen(false);
                  }}
                  className="flex w-full items-center justify-between rounded-xl border border-white/15 bg-[#0f1714] px-4 py-3 text-sm text-white outline-none transition-all duration-200 hover:border-white/25 focus:border-[#049552] focus:ring-2 focus:ring-[#049552]/15"
                >
                  <span className="truncate">{category}</span>

                  <ChevronDown
                    size={17}
                    className={`shrink-0 text-gray-500 transition-transform duration-200 ${
                      categoryOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Category Dropdown */}
                <div
                  className={`absolute bottom-full left-0 right-0 z-50 mb-2 max-h-60 origin-bottom overflow-y-auto rounded-xl border border-white/15 bg-[#17221d] p-1.5 shadow-2xl shadow-black/50 ring-1 ring-black/20 transition-all duration-200 ease-out md:top-full md:bottom-auto md:mt-2 md:mb-0 md:origin-top ${
                    categoryOpen
                      ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
                      : "pointer-events-none translate-y-1 scale-95 opacity-0"
                  }`}
                >
                  {categories.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => selectCategory(item)}
                      className={`flex w-full rounded-lg px-3 py-2.5 text-left text-sm transition-all duration-150 ${
                        category === item
                          ? "bg-[#049552]/10 text-[#049552]"
                          : "text-gray-300 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date */}
              <div className="relative z-10">
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Date
                </label>

                <DatePicker
                  value={date}
                  onChange={setDate}
                  dateFormat={dateFormat}
                />
              </div>
            </div>

            {/* Error */}
            <div
              className={`grid transition-all duration-200 ease-out ${
                error
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="flex items-center justify-between rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  <span>{error}</span>

                  <button
                    type="button"
                    onClick={() => setError("")}
                    className="transition-colors duration-150 hover:text-red-300"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#049552] px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#049552]/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#038448] hover:shadow-[#049552]/30 active:translate-y-0 active:scale-[0.99]"
            >
              <Plus size={18} className="transition-transform duration-200" />
              Add Transaction
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default AddTransaction;
