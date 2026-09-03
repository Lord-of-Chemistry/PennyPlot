import { useEffect, useMemo, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { toast } from "sonner";
import { formatCurrency, getCurrencySymbol } from "../utils/currency";
import { downloadCSV } from "../utils/exportCsv";
import { downloadTransactionsPDF } from "../utils/exportPdf";
import { downloadTransactionsPNG } from "../utils/exportPng";
import {
  Search,
  ArrowUpDown,
  Pencil,
  Trash2,
  X,
  Check,
  ChevronDown,
  Download,
} from "lucide-react";

function CustomDropdown({
  value,
  onChange,
  options,
  icon: Icon,
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedOption = options.find((option) => option.value === value);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function handleSelect(option) {
    onChange(option.value);
    setIsOpen(false);
  }

  return (
    <div ref={dropdownRef} className={`relative min-w-0 ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((previous) => !previous)}
        className={`flex w-full items-center justify-between gap-3 rounded-xl border bg-[#1b2922] px-4 py-3 text-sm text-white outline-none transition-all duration-200 ${
          isOpen
            ? "border-[#049552] ring-1 ring-[#049552]/30"
            : "border-white/10 hover:border-white/20"
        }`}
      >
        <span className="flex min-w-0 items-center gap-3">
          {Icon && (
            <Icon
              size={16}
              className={`shrink-0 transition-colors duration-200 ${
                isOpen ? "text-[#049552]" : "text-gray-500"
              }`}
            />
          )}

          <span className="truncate">{selectedOption?.label}</span>
        </span>

        <ChevronDown
          size={16}
          className={`shrink-0 text-gray-500 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-[#049552]" : ""
          }`}
        />
      </button>

      <div
        className={`absolute left-0 top-[calc(100%+8px)] z-50 w-full min-w-[180px] origin-top rounded-xl border border-white/10 bg-[#1b2922] p-1.5 shadow-2xl shadow-black/30 transition-all duration-200 ${
          isOpen
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none -translate-y-2 scale-95 opacity-0"
        }`}
      >
        {options.map((option) => {
          const isSelected = option.value === value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option)}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-all duration-150 ${
                isSelected
                  ? "bg-[#049552]/10 text-[#8ff0bc]"
                  : "text-gray-300 hover:bg-white/[0.06] hover:text-white"
              }`}
            >
              <span>{option.label}</span>

              {isSelected && <Check size={15} className="text-[#049552]" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Transactions() {
  const { transactions, setTransactions, currency } = useOutletContext();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState(null);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const categories = [
    "Food",
    "Transport",
    "Shopping",
    "Bills",
    "Entertainment",
    "Salary",
    "Freelance",
    "Other",
  ];

  const typeOptions = [
    { value: "all", label: "All types" },
    { value: "income", label: "Income" },
    { value: "expense", label: "Expenses" },
  ];

  const categoryOptions = [
    { value: "all", label: "All categories" },
    ...categories.map((category) => ({
      value: category,
      label: category,
    })),
  ];

  const sortOptions = [
    { value: "newest", label: "Newest first" },
    { value: "oldest", label: "Oldest first" },
    { value: "highest", label: "Highest amount" },
    { value: "lowest", label: "Lowest amount" },
    { value: "a-z", label: "A → Z" },
    { value: "z-a", label: "Z → A" },
  ];

  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    if (search.trim()) {
      const query = search.toLowerCase();

      result = result.filter(
        (transaction) =>
          transaction.description.toLowerCase().includes(query) ||
          transaction.category.toLowerCase().includes(query),
      );
    }

    if (typeFilter !== "all") {
      result = result.filter((transaction) => transaction.type === typeFilter);
    }

    if (categoryFilter !== "all") {
      result = result.filter(
        (transaction) => transaction.category === categoryFilter,
      );
    }

    if (sortBy === "newest") {
      result.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    if (sortBy === "oldest") {
      result.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    if (sortBy === "highest") {
      result.sort((a, b) => b.amount - a.amount);
    }

    if (sortBy === "lowest") {
      result.sort((a, b) => a.amount - b.amount);
    }

    if (sortBy === "a-z") {
      result.sort((a, b) => a.description.localeCompare(b.description));
    }

    if (sortBy === "z-a") {
      result.sort((a, b) => b.description.localeCompare(a.description));
    }

    return result;
  }, [transactions, search, typeFilter, categoryFilter, sortBy]);

  function handleDelete(id) {
    setTransactions((prev) =>
      prev.filter((transaction) => transaction.id !== id),
    );

    toast.success("Transaction deleted.");
  }

  function handleEdit(transaction) {
    setEditingId(transaction.id);

    setEditData({
      description: transaction.description,
      amount: transaction.amount.toLocaleString("en-NG"),
      type: transaction.type,
      category: transaction.category,
      date: transaction.date,
    });

    toast.info("Editing transaction");
  }

  function handleCancelEdit() {
    setEditingId(null);
    setEditData(null);

    toast.info("Editing cancelled");
  }

  function handleSaveEdit(id) {
    if (!editData.description.trim()) {
      toast.error("Please enter a description.");
      return;
    }

    const numericAmount = Number(editData.amount.replace(/,/g, ""));

    if (!numericAmount || numericAmount <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }

    setTransactions((prev) =>
      prev.map((transaction) =>
        transaction.id === id
          ? {
              ...transaction,
              description: editData.description.trim(),
              amount: numericAmount,
              type: editData.type,
              category: editData.category,
              date: editData.date,
            }
          : transaction,
      ),
    );

    setEditingId(null);
    setEditData(null);

    toast.success("Transaction updated successfully.");
  }

  function handleEditAmount(value) {
    const numbersOnly = value.replace(/\D/g, "");

    setEditData((prev) => ({
      ...prev,
      amount: numbersOnly ? Number(numbersOnly).toLocaleString("en-NG") : "",
    }));
  }

  function downloadTransactions() {
    if (transactions.length === 0) {
      toast.error("There are no transactions to export.");
      return;
    }

    const headers = [
      "Date",
      "Description",
      "Category",
      "Type",
      "Amount",
      "Currency",
    ];

    const rows = transactions.map((transaction) => [
      transaction.date,
      transaction.description,
      transaction.category,
      transaction.type,
      transaction.amount,
      currency,
    ]);

    downloadCSV(
      `pennyplot-transactions-${new Date().toISOString().split("T")[0]}.csv`,
      headers,
      rows,
    );

    toast.success("Transactions exported successfully.");
  }

  async function downloadTransactionsAsPNG() {
    if (transactions.length === 0) {
      toast.error("There are no transactions to export.");
      return;
    }

    try {
      downloadTransactionsPNG(transactions, currency);

      toast.success("Transaction summary exported as PNG.");
    } catch (error) {
      console.error("PNG export failed:", error);

      toast.error("Failed to export transaction summary.");
    }
  }

  return (
    <div className="min-h-screen bg-[#0f1714] text-white">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transactions</h1>

          <p className="mt-1 text-sm text-gray-400">
            View and manage all your financial activity.
          </p>
        </div>

        {/* Download Menu */}
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

          {/* Dropdown */}
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
                downloadTransactions();
                setIsDownloadOpen(false);
              }}
              className="group flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors duration-150 hover:bg-white/[0.06]"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#049552]/10 text-[#8ff0bc] transition-colors group-hover:bg-[#049552]/15">
                <Download size={16} />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-medium text-white">CSV</p>

                <p className="mt-0.5 text-xs text-gray-500">All transactions</p>
              </div>
            </button>

            {/* PDF */}
            <button
              type="button"
              onClick={() => {
  try {
    downloadTransactionsPDF(transactions, currency);
    toast.success("Transaction report exported successfully.");
  } catch (error) {
    console.error("PDF export failed:", error);
    toast.error("Failed to export transaction report.");
  }

  setIsDownloadOpen(false);
}}
              className="group flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors duration-150 hover:bg-white/[0.06]"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#049552]/10 text-[#8ff0bc] transition-colors group-hover:bg-[#049552]/15">
                {" "}
                <span className="text-[10px] font-bold tracking-wide">PDF</span>
              </div>

              <div className="min-w-0">
                <p className="text-sm font-medium text-white">PDF</p>

                <p className="mt-0.5 text-xs text-gray-500">
                  Transaction report
                </p>
              </div>
            </button>

            {/* PNG */}
            <button
              type="button"
              onClick={() => {
                downloadTransactionsAsPNG();
                toast.info("Downloading PNG...");
                setIsDownloadOpen(false);
              }}
              className="group flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors duration-150 hover:bg-white/[0.06]"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#049552]/10 text-[#8ff0bc] transition-colors group-hover:bg-[#049552]/15">
                {" "}
                <span className="text-[10px] font-bold tracking-wide">PNG</span>
              </div>

              <div className="min-w-0">
                <p className="text-sm font-medium text-white">PNG</p>

                <p className="mt-0.5 text-xs text-gray-500">
                  Transaction summary
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
      {/* Filters */}
      <div className="rounded-2xl border border-white/10 bg-[#22332b]/50 p-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto_auto]">
          {/* Search */}
          <div className="group relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 transition-colors duration-200 group-focus-within:text-[#049552]"
            />

            <input
              type="text"
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-11 pr-4 text-sm text-white outline-none transition-all duration-200 placeholder:text-gray-600 focus:border-[#049552] focus:ring-1 focus:ring-[#049552]/30"
            />
          </div>

          {/* Type Dropdown */}
          <CustomDropdown
            value={typeFilter}
            onChange={setTypeFilter}
            options={typeOptions}
          />

          {/* Category Dropdown */}
          <CustomDropdown
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={categoryOptions}
          />

          {/* Sort Dropdown */}
          <CustomDropdown
            value={sortBy}
            onChange={setSortBy}
            options={sortOptions}
            icon={ArrowUpDown}
          />
        </div>
      </div>

      {/* Result Count */}
      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-gray-400">
          Showing{" "}
          <span className="font-medium text-white">
            {filteredTransactions.length}
          </span>{" "}
          {filteredTransactions.length === 1 ? "transaction" : "transactions"}
        </p>

        {(search || typeFilter !== "all" || categoryFilter !== "all") && (
          <button
            onClick={() => {
              setSearch("");
              setTypeFilter("all");
              setCategoryFilter("all");
            }}
            className="flex items-center gap-1 text-xs text-gray-400 transition-all duration-200 hover:-translate-y-0.5 hover:text-white"
          >
            <X size={14} />
            Clear filters
          </button>
        )}
      </div>

      {/* Transactions */}
      <div className="mt-4 space-y-3">
        {filteredTransactions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-[#22332b]/30 px-5 py-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-gray-500">
              <Search size={20} />
            </div>

            <h2 className="mt-4 font-semibold text-white">
              No transactions found
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {transactions.length === 0
                ? "You haven't added any transactions yet."
                : "Try changing your search or filters."}
            </p>
          </div>
        ) : (
          filteredTransactions.map((transaction) => {
            const isEditing = editingId === transaction.id;

            return (
              <div
                key={transaction.id}
                className="transaction-item rounded-2xl border border-white/10 bg-[#22332b]/40 p-4 transition hover:border-white/15"
              >
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      {/* Description */}
                      <input
                        type="text"
                        value={editData.description}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            description: e.target.value,
                          })
                        }
                        className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition-all duration-200 focus:border-[#049552] focus:ring-1 focus:ring-[#049552]/30"
                      />

                      {/* Amount */}
                      <div className="flex overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] transition-all duration-200 focus-within:border-[#049552] focus-within:ring-1 focus-within:ring-[#049552]/30">
                        <span className="flex items-center border-r border-white/10 px-4 text-gray-400">
                          {getCurrencySymbol(currency)}
                        </span>

                        <input
                          type="text"
                          inputMode="numeric"
                          value={editData.amount}
                          onChange={(e) => handleEditAmount(e.target.value)}
                          className="w-full bg-transparent px-4 py-3 text-sm text-white outline-none"
                        />
                      </div>

                      {/* Edit Type */}
                      <CustomDropdown
                        value={editData.type}
                        onChange={(value) =>
                          setEditData({
                            ...editData,
                            type: value,
                          })
                        }
                        options={[
                          {
                            value: "expense",
                            label: "Expense",
                          },
                          {
                            value: "income",
                            label: "Income",
                          },
                        ]}
                      />

                      {/* Edit Category */}
                      <CustomDropdown
                        value={editData.category}
                        onChange={(value) =>
                          setEditData({
                            ...editData,
                            category: value,
                          })
                        }
                        options={categories.map((category) => ({
                          value: category,
                          label: category,
                        }))}
                      />

                      {/* Date */}
                      <input
                        type="date"
                        value={editData.date}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            date: e.target.value,
                          })
                        }
                        className="rounded-xl border border-white/10 bg-[#1b2922] px-4 py-3 text-sm text-white outline-none transition-all duration-200 focus:border-[#049552] focus:ring-1 focus:ring-[#049552]/30"
                      />
                    </div>

                    {/* Edit Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveEdit(transaction.id)}
                        className="flex items-center gap-2 rounded-xl bg-[#049552] px-4 py-2 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#038448]"
                      >
                        <Check size={16} />
                        Save
                      </button>

                      <button
                        onClick={handleCancelEdit}
                        className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm text-gray-300 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/5"
                      >
                        <X size={16} />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-white">
                        {transaction.description}
                      </p>

                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                        <span>{transaction.category}</span>
                        <span>•</span>
                        <span>{transaction.date}</span>
                        <span>•</span>

                        <span
                          className={
                            transaction.type === "income"
                              ? "text-[#049552]"
                              : "text-red-400"
                          }
                        >
                          {transaction.type === "income" ? "Income" : "Expense"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-5 md:justify-end">
                      <span
                        className={
                          transaction.type === "income"
                            ? "font-semibold text-[#049552]"
                            : "font-semibold text-red-400"
                        }
                      >
                        {transaction.type === "income" ? "+" : "-"}
                        {formatCurrency(transaction.amount, currency)}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEdit(transaction)}
                          className="rounded-lg p-2 text-gray-500 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/5 hover:text-white"
                          title="Edit transaction"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          onClick={() => handleDelete(transaction.id)}
                          className="rounded-lg p-2 text-gray-500 transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-500/10 hover:text-red-400"
                          title="Delete transaction"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Transactions;
