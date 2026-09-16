import { useMemo, useState } from "react";
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
  X,
  Trash2,
} from "lucide-react";
import DatePicker from "../components/DatePicker";
import { formatCurrency, getCurrencySymbol } from "../utils/currency";

function parseTransactionDate(date) {
  if (!date) return new Date();

  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [year, month, day] = date.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  return new Date(date);
}

function getMonthKey(date) {
  const transactionDate = parseTransactionDate(date);

  return `${transactionDate.getFullYear()}-${String(
    transactionDate.getMonth() + 1,
  ).padStart(2, "0")}`;
}

function formatMonthLabel(monthKey) {
  const [year, month] = monthKey.split("-").map(Number);

  return new Date(year, month - 1, 1).toLocaleDateString("en-NG", {
    month: "long",
    year: "numeric",
  });
}

function formatTransactionDate(date) {
  const transactionDate = parseTransactionDate(date);

  return transactionDate.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
  });
}

function formatTransactionTime(date) {
  const transactionDate = parseTransactionDate(date);

  return transactionDate.toLocaleTimeString("en-NG", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function getInitial(description = "") {
  return description.trim().charAt(0).toUpperCase() || "•";
}

function groupTransactionsByMonth(transactions) {
  return transactions.reduce((groups, transaction) => {
    const monthKey = getMonthKey(transaction.date);

    if (!groups[monthKey]) {
      groups[monthKey] = [];
    }

    groups[monthKey].push(transaction);

    return groups;
  }, {});
}

function Transactions() {
  const { transactions, setTransactions, currency, dateFormat } =
    useOutletContext();

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);

  const categories = useMemo(() => {
    return [
      ...new Set(
        transactions
          .map((transaction) => transaction.category)
          .filter(Boolean),
      ),
    ].sort();
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return [...transactions]
      .filter((transaction) => {
        if (typeFilter !== "all" && transaction.type !== typeFilter) {
          return false;
        }

        if (
          categoryFilter !== "all" &&
          transaction.category !== categoryFilter
        ) {
          return false;
        }

        if (!query) return true;

        return [
          transaction.description,
          transaction.category,
          transaction.type,
        ]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(query));
      })
      .sort((a, b) => {
        const dateDifference =
          parseTransactionDate(b.date) - parseTransactionDate(a.date);

        if (sortOrder === "oldest") {
          return -dateDifference;
        }

        if (sortOrder === "highest") {
          return Number(b.amount || 0) - Number(a.amount || 0);
        }

        if (sortOrder === "lowest") {
          return Number(a.amount || 0) - Number(b.amount || 0);
        }

        return dateDifference;
      });
  }, [
    transactions,
    searchTerm,
    typeFilter,
    categoryFilter,
    sortOrder,
  ]);

  const groupedTransactions = useMemo(
    () => groupTransactionsByMonth(filteredTransactions),
    [filteredTransactions],
  );

  const sortedMonths = useMemo(() => {
    return Object.entries(groupedTransactions).sort(
      ([monthA], [monthB]) =>
        sortOrder === "oldest"
          ? monthA.localeCompare(monthB)
          : monthB.localeCompare(monthA),
    );
  }, [groupedTransactions, sortOrder]);

  const totalIncome = useMemo(
    () =>
      transactions
        .filter((transaction) => transaction.type === "income")
        .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0),
    [transactions],
  );

  const totalExpenses = useMemo(
    () =>
      transactions
        .filter((transaction) => transaction.type === "expense")
        .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0),
    [transactions],
  );

  function getMonthTotals(monthTransactions) {
    return monthTransactions.reduce(
      (totals, transaction) => {
        const amount = Number(transaction.amount || 0);

        if (transaction.type === "income") {
          totals.income += amount;
        } else {
          totals.expenses += amount;
        }

        return totals;
      },
      { income: 0, expenses: 0 },
    );
  }

  function startEditing(transaction) {
    setEditingId(transaction.id);

    setEditForm({
      description: transaction.description,
      amount: transaction.amount,
      type: transaction.type,
      category: transaction.category || "",
      date: transaction.date,
    });
  }

  function cancelEditing() {
    setEditingId(null);
    setEditForm(null);
  }

  function saveEdit() {
    if (!editForm?.description?.trim() || !editForm.amount) {
      return;
    }

    setTransactions((currentTransactions) =>
      currentTransactions.map((transaction) =>
        transaction.id === editingId
          ? {
              ...transaction,
              ...editForm,
              description: editForm.description.trim(),
              amount: Number(editForm.amount),
            }
          : transaction,
      ),
    );

    cancelEditing();
  }

  function deleteTransaction(id) {
    const confirmed = window.confirm(
      "Delete this transaction? This cannot be undone.",
    );

    if (!confirmed) return;

    setTransactions((currentTransactions) =>
      currentTransactions.filter((transaction) => transaction.id !== id),
    );

    if (editingId === id) {
      cancelEditing();
    }
  }

  function exportCSV() {
    const headers = ["Date", "Description", "Category", "Type", "Amount"];

    const rows = filteredTransactions.map((transaction) => [
      transaction.date,
      transaction.description,
      transaction.category || "",
      transaction.type,
      transaction.amount,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "pennyplot-transactions.csv";
    link.click();

    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  }

  function exportJSON() {
    const blob = new Blob([JSON.stringify(filteredTransactions, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "pennyplot-transactions.json";
    link.click();

    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  }

  return (
    <section className="min-h-screen px-4 pb-28 pt-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Page heading */}
        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
              Your money, in motion.
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Transactions
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
              Everything you&apos;ve earned and spent, in one place.
            </p>
          </div>

          <div className="relative self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setShowExportMenu((current) => !current)}
              className="flex items-center gap-2 rounded-xl border border-border/70 bg-card px-3.5 py-2.5 text-sm font-medium text-secondary-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Download size={15} />
              Export
              <ChevronDown
                size={14}
                className={`transition-transform ${
                  showExportMenu ? "rotate-180" : ""
                }`}
              />
            </button>

            {showExportMenu && (
              <div className="absolute right-0 top-full z-30 mt-2 w-48 overflow-hidden rounded-xl border border-border bg-card p-1.5 shadow-xl">
                <button
                  type="button"
                  onClick={exportCSV}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm text-secondary-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <FileSpreadsheet size={15} />
                  Export CSV
                </button>

                <button
                  type="button"
                  onClick={exportJSON}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm text-secondary-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <FileText size={15} />
                  Export JSON
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Overall activity */}
        <section className="mt-10 border-y border-border/60 py-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                All activity
              </p>

              <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
                {formatCurrency(totalIncome - totalExpenses, currency)}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Net across all recorded transactions
              </p>
            </div>

            <div className="flex gap-8">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <ArrowUpRight size={13} className="text-primary" />
                  In
                </div>

                <p className="mt-1 text-sm font-medium text-foreground">
                  {formatCurrency(totalIncome, currency)}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <ArrowDownRight size={13} />
                  Out
                </div>

                <p className="mt-1 text-sm font-medium text-foreground">
                  {formatCurrency(totalExpenses, currency)}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Search and filters */}
        <section className="mt-7">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative min-w-0 flex-1">
              <Search
                size={16}
                aria-hidden="true"
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              />

              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search transactions..."
                className="h-11 w-full rounded-xl border border-border/70 bg-card pl-10 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
              {[
                ["all", "All"],
                ["income", "Income"],
                ["expense", "Expenses"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTypeFilter(value)}
                  className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-sm transition-colors ${
                    typeFilter === value
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowFilters((current) => !current)}
                  className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm transition-colors ${
                    showFilters ||
                    categoryFilter !== "all" ||
                    sortOrder !== "newest"
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  <Filter size={14} />
                  More
                  <ChevronDown
                    size={13}
                    className={`transition-transform ${
                      showFilters ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {showFilters && (
                  <div className="absolute right-0 top-full z-30 mt-2 w-64 rounded-xl border border-border bg-card p-4 shadow-xl">
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                        Category
                      </p>

                      <div className="mt-2 flex max-h-36 flex-wrap gap-1.5 overflow-y-auto">
                        <button
                          type="button"
                          onClick={() => setCategoryFilter("all")}
                          className={`rounded-md px-2.5 py-1.5 text-xs transition-colors ${
                            categoryFilter === "all"
                              ? "bg-foreground text-background"
                              : "bg-accent text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          All
                        </button>

                        {categories.map((category) => (
                          <button
                            key={category}
                            type="button"
                            onClick={() => setCategoryFilter(category)}
                            className={`rounded-md px-2.5 py-1.5 text-xs transition-colors ${
                              categoryFilter === category
                                ? "bg-foreground text-background"
                                : "bg-accent text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {category}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mt-5 border-t border-border/60 pt-4">
                      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                        Sort
                      </p>

                      <div className="mt-2 space-y-1">
                        {[
                          ["newest", "Newest first"],
                          ["oldest", "Oldest first"],
                          ["highest", "Highest amount"],
                          ["lowest", "Lowest amount"],
                        ].map(([value, label]) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setSortOrder(value)}
                            className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm text-secondary-foreground transition-colors hover:bg-accent hover:text-foreground"
                          >
                            {label}

                            {sortOrder === value && (
                              <Check size={14} className="text-primary" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {(searchTerm ||
            typeFilter !== "all" ||
            categoryFilter !== "all") && (
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <span>
                {filteredTransactions.length} result
                {filteredTransactions.length === 1 ? "" : "s"}
              </span>

              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setTypeFilter("all");
                  setCategoryFilter("all");
                }}
                className="flex items-center gap-1 text-foreground hover:text-primary"
              >
                <X size={12} />
                Clear filters
              </button>
            </div>
          )}
        </section>

        {/* Monthly transaction groups */}
        <section className="mt-10">
          {sortedMonths.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center border-t border-border/60 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground">
                <Search size={16} />
              </div>

              <p className="mt-4 text-sm font-medium text-foreground">
                No transactions found
              </p>

              <p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
                Try changing your search or filters.
              </p>
            </div>
          ) : (
            <div className="space-y-14">
              {sortedMonths.map(([monthKey, monthTransactions]) => {
                const totals = getMonthTotals(monthTransactions);
                const net = totals.income - totals.expenses;

                return (
                  <section key={monthKey}>
                    {/* Month header */}
                    <div className="border-b border-border/70 pb-4">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                          <h2 className="text-lg font-semibold tracking-tight text-foreground">
                            {formatMonthLabel(monthKey)}
                          </h2>

                          <p className="mt-1 text-xs text-muted-foreground">
                            {monthTransactions.length} transaction
                            {monthTransactions.length === 1 ? "" : "s"}
                            <span className="mx-1.5">·</span>
                            Net{" "}
                            <span
                              className={
                                net >= 0
                                  ? "text-primary"
                                  : "text-foreground"
                              }
                            >
                              {formatCurrency(net, currency)}
                            </span>
                          </p>
                        </div>

                        <div className="flex gap-6 sm:gap-8">
                          <div>
                            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                              In
                            </p>

                            <p className="mt-1 text-sm font-medium text-primary">
                              {formatCurrency(totals.income, currency)}
                            </p>
                          </div>

                          <div>
                            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                              Out
                            </p>

                            <p className="mt-1 text-sm font-medium text-foreground">
                              {formatCurrency(totals.expenses, currency)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Transactions within month */}
                    <div>
                      {monthTransactions.map((transaction) => {
                        const isEditing = editingId === transaction.id;
                        const isIncome = transaction.type === "income";

                        if (isEditing) {
                          return (
                            <div
                              key={transaction.id}
                              className="border-b border-border/60 bg-accent/20 py-5"
                            >
                              <div className="flex items-center justify-between">
                                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-primary">
                                  Editing transaction
                                </p>

                                <button
                                  type="button"
                                  onClick={cancelEditing}
                                  className="text-muted-foreground transition-colors hover:text-foreground"
                                  aria-label="Cancel editing"
                                >
                                  <X size={16} />
                                </button>
                              </div>

                              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                <input
                                  type="text"
                                  value={editForm.description}
                                  onChange={(event) =>
                                    setEditForm((current) => ({
                                      ...current,
                                      description: event.target.value,
                                    }))
                                  }
                                  placeholder="Description"
                                  className="h-11 rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary/50"
                                />

                                <div className="relative">
                                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                    {getCurrencySymbol(currency)}
                                  </span>

                                  <input
                                    type="number"
                                    min="0"
                                    value={editForm.amount}
                                    onChange={(event) =>
                                      setEditForm((current) => ({
                                        ...current,
                                        amount: event.target.value,
                                      }))
                                    }
                                    className="h-11 w-full rounded-xl border border-border bg-background pl-8 pr-3 text-sm text-foreground outline-none focus:border-primary/50"
                                  />
                                </div>

                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setEditForm((current) => ({
                                        ...current,
                                        type:
                                          current.type === "income"
                                            ? "expense"
                                            : "income",
                                      }))
                                    }
                                    className="flex-1 rounded-xl border border-border bg-background px-3 py-2.5 text-left text-sm text-foreground"
                                  >
                                    {editForm.type === "income"
                                      ? "Income"
                                      : "Expense"}
                                  </button>

                                  <input
                                    type="text"
                                    value={editForm.category}
                                    onChange={(event) =>
                                      setEditForm((current) => ({
                                        ...current,
                                        category: event.target.value,
                                      }))
                                    }
                                    placeholder="Category"
                                    className="flex-1 rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary/50"
                                  />
                                </div>

                                <DatePicker
                                  value={editForm.date}
                                  onChange={(date) =>
                                    setEditForm((current) => ({
                                      ...current,
                                      date,
                                    }))
                                  }
                                  dateFormat={dateFormat}
                                />
                              </div>

                              <div className="mt-4 flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={cancelEditing}
                                  className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                                >
                                  Cancel
                                </button>

                                <button
                                  type="button"
                                  onClick={saveEdit}
                                  className="flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                                >
                                  <Check size={14} />
                                  Save changes
                                </button>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={transaction.id}
                            className="group flex items-center gap-3 border-b border-border/40 py-4"
                          >
                            <div
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-xs font-medium ${
                                isIncome
                                  ? "border-primary/20 bg-primary/10 text-primary"
                                  : "border-border bg-accent text-muted-foreground"
                              }`}
                            >
                              {getInitial(transaction.description)}
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-foreground">
                                {transaction.description}
                              </p>

                              <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                                <span>
                                  {transaction.category || "Uncategorized"}
                                </span>

                                <span aria-hidden="true">·</span>

                                <span>
                                  {formatTransactionDate(transaction.date)}
                                </span>

                                <span aria-hidden="true">·</span>

                                <span>
                                  {formatTransactionTime(transaction.date)}
                                </span>
                              </div>
                            </div>

                            <div className="flex shrink-0 items-center gap-2">
                              <p
                                className={`text-sm font-medium tabular-nums ${
                                  isIncome
                                    ? "text-primary"
                                    : "text-foreground"
                                }`}
                              >
                                {isIncome ? "+" : "−"}
                                {formatCurrency(
                                  Number(transaction.amount || 0),
                                  currency,
                                )}
                              </p>

                              <div className="hidden items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 sm:flex">
                                <button
                                  type="button"
                                  onClick={() => startEditing(transaction)}
                                  className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                                  aria-label={`Edit ${transaction.description}`}
                                  title="Edit"
                                >
                                  <Edit3 size={14} />
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    deleteTransaction(transaction.id)
                                  }
                                  className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                                  aria-label={`Delete ${transaction.description}`}
                                  title="Delete"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>

                              <div className="sm:hidden">
                                <button
                                  type="button"
                                  onClick={() => startEditing(transaction)}
                                  className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
                                  aria-label={`Edit ${transaction.description}`}
                                >
                                  <MoreHorizontal size={15} />
                                </button>
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
        </section>
      </div>
    </section>
  );
}

export default Transactions;