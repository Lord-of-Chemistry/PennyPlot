import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Search,
  ArrowUpDown,
  Pencil,
  Trash2,
  X,
  Check,
} from "lucide-react";

function Transactions() {
  const { transactions, setTransactions } = useOutletContext();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState(null);

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

  function formatCurrency(amount) {
    return `₦${amount.toLocaleString("en-NG")}`;
  }

  // FILTER + SEARCH + SORT
  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    // Search
    if (search.trim()) {
      const query = search.toLowerCase();

      result = result.filter(
        (transaction) =>
          transaction.description.toLowerCase().includes(query) ||
          transaction.category.toLowerCase().includes(query)
      );
    }

    // Type filter
    if (typeFilter !== "all") {
      result = result.filter(
        (transaction) => transaction.type === typeFilter
      );
    }

    // Category filter
    if (categoryFilter !== "all") {
      result = result.filter(
        (transaction) => transaction.category === categoryFilter
      );
    }

    // Sorting
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
      result.sort((a, b) =>
        a.description.localeCompare(b.description)
      );
    }

    if (sortBy === "z-a") {
      result.sort((a, b) =>
        b.description.localeCompare(a.description)
      );
    }

    return result;
  }, [
    transactions,
    search,
    typeFilter,
    categoryFilter,
    sortBy,
  ]);

  // DELETE
  function handleDelete(id) {
    setTransactions((prev) =>
      prev.filter((transaction) => transaction.id !== id)
    );
  }

  // START EDITING
  function handleEdit(transaction) {
    setEditingId(transaction.id);

    setEditData({
      description: transaction.description,
      amount: transaction.amount.toLocaleString("en-NG"),
      type: transaction.type,
      category: transaction.category,
      date: transaction.date,
    });
  }

  // CANCEL EDIT
  function handleCancelEdit() {
    setEditingId(null);
    setEditData(null);
  }

  // SAVE EDIT
  function handleSaveEdit(id) {
    if (!editData.description.trim()) return;

    const numericAmount = Number(
      editData.amount.replace(/,/g, "")
    );

    if (!numericAmount || numericAmount <= 0) return;

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
          : transaction
      )
    );

    setEditingId(null);
    setEditData(null);
  }

  function handleEditAmount(value) {
    const numbersOnly = value.replace(/\D/g, "");

    setEditData((prev) => ({
      ...prev,
      amount: numbersOnly
        ? Number(numbersOnly).toLocaleString("en-NG")
        : "",
    }));
  }

  return (
    <div className="min-h-screen bg-[#0f1714] text-white">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Transactions
        </h1>

        <p className="mt-1 text-sm text-gray-400">
          View and manage all your financial activity.
        </p>
      </div>

      {/* TOOLBAR */}
      <div className="rounded-2xl border border-white/10 bg-[#22332b]/50 p-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto_auto]">
          {/* SEARCH */}
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
            />

            <input
              type="text"
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-[#049552]"
            />
          </div>

          {/* TYPE */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-xl border border-white/10 bg-[#1b2922] px-4 py-3 text-sm text-white outline-none focus:border-[#049552]"
          >
            <option value="all">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expenses</option>
          </select>

          {/* CATEGORY */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-white/10 bg-[#1b2922] px-4 py-3 text-sm text-white outline-none focus:border-[#049552]"
          >
            <option value="all">All categories</option>

            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          {/* SORT */}
          <div className="relative">
            <ArrowUpDown
              size={16}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
            />

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-xl border border-white/10 bg-[#1b2922] py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-[#049552]"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="highest">Highest amount</option>
              <option value="lowest">Lowest amount</option>
              <option value="a-z">A → Z</option>
              <option value="z-a">Z → A</option>
            </select>
          </div>
        </div>
      </div>

      {/* COUNT */}
      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-gray-400">
          Showing{" "}
          <span className="font-medium text-white">
            {filteredTransactions.length}
          </span>{" "}
          {filteredTransactions.length === 1
            ? "transaction"
            : "transactions"}
        </p>

        {(search ||
          typeFilter !== "all" ||
          categoryFilter !== "all") && (
          <button
            onClick={() => {
              setSearch("");
              setTypeFilter("all");
              setCategoryFilter("all");
            }}
            className="flex items-center gap-1 text-xs text-gray-400 transition hover:text-white"
          >
            <X size={14} />
            Clear filters
          </button>
        )}
      </div>

      {/* TRANSACTIONS */}
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
                className="rounded-2xl border border-white/10 bg-[#22332b]/40 p-4 transition hover:border-white/15"
              >
                {isEditing ? (
                  /* EDIT FORM */
                  <div className="space-y-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      {/* DESCRIPTION */}
                      <input
                        type="text"
                        value={editData.description}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            description: e.target.value,
                          })
                        }
                        className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none focus:border-[#049552]"
                      />

                      {/* AMOUNT */}
                      <div className="flex overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] focus-within:border-[#049552]">
                        <span className="flex items-center border-r border-white/10 px-4 text-gray-400">
                          ₦
                        </span>

                        <input
                          type="text"
                          inputMode="numeric"
                          value={editData.amount}
                          onChange={(e) =>
                            handleEditAmount(e.target.value)
                          }
                          className="w-full bg-transparent px-4 py-3 text-sm text-white outline-none"
                        />
                      </div>

                      {/* TYPE */}
                      <select
                        value={editData.type}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            type: e.target.value,
                          })
                        }
                        className="rounded-xl border border-white/10 bg-[#1b2922] px-4 py-3 text-sm text-white outline-none focus:border-[#049552]"
                      >
                        <option value="expense">Expense</option>
                        <option value="income">Income</option>
                      </select>

                      {/* CATEGORY */}
                      <select
                        value={editData.category}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            category: e.target.value,
                          })
                        }
                        className="rounded-xl border border-white/10 bg-[#1b2922] px-4 py-3 text-sm text-white outline-none focus:border-[#049552]"
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

                      {/* DATE */}
                      <input
                        type="date"
                        value={editData.date}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            date: e.target.value,
                          })
                        }
                        className="rounded-xl border border-white/10 bg-[#1b2922] px-4 py-3 text-sm text-white outline-none focus:border-[#049552]"
                      />
                    </div>

                    {/* EDIT BUTTONS */}
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handleSaveEdit(transaction.id)
                        }
                        className="flex items-center gap-2 rounded-xl bg-[#049552] px-4 py-2 text-sm font-medium transition hover:bg-[#038448]"
                      >
                        <Check size={16} />
                        Save
                      </button>

                      <button
                        onClick={handleCancelEdit}
                        className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm text-gray-300 transition hover:bg-white/5"
                      >
                        <X size={16} />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* NORMAL TRANSACTION */
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
                          {transaction.type === "income"
                            ? "Income"
                            : "Expense"}
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
                        {transaction.type === "income"
                          ? "+"
                          : "-"}
                        {formatCurrency(transaction.amount)}
                      </span>

                      <div className="flex items-center gap-1">
                        {/* EDIT */}
                        <button
                          onClick={() => handleEdit(transaction)}
                          className="rounded-lg p-2 text-gray-500 transition hover:bg-white/5 hover:text-white"
                          title="Edit transaction"
                        >
                          <Pencil size={16} />
                        </button>

                        {/* DELETE */}
                        <button
                          onClick={() =>
                            handleDelete(transaction.id)
                          }
                          className="rounded-lg p-2 text-gray-500 transition hover:bg-red-500/10 hover:text-red-400"
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