import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  Pause,
  Pencil,
  Play,
  Plus,
  Repeat2,
  Trash2,
  X,
} from "lucide-react";
import {
  createRecurringTransaction,
  deleteRecurringTransaction,
  getRecurringTransactions,
  toggleRecurringTransaction,
  updateRecurringTransaction,
} from "../utils/recurringTransactions";
import { formatCurrency } from "../utils/currency";
import { formatDate } from "../utils/date";
import { Calendar } from "../components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";

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
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

function getLocalDateString() {
  const date = new Date();

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function dateStringToDate(value) {
  if (!value) return undefined;

  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) return undefined;

  return new Date(year, month - 1, day);
}

function dateToString(date) {
  if (!date) return "";

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function createEmptyForm() {
  return {
    description: "",
    amount: "",
    type: "expense",
    category: expenseCategories[0],
    frequency: "monthly",
    startDate: getLocalDateString(),
  };
}

function formatFrequency(frequency) {
  return (
    frequencyOptions.find((option) => option.value === frequency)?.label ??
    frequency
  );
}

function RecurringTransactions() {
  const { currency, dateFormat } = useOutletContext();

  const [recurringTransactions, setRecurringTransactions] = useState(() =>
    getRecurringTransactions(),
  );

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(createEmptyForm);

  const categories = useMemo(
    () => (form.type === "income" ? incomeCategories : expenseCategories),
    [form.type],
  );

  const activeTransactions = useMemo(
    () =>
      recurringTransactions
        .filter((transaction) => transaction.active)
        .sort(
          (a, b) =>
            new Date(`${a.nextOccurrence}T00:00:00`) -
            new Date(`${b.nextOccurrence}T00:00:00`),
        ),
    [recurringTransactions],
  );

  const pausedTransactions = useMemo(
    () => recurringTransactions.filter((transaction) => !transaction.active),
    [recurringTransactions],
  );

  const nextTransaction = activeTransactions[0];

  const activeIncomeCount = activeTransactions.filter(
    (transaction) => transaction.type === "income",
  ).length;

  const activeExpenseCount = activeTransactions.filter(
    (transaction) => transaction.type === "expense",
  ).length;

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

  useEffect(() => {
    if (!showForm) return;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        closeForm();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showForm]);

  function openCreateForm() {
    setEditingId(null);
    setForm(createEmptyForm());
    setShowForm(true);
  }

  function openEditForm(recurring) {
    setEditingId(recurring.id);

    setForm({
      description: recurring.description,
      amount: Number(recurring.amount).toLocaleString("en-NG"),
      type: recurring.type,
      category: recurring.category,
      frequency: recurring.frequency,
      startDate: recurring.startDate,
    });

    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(createEmptyForm());
  }

  function handleSave() {
    const description = form.description.trim();
    const numericAmount = Number(form.amount.replace(/,/g, ""));

    if (!description) {
      toast.error("Please enter a description.");
      return;
    }

    if (!numericAmount || numericAmount <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }

    if (!form.startDate) {
      toast.error("Please select a start date.");
      return;
    }

    if (editingId) {
      const existing = recurringTransactions.find(
        (transaction) => transaction.id === editingId,
      );

      if (!existing) {
        toast.error("Recurring transaction not found.");
        return;
      }

      const updates = {
        ...form,
        description,
        amount: numericAmount,
      };

      if (form.startDate !== existing.startDate) {
        updates.nextOccurrence = form.startDate;
      }

      const updated = updateRecurringTransaction(editingId, updates);

      setRecurringTransactions(updated);
      closeForm();
      toast.success("Recurring transaction updated.");
      return;
    }

    const recurring = createRecurringTransaction({
      ...form,
      description,
      amount: numericAmount,
    });

    setRecurringTransactions((previous) => [recurring, ...previous]);

    closeForm();
    toast.success("Recurring transaction created.");
  }

  function handleDelete(id) {
    const recurring = recurringTransactions.find(
      (transaction) => transaction.id === id,
    );

    if (!recurring) return;

    const confirmed = window.confirm(
      `Delete "${recurring.description}"? Future automatic entries will stop.`,
    );

    if (!confirmed) return;

    const updated = deleteRecurringTransaction(id);

    setRecurringTransactions(updated);
    toast.success("Recurring transaction deleted.");
  }

  function handleToggle(id) {
    const updated = toggleRecurringTransaction(id);

    setRecurringTransactions(updated);

    const item = updated.find((transaction) => transaction.id === id);

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
      amount: numbersOnly ? Number(numbersOnly).toLocaleString("en-NG") : "",
    }));
  }

  return (
    <div className="pennyplot-page-in min-h-screen bg-background pb-24 text-foreground pb-5">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
              Recurring
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Money that repeats.
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
              Set regular income and expenses once. PennyPlot keeps them on
              schedule for you.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateForm}
            className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-primary/90 active:translate-y-0"
          >
            <Plus size={17} />
            Add recurring
          </button>
        </header>

        <section className="mt-8 grid gap-3 sm:grid-cols-3">
          <SummaryCard
            label="Active schedules"
            value={activeTransactions.length}
            detail={`${activeIncomeCount} income · ${activeExpenseCount} expenses`}
          />

          <SummaryCard
            label="Next up"
            value={nextTransaction?.description ?? "Nothing scheduled"}
            detail={
              nextTransaction
                ? formatDate(nextTransaction.nextOccurrence, dateFormat)
                : "Your schedule is clear"
            }
          />

          <SummaryCard
            label="Paused"
            value={pausedTransactions.length}
            detail="Not generating transactions"
          />
        </section>

        {recurringTransactions.length === 0 ? (
          <section className="mt-12 flex flex-col items-center px-6 py-20 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground transition-transform duration-300 hover:scale-105">
              <Repeat2 size={24} />
            </div>

            <h2 className="mt-5 text-lg font-semibold">Nothing repeats yet</h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              Add something regular like rent, a subscription, allowance, or
              salary and PennyPlot will handle the schedule.
            </p>

            <button
              type="button"
              onClick={openCreateForm}
              className="mt-5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90"
            >
              Add your first schedule
            </button>
          </section>
        ) : (
          <div className="mt-10">
            {activeTransactions.length > 0 && (
              <ScheduleSection
                title="Upcoming"
                description="Your next automatic money movements."
              >
                {activeTransactions.map((recurring) => (
                  <RecurringRow
                    key={recurring.id}
                    recurring={recurring}
                    currency={currency}
                    dateFormat={dateFormat}
                    onEdit={openEditForm}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                  />
                ))}
              </ScheduleSection>
            )}

            {pausedTransactions.length > 0 && (
              <section className="mt-12">
                <ScheduleSection
                  title="Paused"
                  description="These schedules are currently inactive."
                >
                  {pausedTransactions.map((recurring) => (
                    <RecurringRow
                      key={recurring.id}
                      recurring={recurring}
                      currency={currency}
                      dateFormat={dateFormat}
                      onEdit={openEditForm}
                      onToggle={handleToggle}
                      onDelete={handleDelete}
                    />
                  ))}
                </ScheduleSection>
              </section>
            )}
          </div>
        )}
      </div>

      {showForm && (
        <div
          className="fixed inset-0 z-[200] flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm animate-in fade-in duration-200 sm:items-center sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeForm();
            }
          }}
        >
          <div className="pennyplot-scrollbar max-h-[90vh] mt-4 pt-2 w-full overflow-y-auto rounded-t-3xl border border-border bg-card shadow-2xl animate-in slide-in-from-bottom-4 duration-300 sm:max-w-xl sm:rounded-2xl sm:zoom-in-95">
            <div className="flex items-start justify-between border-b border-border/60 px-5 py-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-primary">
                  {editingId ? "Edit schedule" : "New schedule"}
                </p>

                <h2 className="mt-1 text-lg font-semibold">
                  {editingId
                    ? "Update recurring transaction"
                    : "Add recurring transaction"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeForm}
                aria-label="Close"
                className="rounded-lg p-2 text-muted-foreground transition-all duration-200 hover:rotate-90 hover:bg-accent hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div>
                <label
                  htmlFor="recurring-description"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Description
                </label>

                <input
                  id="recurring-description"
                  type="text"
                  value={form.description}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      description: event.target.value,
                    }))
                  }
                  placeholder="e.g. Netflix subscription"
                  className="mt-2 w-full rounded-xl border border-border bg-background px-3.5 py-3 text-sm outline-none transition-all duration-200 placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>

              <div>
                <label
                  htmlFor="recurring-amount"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Amount
                </label>

                <div className="mt-2 flex items-center rounded-xl border border-border bg-background px-3.5 transition-all duration-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">
                  <span className="mr-2 text-sm text-muted-foreground">
                    {currency}
                  </span>

                  <input
                    id="recurring-amount"
                    type="text"
                    inputMode="numeric"
                    value={form.amount}
                    onChange={(event) => handleAmountChange(event.target.value)}
                    placeholder="0"
                    className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground/60"
                  />
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Type
                </p>

                <div className="mt-2 grid grid-cols-2 gap-2">
                  {[
                    {
                      value: "expense",
                      label: "Expense",
                      icon: ArrowDownRight,
                    },
                    {
                      value: "income",
                      label: "Income",
                      icon: ArrowUpRight,
                    },
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        setForm((previous) => ({
                          ...previous,
                          type: value,
                        }))
                      }
                      className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                        form.type === value
                          ? "border-primary/40 bg-primary/10 text-primary shadow-sm"
                          : "border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground"
                      }`}
                    >
                      <Icon size={15} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="recurring-category"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Category
                  </label>

                  <select
                    id="recurring-category"
                    value={form.category}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        category: event.target.value,
                      }))
                    }
                    className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-3 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/10"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Start date
                  </p>

                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="mt-2 flex w-full items-center gap-2 rounded-xl border border-border bg-background px-3 py-3 text-left text-sm transition-all duration-200 hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/10"
                      >
                        <CalendarDays
                          size={16}
                          className="text-muted-foreground"
                        />

                        <span
                          className={
                            form.startDate
                              ? "text-foreground"
                              : "text-muted-foreground"
                          }
                        >
                          {form.startDate
                            ? formatDate(form.startDate, dateFormat)
                            : "Choose a date"}
                        </span>
                      </button>
                    </PopoverTrigger>

                    <PopoverContent
                      align="end"
                      className="w-auto border-border bg-card p-0 shadow-2xl"
                    >
                      <Calendar
                        mode="single"
                        selected={dateStringToDate(form.startDate)}
                        onSelect={(date) =>
                          setForm((previous) => ({
                            ...previous,
                            startDate: dateToString(date),
                          }))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Frequency
                </p>

                <div className="mt-2 grid grid-cols-4 gap-1.5">
                  {frequencyOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setForm((previous) => ({
                          ...previous,
                          frequency: option.value,
                        }))
                      }
                      className={`rounded-xl px-2 py-2.5 text-xs font-medium transition-all duration-200 ${
                        form.frequency === option.value
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-background text-muted-foreground hover:bg-accent hover:text-foreground"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleSave}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90 active:translate-y-0"
              >
                <Check size={17} />
                {editingId ? "Save changes" : "Create schedule"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, detail }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/50 p-4 transition-all duration-200 hover:border-border hover:bg-card/70">
      <p className="text-xs text-muted-foreground">{label}</p>

      <p className="mt-2 truncate text-2xl font-semibold tracking-tight">
        {value}
      </p>

      <p className="mt-1 truncate text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}

function ScheduleSection({ title, description, children }) {
  return (
    <section>
      <div className="mb-3">
        <h2 className="text-sm font-semibold">{title}</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>

      <div className="divide-y divide-border/60 border-y border-border/60">
        {children}
      </div>
    </section>
  );
}

function RecurringRow({
  recurring,
  currency,
  dateFormat,
  onEdit,
  onToggle,
  onDelete,
}) {
  const isIncome = recurring.type === "income";

  return (
    <div
      className={`group flex items-center gap-3 py-4 transition-all duration-200 ease-out hover:px-1 ${
        recurring.active ? "" : "opacity-55"
      }`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105 ${
          isIncome
            ? "bg-primary/10 text-primary"
            : "bg-destructive/10 text-destructive"
        }`}
      >
        {isIncome ? <ArrowUpRight size={17} /> : <ArrowDownRight size={17} />}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium">
            {recurring.description}
          </p>

          {!recurring.active && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              Paused
            </span>
          )}
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <span>{recurring.category}</span>
          <span>·</span>
          <span>{formatFrequency(recurring.frequency)}</span>
          <span>·</span>

          <span className="flex items-center gap-1">
            <CalendarDays size={12} />
            {formatDate(recurring.nextOccurrence, dateFormat)}
          </span>
        </div>

        <p
          className={`mt-1 text-xs font-semibold sm:hidden ${
            isIncome ? "text-primary" : "text-destructive"
          }`}
        >
          {isIncome ? "+" : "-"}
          {formatCurrency(recurring.amount, currency)}
        </p>
      </div>

      <div className="hidden text-right sm:block">
        <p
          className={`text-sm font-semibold ${
            isIncome ? "text-primary" : "text-destructive"
          }`}
        >
          {isIncome ? "+" : "-"}
          {formatCurrency(recurring.amount, currency)}
        </p>

        <p className="mt-1 text-[10px] text-muted-foreground">
          per {recurring.frequency}
        </p>
      </div>

      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={() => onEdit(recurring)}
          title="Edit"
          aria-label={`Edit ${recurring.description}`}
          className="rounded-lg p-2 text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-foreground"
        >
          <Pencil size={15} />
        </button>

        <button
          type="button"
          onClick={() => onToggle(recurring.id)}
          title={recurring.active ? "Pause" : "Resume"}
          aria-label={recurring.active ? "Pause" : "Resume"}
          className="rounded-lg p-2 text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-foreground"
        >
          {recurring.active ? <Pause size={16} /> : <Play size={16} />}
        </button>

        <button
          type="button"
          onClick={() => onDelete(recurring.id)}
          title="Delete"
          aria-label={`Delete ${recurring.description}`}
          className="rounded-lg p-2 text-muted-foreground transition-all duration-200 hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

export default RecurringTransactions;
