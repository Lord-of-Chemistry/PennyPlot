import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Plus, X, Wallet, ChevronDown } from "lucide-react";

function AddTransaction() {
  console.log("NEW ADD TRANSACTION COMPONENT");
  console.log("🔥 ADD TRANSACTION IS RUNNING 🔥");

  const { setTransactions } = useOutletContext();

  const [type, setType] = useState("expense");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [error, setError] = useState("");

  const [typeOpen, setTypeOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);

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
      return;
    }

    const numericAmount = Number(amount);

    if (!numericAmount || numericAmount <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    if (!date) {
      setError("Please select a date.");
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

    setDescription("");
    setAmount("");
    setType("expense");
    setCategory("Food");
    setDate(new Date().toISOString().split("T")[0]);
    setError("");
  }

  function selectType(value) {
    setType(value);
    setTypeOpen(false);
  }

  function selectCategory(value) {
    setCategory(value);
    setCategoryOpen(false);
  }

  return (
    <section className="mt-10 pt-2">
      <div className="mt-10 pt-2 relative z-10 overflow-visible rounded-3xl border-2 border-[#049552]/30 bg-[#1b2922] shadow-2xl shadow-black/30">
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
                className="w-full rounded-xl border border-white/15 bg-[#0f1714] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 hover:border-white/25 focus:border-[#049552] focus:ring-2 focus:ring-[#049552]/15"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Amount
              </label>

              <div className="flex overflow-hidden rounded-xl border border-white/15 bg-[#0f1714] transition hover:border-white/25 focus-within:border-[#049552] focus-within:ring-2 focus-within:ring-[#049552]/15">
                <div className="flex items-center border-r border-white/15 bg-white/[0.02] px-4 text-base font-bold text-[#049552]">
                  ₦
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

              <p className="mt-2 text-xs text-gray-600">
                {amount
                  ? `₦${formatAmount(amount)}`
                  : "Enter amount in Nigerian naira"}
              </p>
            </div>

            {/* Type / Category / Date */}
            <div className="grid gap-5 md:grid-cols-3">
              {/* Type */}
              <div className="relative z-30">
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Type
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setTypeOpen((prev) => !prev);
                    setCategoryOpen(false);
                  }}
                  className="flex w-full items-center justify-between rounded-xl border border-white/15 bg-[#0f1714] px-4 py-3 text-sm text-white outline-none transition hover:border-white/25 focus:border-[#049552]"
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
                    className={`text-gray-500 transition-transform ${
                      typeOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {typeOpen && (
                  <div className="absolute left-0 right-0 top-full mt-2 rounded-xl border border-white/15 bg-[#17221d] p-1.5 shadow-2xl shadow-black/50 ring-1 ring-black/20">
                    <button
                      type="button"
                      onClick={() => selectType("expense")}
                      className={`flex w-full rounded-lg px-3 py-2.5 text-left text-sm transition ${
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
                      className={`mt-1 flex w-full rounded-lg px-3 py-2.5 text-left text-sm transition ${
                        type === "income"
                          ? "bg-[#049552]/10 text-[#049552]"
                          : "text-gray-300 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      Income
                    </button>
                  </div>
                )}
              </div>

              {/* Category */}
              <div className="relative z-20">
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Category
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setCategoryOpen((prev) => !prev);
                    setTypeOpen(false);
                  }}
                  className="flex w-full items-center justify-between rounded-xl border border-white/15 bg-[#0f1714] px-4 py-3 text-sm text-white outline-none transition hover:border-white/25 focus:border-[#049552]"
                >
                  <span>{category}</span>

                  <ChevronDown
                    size={17}
                    className={`text-gray-500 transition-transform ${
                      categoryOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {categoryOpen && (
                  <div className="absolute left-0 right-0 top-full mt-2 max-h-60 overflow-y-auto rounded-xl border border-white/15 bg-[#17221d] p-1.5 shadow-2xl shadow-black/50 ring-1 ring-black/20">
                    {categories.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => selectCategory(item)}
                        className={`flex w-full rounded-lg px-3 py-2.5 text-left text-sm transition ${
                          category === item
                            ? "bg-[#049552]/10 text-[#049552]"
                            : "text-gray-300 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Date */}
              <div className="relative z-10">
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Date
                </label>

                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-[#0f1714] px-4 py-3 text-sm text-white outline-none transition hover:border-white/25 focus:border-[#049552] focus:ring-2 focus:ring-[#049552]/15"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center justify-between rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                <span>{error}</span>

                <button
                  type="button"
                  onClick={() => setError("")}
                  className="transition hover:text-red-300"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#049552] px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#049552]/20 transition hover:bg-[#038448] hover:shadow-[#049552]/30 active:scale-[0.99]"
            >
              <Plus size={18} />
              Add Transaction
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default AddTransaction;
