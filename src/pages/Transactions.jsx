import { useEffect, useMemo, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  ArrowDownRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  Download,
  Edit3,
  FileSpreadsheet,
  FileText,
  Filter,
  MoreHorizontal,
  Search,
  Trash2,
  X,
} from "lucide-react";

import DatePicker from "@/components/DatePicker";

const expenseCategories = [
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Entertainment",
  "Health",
  "Education",
  "Other",
];

const incomeCategories = [
  "Salary",
  "Freelance",
  "Business",
  "Gift",
  "Investment",
  "Other",
];

function parseTransactionDate(date) {
  if (!date) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [year, month, day] = date.split("-").map(Number);
    const parsed = new Date(year, month - 1, day);

    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const parsed = new Date(date);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getMonthKey(date) {
  const parsedDate = parseTransactionDate(date);

  if (!parsedDate) return null;

  return `${parsedDate.getFullYear()}-${String(
    parsedDate.getMonth() + 1
  ).padStart(2, "0")}`;
}

function formatMonthLabel(monthKey) {
  if (!monthKey) return "Unknown date";

  const [year, month] = monthKey.split("-").map(Number);

  return new Date(year, month - 1, 1).toLocaleDateString("en-NG", {
    month: "long",
    year: "numeric",
  });
}

function formatTransactionDate(date) {
  const parsedDate = parseTransactionDate(date);

  if (!parsedDate) return "Unknown date";

  return parsedDate.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatAmount(amount) {
  return Number(amount || 0).toLocaleString("en-NG");
}

function getInitial(description) {
  return description?.trim()?.charAt(0)?.toUpperCase() || "?";
}

function getCategories(type, customCategories) {
  const defaults =
    type === "income" ? incomeCategories : expenseCategories;

  return [...new Set([...defaults, ...customCategories])];
}

function Transactions() {
  const {
    transactions,
    setTransactions,
    currency,
  } = useOutletContext();

  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  const [showFilters, setShowFilters] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [openTransactionMenu, setOpenTransactionMenu] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);

  const filterRef = useRef(null);
  const exportRef = useRef(null);
  const transactionMenuRef = useRef(null);

  const customCategories = useMemo(() => {
    try {
      const saved = localStorage.getItem("pennyplot-custom-categories");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }, []);

  const allCategories = useMemo(() => {
    return [
      ...new Set([
        ...expenseCategories,
        ...incomeCategories,
        ...customCategories,
        ...transactions.map((transaction) => transaction.category).filter(Boolean),
      ]),
    ];
  }, [transactions, customCategories]);

  useEffect(() => {
    function handlePointerDown(event) {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target)
      ) {
        setShowFilters(false);
      }

      if (
        exportRef.current &&
        !exportRef.current.contains(event.target)
      ) {
        setShowExportMenu(false);
      }

      if (
        transactionMenuRef.current &&
        !transactionMenuRef.current.contains(event.target)
      ) {
        setOpenTransactionMenu(null);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setShowFilters(false);
        setShowExportMenu(false);
        setOpenTransactionMenu(null);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const filteredTransactions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return transactions.filter((transaction) => {
      const matchesSearch =
        !query ||
        transaction.description?.toLowerCase().includes(query) ||
        transaction.category?.toLowerCase().includes(query) ||
        transaction.type?.toLowerCase().includes(query);

      const matchesType =
        typeFilter === "all" || transaction.type === typeFilter;

      const matchesCategory =
        categoryFilter === "all" ||
        transaction.category === categoryFilter;

      return matchesSearch && matchesType && matchesCategory;
    });
  }, [transactions, searchQuery, typeFilter, categoryFilter]);

  const sortedTransactions = useMemo(() => {
    const result = [...filteredTransactions];

    result.sort((a, b) => {
      if (sortOrder === "highest") {
        return Number(b.amount || 0) - Number(a.amount || 0);
      }

      if (sortOrder === "lowest") {
        return Number(a.amount || 0) - Number(b.amount || 0);
      }

      const dateA = parseTransactionDate(a.date);
      const dateB = parseTransactionDate(b.date);

      const timeA = dateA ? dateA.getTime() : 0;
      const timeB = dateB ? dateB.getTime() : 0;

      return sortOrder === "oldest"
        ? timeA - timeB
        : timeB - timeA;
    });

    return result;
  }, [filteredTransactions, sortOrder]);

  const groupedTransactions = useMemo(() => {
    if (sortOrder === "highest" || sortOrder === "lowest") {
      return [
        {
          monthKey: "all",
          label: "All transactions",
          transactions: sortedTransactions,
        },
      ];
    }

    const groups = new Map();

    sortedTransactions.forEach((transaction) => {
      const monthKey = getMonthKey(transaction.date) || "unknown";

      if (!groups.has(monthKey)) {
        groups.set(monthKey, []);
      }

      groups.get(monthKey).push(transaction);
    });

    return Array.from(groups.entries()).map(([monthKey, monthTransactions]) => ({
      monthKey,
      label:
        monthKey === "unknown"
          ? "Unknown date"
          : formatMonthLabel(monthKey),
      transactions: monthTransactions,
    }));
  }, [sortedTransactions, sortOrder]);

  const overallIncome = useMemo(
    () =>
      transactions
        .filter((transaction) => transaction.type === "income")
        .reduce((total, transaction) => total + Number(transaction.amount || 0), 0),
    [transactions]
  );

  const overallExpenses = useMemo(
    () =>
      transactions
        .filter((transaction) => transaction.type === "expense")
        .reduce((total, transaction) => total + Number(transaction.amount || 0), 0),
    [transactions]
  );

  const activeFilterCount = [
    typeFilter !== "all",
    categoryFilter !== "all",
    sortOrder !== "newest",
  ].filter(Boolean).length;

  function startEditing(transaction) {
    setEditingId(transaction.id);
    setOpenTransactionMenu(null);

    setEditForm({
      description: transaction.description || "",
      amount: String(transaction.amount ?? ""),
      type: transaction.type || "expense",
      category: transaction.category || "",
      date: transaction.date || "",
    });
  }

  function cancelEditing() {
    setEditingId(null);
    setEditForm(null);
  }

  function handleEditTypeChange(type) {
    setEditForm((current) => {
      const validCategories = getCategories(type, customCategories);

      const categoryStillValid = validCategories.includes(current.category);

      return {
        ...current,
        type,
        category: categoryStillValid ? current.category : "",
      };
    });
  }

  function saveEdit(transactionId) {
    if (!editForm) return;

    const description = editForm.description.trim();
    const numericAmount = Number(editForm.amount);
    const parsedDate = parseTransactionDate(editForm.date);

    if (!description) return;
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) return;
    if (!editForm.category) return;
    if (!parsedDate) return;

    setTransactions((currentTransactions) =>
      currentTransactions.map((transaction) =>
        transaction.id === transactionId
          ? {
              ...transaction,
              description,
              amount: numericAmount,
              type: editForm.type,
              category: editForm.category,
              date: editForm.date,
            }
          : transaction
      )
    );

    cancelEditing();
  }

  function deleteTransaction(transactionId) {
    const transaction = transactions.find(
      (item) => item.id === transactionId
    );

    if (!transaction) return;

    const confirmed = window.confirm(
      `Delete "${transaction.description}"?`
    );

    if (!confirmed) return;

    setTransactions((currentTransactions) =>
      currentTransactions.filter(
        (item) => item.id !== transactionId
      )
    );

    setOpenTransactionMenu(null);

    if (editingId === transactionId) {
      cancelEditing();
    }
  }

  function clearFilters() {
    setSearchQuery("");
    setTypeFilter("all");
    setCategoryFilter("all");
    setSortOrder("newest");
  }

  function exportCSV() {
    const headers = [
      "Description",
      "Type",
      "Category",
      "Amount",
      "Date",
    ];

    const rows = sortedTransactions.map((transaction) => [
      transaction.description,
      transaction.type,
      transaction.category,
      transaction.amount,
      transaction.date,
    ]);

    const csv = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map((value) =>
            `"${String(value ?? "").replace(/"/g, '""')}"`
          )
          .join(",")
      )
      .join("\n");

    downloadFile(csv, "pennyplot-transactions.csv", "text/csv");
  }

  function exportJSON() {
    const json = JSON.stringify(sortedTransactions, null, 2);

    downloadFile(
      json,
      "pennyplot-transactions.json",
      "application/json"
    );
  }

  function downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);

    setShowExportMenu(false);
  }

  return (
    <div className="min-h-screen px-4 py-6 pb-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Your financial activity
            </p>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
              Transactions
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative" ref={exportRef}>
              <button
                type="button"
                onClick={() => {
                  setShowExportMenu((current) => !current);
                  setShowFilters(false);
                }}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-background px-3 text-sm font-medium transition hover:bg-muted"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </button>

              {showExportMenu && (
                <div className="absolute right-0 z-50 mt-2 w-52 rounded-xl border border-border bg-popover p-1.5 text-popover-foreground shadow-xl">
                  <button
                    type="button"
                    onClick={exportCSV}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition hover:bg-muted"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    Export CSV
                  </button>

                  <button
                    type="button"
                    onClick={exportJSON}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition hover:bg-muted"
                  >
                    <FileText className="h-4 w-4" />
                    Export JSON
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <section className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card/50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Overall income
            </p>

            <p className="mt-2 text-xl font-semibold">
              {currency} {formatAmount(overallIncome)}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card/50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Overall expenses
            </p>

            <p className="mt-2 text-xl font-semibold">
              {currency} {formatAmount(overallExpenses)}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card/50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Transactions
            </p>

            <p className="mt-2 text-xl font-semibold">
              {filteredTransactions.length}
            </p>
          </div>
        </section>

        <section className="relative z-40 rounded-2xl border border-border bg-card/50 p-3 sm:p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search transactions..."
                className="h-10 w-full rounded-xl border border-border bg-background pl-9 pr-9 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary/60 focus:ring-1 focus:ring-primary/10"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">
              {[
                ["all", "All"],
                ["income", "Income"],
                ["expense", "Expenses"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTypeFilter(value)}
                  className={`h-10 shrink-0 rounded-xl px-3 text-sm font-medium transition ${
                    typeFilter === value
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}

              <div className="relative shrink-0" ref={filterRef}>
                <button
                  type="button"
                  onClick={() => {
                    setShowFilters((current) => !current);
                    setShowExportMenu(false);
                  }}
                  className={`inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-sm font-medium transition ${
                    showFilters || activeFilterCount
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Filter className="h-4 w-4" />
                  Filters

                  {activeFilterCount > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-semibold text-primary-foreground">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                {showFilters && (
                  <div className="absolute right-0 z-50 mt-2 w-[min(18rem,calc(100vw-2rem))] rounded-xl border border-border bg-popover p-4 text-popover-foreground shadow-xl">
                    <div className="space-y-4">
                      <div>
                        <label className="mb-2 block text-xs font-medium text-muted-foreground">
                          Category
                        </label>

                        <select
                          value={categoryFilter}
                          onChange={(event) =>
                            setCategoryFilter(event.target.value)
                          }
                          className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary/60"
                        >
                          <option value="all">All categories</option>

                          {allCategories.map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-medium text-muted-foreground">
                          Sort by
                        </label>

                        <select
                          value={sortOrder}
                          onChange={(event) =>
                            setSortOrder(event.target.value)
                          }
                          className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary/60"
                        >
                          <option value="newest">Newest first</option>
                          <option value="oldest">Oldest first</option>
                          <option value="highest">Highest amount</option>
                          <option value="lowest">Lowest amount</option>
                        </select>
                      </div>

                      {activeFilterCount > 0 && (
                        <button
                          type="button"
                          onClick={clearFilters}
                          className="w-full rounded-xl bg-muted px-3 py-2.5 text-sm font-medium transition hover:bg-muted/80"
                        >
                          Clear filters
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {groupedTransactions.length === 0 ||
        groupedTransactions.every(
          (group) => group.transactions.length === 0
        ) ? (
          <div className="rounded-2xl border border-dashed border-border px-6 py-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>

            <h2 className="mt-4 font-semibold">
              No transactions found
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Try changing your search or filters.
            </p>

            {(searchQuery ||
              typeFilter !== "all" ||
              categoryFilter !== "all" ||
              sortOrder !== "newest") && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 text-sm font-medium text-primary hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {groupedTransactions.map((group) => {
              const income = group.transactions
                .filter((transaction) => transaction.type === "income")
                .reduce(
                  (total, transaction) =>
                    total + Number(transaction.amount || 0),
                  0
                );

              const expenses = group.transactions
                .filter((transaction) => transaction.type === "expense")
                .reduce(
                  (total, transaction) =>
                    total + Number(transaction.amount || 0),
                  0
                );

              return (
                <section key={group.monthKey}>
                  <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <h2 className="font-semibold">{group.label}</h2>

                      <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                        {income > 0 && (
                          <span>
                            In {currency} {formatAmount(income)}
                          </span>
                        )}

                        {expenses > 0 && (
                          <span>
                            Out {currency} {formatAmount(expenses)}
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="text-xs text-muted-foreground">
                      {group.transactions.length}{" "}
                      {group.transactions.length === 1
                        ? "transaction"
                        : "transactions"}
                    </span>
                  </div>

                  <div className="divide-y divide-border/60">
                    {group.transactions.map((transaction) => {
                      const isIncome = transaction.type === "income";
                      const isEditing = editingId === transaction.id;

                      if (isEditing && editForm) {
                        const categories = getCategories(
                          editForm.type,
                          customCategories
                        );

                        return (
                          <div
                            key={transaction.id}
                            className="py-4"
                          >
                            <div className="rounded-2xl border border-border bg-card p-4">
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <p className="font-medium">
                                    Edit transaction
                                  </p>

                                  <p className="mt-1 text-xs text-muted-foreground">
                                    Update the details below.
                                  </p>
                                </div>

                                <button
                                  type="button"
                                  onClick={cancelEditing}
                                  className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                                  aria-label="Cancel editing"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>

                              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                                    Description
                                  </label>

                                  <input
                                    value={editForm.description}
                                    onChange={(event) =>
                                      setEditForm((current) => ({
                                        ...current,
                                        description: event.target.value,
                                      }))
                                    }
                                    className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary/60"
                                  />
                                </div>

                                <div>
                                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                                    Amount
                                  </label>

                                  <input
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    value={editForm.amount}
                                    onChange={(event) =>
                                      setEditForm((current) => ({
                                        ...current,
                                        amount: event.target.value,
                                      }))
                                    }
                                    className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary/60"
                                  />
                                </div>

                                <div>
                                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                                    Date
                                  </label>

                                  <DatePicker
                                    value={editForm.date}
                                    onChange={(date) =>
                                      setEditForm((current) => ({
                                        ...current,
                                        date,
                                      }))
                                    }
                                  />
                                </div>

                                <div>
                                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                                    Type
                                  </label>

                                  <div className="grid grid-cols-2 gap-2">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleEditTypeChange("expense")
                                      }
                                      className={`h-10 rounded-xl text-sm font-medium transition ${
                                        editForm.type === "expense"
                                          ? "bg-primary text-primary-foreground"
                                          : "bg-muted text-muted-foreground hover:text-foreground"
                                      }`}
                                    >
                                      Expense
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleEditTypeChange("income")
                                      }
                                      className={`h-10 rounded-xl text-sm font-medium transition ${
                                        editForm.type === "income"
                                          ? "bg-primary text-primary-foreground"
                                          : "bg-muted text-muted-foreground hover:text-foreground"
                                      }`}
                                    >
                                      Income
                                    </button>
                                  </div>
                                </div>

                                <div>
                                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                                    Category
                                  </label>

                                  <select
                                    value={editForm.category}
                                    onChange={(event) =>
                                      setEditForm((current) => ({
                                        ...current,
                                        category: event.target.value,
                                      }))
                                    }
                                    className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary/60"
                                  >
                                    <option value="">
                                      Select category
                                    </option>

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
                              </div>

                              <div className="mt-4 flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={cancelEditing}
                                  className="rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
                                >
                                  Cancel
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    saveEdit(transaction.id)
                                  }
                                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
                                >
                                  <Check className="h-4 w-4" />
                                  Save changes
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={transaction.id}
                          className="group relative flex items-center gap-3 py-4"
                        >
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                              isIncome
                                ? "bg-emerald-500/10 text-emerald-500"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {isIncome ? (
                              <ArrowDownRight className="h-4 w-4" />
                            ) : (
                              <ArrowUpRight className="h-4 w-4" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="truncate text-sm font-medium">
                                {transaction.description}
                              </p>

                              <span className="hidden shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground sm:inline">
                                {transaction.category || "Uncategorized"}
                              </span>
                            </div>

                            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                              <span className="sm:hidden">
                                {transaction.category || "Uncategorized"}
                              </span>

                              <span className="sm:hidden">·</span>

                              <span>
                                {formatTransactionDate(transaction.date)}
                              </span>
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-2">
                            <p
                              className={`text-sm font-semibold ${
                                isIncome
                                  ? "text-emerald-500"
                                  : "text-foreground"
                              }`}
                            >
                              {isIncome ? "+" : "−"} {currency}{" "}
                              {formatAmount(transaction.amount)}
                            </p>

                            <div className="relative" ref={openTransactionMenu === transaction.id ? transactionMenuRef : null}>
                              <button
                                type="button"
                                onClick={() =>
                                  setOpenTransactionMenu((current) =>
                                    current === transaction.id
                                      ? null
                                      : transaction.id
                                  )
                                }
                                className="rounded-lg p-2 text-muted-foreground opacity-100 transition hover:bg-muted hover:text-foreground sm:opacity-0 sm:group-hover:opacity-100"
                                aria-label="Transaction actions"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </button>

                              {openTransactionMenu === transaction.id && (
                                <div className="absolute right-0 top-full z-50 mt-1 w-36 rounded-xl border border-border bg-popover p-1.5 text-popover-foreground shadow-xl">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      startEditing(transaction)
                                    }
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition hover:bg-muted"
                                  >
                                    <Edit3 className="h-4 w-4" />
                                    Edit
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      deleteTransaction(transaction.id)
                                    }
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-destructive transition hover:bg-destructive/10"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Transactions;

