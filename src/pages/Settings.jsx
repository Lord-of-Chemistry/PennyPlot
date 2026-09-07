import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Settings as SettingsIcon,
  Download,
  Trash2,
  Database,
  Wallet,
  CheckCircle2,
  AlertTriangle,
  Plus,
  X,
} from "lucide-react";
import {
  createBackup,
  downloadBackup,
  getLastBackupDate,
} from "../utils/backup";
import {
  getSavedTheme,
  getSavedAccent,
  applyTheme,
  applyAccent,
  THEMES,
  ACCENTS,
} from "../utils/theme";

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

function Settings() {
  const {
    transactions,
    setTransactions,
    currency,
    setCurrency,
    dateFormat,
    setDateFormat,
  } = useOutletContext();
  const [dialog, setDialog] = useState(null);
  const [pendingBackup, setPendingBackup] = useState(null);
  const [message, setMessage] = useState("");
  const [lastBackup, setLastBackup] = useState(getLastBackupDate());

  /*
    Custom categories
  */
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

  const [newCategory, setNewCategory] = useState("");
  const [categoryType, setCategoryType] = useState("expense");

  const [theme, setTheme] = useState(getSavedTheme());
  const [accent, setAccent] = useState(getSavedAccent());

  function updateTheme(value) {
    setTheme(value);
    applyTheme(value);

    const themeNames = {
      dark: "Dark mode",
      light: "Light mode",
      system: "System theme",
    };

    showMessage(`${themeNames[value]} enabled.`);
  }

  function updateAccent(value) {
    setAccent(value);
    applyAccent(value);

    showMessage(`${ACCENTS[value].name} accent applied.`);
  }

  function updateCurrency(value) {
    setCurrency(value);

    localStorage.setItem("pennyplot-currency", value);

    showMessage("Currency preference saved.");
  }

  function updateDateFormat(value) {
    setDateFormat(value);

    localStorage.setItem("pennyplot-date-format", value);

    showMessage("Date format preference saved.");
  }

  function showMessage(text) {
    setMessage(text);

    setTimeout(() => {
      setMessage("");
    }, 2500);
  }

  /*
    Category helpers
  */
  function getAllCategories(type) {
    if (type === "income") {
      return [...defaultIncomeCategories, ...customIncomeCategories];
    }

    return [...defaultExpenseCategories, ...customExpenseCategories];
  }

  function addCategory() {
    const cleanedCategory = newCategory.trim();

    if (!cleanedCategory) {
      showMessage("Please enter a category name.");
      return;
    }

    if (cleanedCategory.length > 30) {
      showMessage("Category names must be 30 characters or less.");
      return;
    }

    const allCategories = getAllCategories(categoryType);

    const alreadyExists = allCategories.some(
      (category) => category.toLowerCase() === cleanedCategory.toLowerCase(),
    );

    if (alreadyExists) {
      showMessage("That category already exists.");
      return;
    }

    if (categoryType === "income") {
      const updatedCategories = [...customIncomeCategories, cleanedCategory];

      setCustomIncomeCategories(updatedCategories);

      localStorage.setItem(
        "pennyplot-custom-income-categories",
        JSON.stringify(updatedCategories),
      );
    } else {
      const updatedCategories = [...customExpenseCategories, cleanedCategory];

      setCustomExpenseCategories(updatedCategories);

      localStorage.setItem(
        "pennyplot-custom-expense-categories",
        JSON.stringify(updatedCategories),
      );
    }

    setNewCategory("");

    showMessage(
      `${categoryType === "income" ? "Income" : "Expense"} category added.`,
    );
  }

  function deleteCustomCategory(type, category) {
    if (type === "income") {
      const updatedCategories = customIncomeCategories.filter(
        (item) => item !== category,
      );

      setCustomIncomeCategories(updatedCategories);

      localStorage.setItem(
        "pennyplot-custom-income-categories",
        JSON.stringify(updatedCategories),
      );
    } else {
      const updatedCategories = customExpenseCategories.filter(
        (item) => item !== category,
      );

      setCustomExpenseCategories(updatedCategories);

      localStorage.setItem(
        "pennyplot-custom-expense-categories",
        JSON.stringify(updatedCategories),
      );
    }

    showMessage(`"${category}" removed.`);
  }

  function downloadTransactions() {
    if (transactions.length === 0) {
      showMessage("There are no transactions to download.");
      return;
    }

    const headers = ["Description", "Type", "Amount", "Category", "Date"];

    const rows = transactions.map((transaction) => [
      transaction.description,
      transaction.type,
      transaction.amount,
      transaction.category,
      transaction.date,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = `pennyplot-transactions-${
      new Date().toISOString().split("T")[0]
    }.csv`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    showMessage("Transactions downloaded.");
  }

  function downloadBudgets() {
    const savedBudgets = localStorage.getItem("pennyplot-budgets");

    const budgets = savedBudgets ? JSON.parse(savedBudgets) : [];

    if (budgets.length === 0) {
      showMessage("There are no budgets to download.");
      return;
    }

    const headers = ["Category", "Period", "Budget Amount"];

    const rows = budgets.map((budget) => [
      budget.category,
      budget.period,
      budget.amount,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = `pennyplot-budgets-${
      new Date().toISOString().split("T")[0]
    }.csv`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    showMessage("Budgets downloaded.");
  }

  function handleDownloadBackup() {
    downloadBackup();

    setLastBackup(getLastBackupDate());

    showMessage("Backup downloaded successfully.");
  }

  function handleCreateBackup() {
    createBackup();

    setLastBackup(getLastBackupDate());

    showMessage("PennyPlot backup created.");
  }

  function handleRestoreBackup(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = (loadEvent) => {
      try {
        const backup = JSON.parse(loadEvent.target.result);

        if (backup?.app !== "PennyPlot" || !backup?.data) {
          showMessage("Invalid PennyPlot backup file.");
          return;
        }

        setPendingBackup(backup);
        setDialog("restore");
      } catch (error) {
        console.error("Failed to restore backup:", error);
        showMessage("Could not read this backup file.");
      }
    };

    reader.readAsText(file);

    event.target.value = "";
  }

  function restoreBackup() {
    if (!pendingBackup) return;

    const restoredTransactions = pendingBackup.data.transactions || [];
    const budgets = pendingBackup.data.budgets || [];
    const settings = pendingBackup.data.settings || {};

    const restoredCustomIncomeCategories =
      pendingBackup.data.customCategories?.income || [];

    const restoredCustomExpenseCategories =
      pendingBackup.data.customCategories?.expense || [];

    localStorage.setItem(
      "pennyplot-transactions",
      JSON.stringify(restoredTransactions),
    );

    localStorage.setItem("pennyplot-budgets", JSON.stringify(budgets));

    if (settings.currency) {
      localStorage.setItem("pennyplot-currency", settings.currency);
    }

    if (settings.dateFormat) {
      localStorage.setItem("pennyplot-date-format", settings.dateFormat);
    }

    if (settings.theme) {
      localStorage.setItem("pennyplot-theme", settings.theme);
    }

    if (settings.accent) {
      localStorage.setItem("pennyplot-accent", settings.accent);
    }

    localStorage.setItem(
      "pennyplot-custom-income-categories",
      JSON.stringify(restoredCustomIncomeCategories),
    );

    localStorage.setItem(
      "pennyplot-custom-expense-categories",
      JSON.stringify(restoredCustomExpenseCategories),
    );

    setTransactions(restoredTransactions);

    setDialog(null);
    setPendingBackup(null);

    showMessage("Backup restored successfully.");

    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }

  function clearTransactions() {
    setTransactions([]);

    localStorage.removeItem("pennyplot-transactions");

    setDialog(null);

    showMessage("All transactions have been deleted.");
  }

  function clearBudgets() {
    localStorage.removeItem("pennyplot-budgets");

    setDialog(null);

    showMessage("All budgets have been deleted.");

    window.location.reload();
  }

  function clearEverything() {
    localStorage.removeItem("pennyplot-transactions");
    localStorage.removeItem("pennyplot-budgets");
    localStorage.removeItem("pennyplot-currency");
    localStorage.removeItem("pennyplot-date-format");
    localStorage.removeItem("pennyplot-custom-income-categories");
    localStorage.removeItem("pennyplot-custom-expense-categories");
    localStorage.removeItem("pennyplot-theme");
    localStorage.removeItem("pennyplot-accent");

    setTransactions([]);

    setDialog(null);

    showMessage("All PennyPlot data has been cleared.");

    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <SettingsIcon size={21} />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Manage your PennyPlot preferences and data.
            </p>
          </div>
        </div>
      </div>

      {/* Saved Message */}
      {message && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary">
          <CheckCircle2 size={17} />
          {message}
        </div>
      )}

      <div className="space-y-6">
        {/* Appearance */}
        <Card className="border-border bg-card/70">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">
              🌙 Appearance
            </CardTitle>

            <p className="text-sm text-muted-foreground">
              Customize how PennyPlot looks on your device.
            </p>
          </CardHeader>

          <CardContent className="space-y-7">
            {/* Theme */}
            <div>
              <div className="mb-3">
                <p className="text-sm font-medium text-foreground">Theme</p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Choose how PennyPlot should appear.
                </p>
              </div>

              <div className="grid gap-2 sm:grid-cols-3">
                {[
                  {
                    value: THEMES.DARK,
                    label: "Dark mode",
                    icon: "🌙",
                  },
                  {
                    value: THEMES.LIGHT,
                    label: "Light mode",
                    icon: "☀️",
                  },
                  {
                    value: THEMES.SYSTEM,
                    label: "System theme",
                    icon: "🖥️",
                  },
                ].map((option) => {
                  const selected = theme === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => updateTheme(option.value)}
                      className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all ${
                        selected
                          ? "border-primary/50 bg-primary/10 text-foreground ring-1 ring-primary/20"
                          : "border-border bg-background/40 text-secondary-foreground hover:bg-accent hover:text-foreground"
                      }`}
                    >
                      <span className="text-lg">{option.icon}</span>

                      <span className="text-sm font-medium">
                        {option.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Accent Color */}
            <div>
              <div className="mb-3">
                <p className="text-sm font-medium text-foreground">
                  Accent color
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Choose the color used for highlights and interactive elements.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {Object.entries(ACCENTS).map(([key, option]) => {
                  const selected = accent === key;

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => updateAccent(key)}
                      title={option.name}
                      aria-label={`Use ${option.name} accent`}
                      className={`group flex items-center gap-2 rounded-xl border px-3 py-2 transition-all ${
                        selected
                          ? "border-primary/50 bg-primary/10 ring-1 ring-primary/20"
                          : "border-border bg-background/40 hover:bg-accent"
                      }`}
                    >
                      <span
                        className="h-5 w-5 rounded-full border border-white/10 shadow-sm"
                        style={{
                          backgroundColor: option.value,
                        }}
                      />

                      <span
                        className={`text-xs font-medium ${
                          selected
                            ? "text-foreground"
                            : "text-muted-foreground group-hover:text-foreground"
                        }`}
                      >
                        {option.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Persistence */}
            <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2
                  size={18}
                  className="mt-0.5 shrink-0 text-primary"
                />

                <div>
                  <p className="text-sm font-medium text-foreground">
                    Preferences are saved automatically
                  </p>

                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Your theme and accent color will be remembered when you
                    return to PennyPlot.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card className="border-border bg-card/70">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">
              Preferences
            </CardTitle>

            <p className="text-sm text-muted-foreground">
              Customize how PennyPlot displays your information.
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Currency */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Currency</p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Choose the currency used throughout PennyPlot.
                </p>
              </div>

              <select
                value={currency}
                onChange={(e) => updateCurrency(e.target.value)}
                className="rounded-xl border border-border bg-background/60 px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              >
                <option value="NGN">₦ Nigerian Naira</option>
                <option value="USD">$ US Dollar</option>
                <option value="GBP">£ British Pound</option>
                <option value="EUR">€ Euro</option>
              </select>
            </div>

            {/* Date Format */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Date Format
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Choose how dates should be displayed.
                </p>
              </div>

              <select
                value={dateFormat}
                onChange={(e) => updateDateFormat(e.target.value)}
                className="rounded-xl border border-border bg-background/60 px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <Card className="border-border bg-card/70">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">
              Categories
            </CardTitle>

            <p className="text-sm text-muted-foreground">
              Customize the categories available when recording transactions.
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Add Category */}
            <div className="rounded-2xl border border-border bg-background/40 p-4">
              <div className="mb-4">
                <p className="text-sm font-medium text-foreground">
                  Add custom category
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Custom categories can be removed later.
                </p>
              </div>

              <div className="flex flex-col gap-3 md:flex-row">
                <select
                  value={categoryType}
                  onChange={(e) => setCategoryType(e.target.value)}
                  className="rounded-xl border border-border bg-background/60 px-4 py-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 md:w-40"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>

                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCategory();
                    }
                  }}
                  maxLength={30}
                  placeholder={
                    categoryType === "expense"
                      ? "e.g. Gaming"
                      : "e.g. Side Hustle"
                  }
                  className="min-w-0 flex-1 rounded-xl border border-border bg-background/60 px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/10"
                />

                <button
                  type="button"
                  onClick={addCategory}
                  className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                >
                  <Plus size={17} />
                  Add Category
                </button>
              </div>
            </div>

            {/* Expense Categories */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Expense Categories
                  </h3>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Built-in categories cannot be deleted.
                  </p>
                </div>

                <span className="text-xs text-muted-foreground">
                  {defaultExpenseCategories.length +
                    customExpenseCategories.length}{" "}
                  total
                </span>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {defaultExpenseCategories.map((category) => (
                  <div
                    key={category}
                    className="flex items-center justify-between rounded-xl border border-border/60 bg-background/50 px-3 py-2.5"
                  >
                    <span className="text-sm text-secondary-foreground">
                      {category}
                    </span>

                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Built-in
                    </span>
                  </div>
                ))}

                {customExpenseCategories.map((category) => (
                  <div
                    key={category}
                    className="flex items-center justify-between rounded-xl border border-primary/10 bg-primary/5 px-3 py-2.5"
                  >
                    <span className="min-w-0 truncate text-sm text-foreground">
                      {category}
                    </span>

                    <button
                      type="button"
                      onClick={() => deleteCustomCategory("expense", category)}
                      className="ml-2 shrink-0 rounded-lg p-1 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                      aria-label={`Delete ${category}`}
                    >
                      <X size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Income Categories */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Income Categories
                  </h3>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Built-in categories cannot be deleted.
                  </p>
                </div>

                <span className="text-xs text-muted-foreground">
                  {defaultIncomeCategories.length +
                    customIncomeCategories.length}{" "}
                  total
                </span>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {defaultIncomeCategories.map((category) => (
                  <div
                    key={category}
                    className="flex items-center justify-between rounded-xl border border-border/60 bg-background/50 px-3 py-2.5"
                  >
                    <span className="text-sm text-secondary-foreground">
                      {category}
                    </span>

                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Built-in
                    </span>
                  </div>
                ))}

                {customIncomeCategories.map((category) => (
                  <div
                    key={category}
                    className="flex items-center justify-between rounded-xl border border-primary/10 bg-primary/5 px-3 py-2.5"
                  >
                    <span className="min-w-0 truncate text-sm text-foreground">
                      {category}
                    </span>

                    <button
                      type="button"
                      onClick={() => deleteCustomCategory("income", category)}
                      className="ml-2 shrink-0 rounded-lg p-1 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                      aria-label={`Delete ${category}`}
                    >
                      <X size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="border-border bg-card/70">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">
              Data Management
            </CardTitle>

            <p className="text-sm text-muted-foreground">
              Export or manage the information stored in PennyPlot.
            </p>
          </CardHeader>

          <CardContent className="space-y-3">
            {/* Transactions */}
            <div className="flex flex-col gap-4 rounded-2xl border border-border bg-background/40 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <Database size={19} className="mt-0.5 text-primary" />

                <div>
                  <p className="text-sm font-medium text-foreground">
                    Transactions
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {transactions.length} transaction
                    {transactions.length === 1 ? "" : "s"} stored.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={downloadTransactions}
                className="flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm text-secondary-foreground transition hover:bg-accent hover:text-foreground"
              >
                <Download size={16} />
                Download
              </button>
            </div>

            {/* Budgets */}
            <div className="flex flex-col gap-4 rounded-2xl border border-border bg-background/40 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <Wallet size={19} className="mt-0.5 text-primary" />

                <div>
                  <p className="text-sm font-medium text-foreground">Budgets</p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Export your saved budget data.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={downloadBudgets}
                className="flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm text-secondary-foreground transition hover:bg-accent hover:text-foreground"
              >
                <Download size={16} />
                Download
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Backup & Restore */}
        <Card className="border-border bg-card/70">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">
              Backup & Restore
            </CardTitle>

            <p className="text-sm text-muted-foreground">
              Keep a portable copy of your PennyPlot data.
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Backup Status */}
            <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Database size={19} />
                </div>

                <div>
                  <p className="text-sm font-medium text-foreground">
                    Backup status
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {lastBackup
                      ? `Last backup: ${new Date(lastBackup).toLocaleString()}`
                      : "No backup has been created yet."}
                  </p>
                </div>
              </div>
            </div>

            {/* Create Backup */}
            <div className="flex flex-col gap-4 rounded-2xl border border-border bg-background/40 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Back Up Now
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Save your current PennyPlot data locally.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCreateBackup}
                className="flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm text-secondary-foreground transition hover:bg-accent hover:text-foreground"
              >
                <Database size={16} />
                Back Up Now
              </button>
            </div>

            {/* Download Backup */}
            <div className="flex flex-col gap-4 rounded-2xl border border-border bg-background/40 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Download backup
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Download a complete copy of your PennyPlot data.
                </p>
              </div>

              <button
                type="button"
                onClick={handleDownloadBackup}
                className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
              >
                <Download size={16} />
                Download Backup
              </button>
            </div>

            {/* Restore Backup */}
            <div className="flex flex-col gap-4 rounded-2xl border border-border bg-background/40 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Restore backup
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Restore your data from a PennyPlot backup file.
                </p>
              </div>

              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm text-secondary-foreground transition hover:bg-accent hover:text-foreground">
                <Download size={16} className="rotate-180" />
                Restore Backup
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleRestoreBackup}
                  className="hidden"
                />
              </label>
            </div>

            <p className="text-xs leading-5 text-muted-foreground/70">
              Backup files contain your transactions, budgets, categories,
              currency, date-format, theme, and accent-color preferences. Keep
              downloaded backups somewhere safe.
            </p>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/15 bg-destructive/[0.02]">
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertTriangle size={20} className="text-destructive" />

              <div>
                <CardTitle className="text-lg text-foreground">
                  Danger Zone
                </CardTitle>

                <p className="mt-1 text-sm text-muted-foreground">
                  These actions permanently delete your data.
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            <button
              type="button"
              onClick={() => setDialog("transactions")}
              className="flex w-full items-center justify-between rounded-xl border border-destructive/10 bg-destructive/5 px-4 py-3 text-sm text-destructive transition hover:bg-destructive/10"
            >
              <span>Delete all transactions</span>
              <Trash2 size={17} />
            </button>

            <button
              type="button"
              onClick={() => setDialog("budgets")}
              className="flex w-full items-center justify-between rounded-xl border border-destructive/10 bg-destructive/5 px-4 py-3 text-sm text-destructive transition hover:bg-destructive/10"
            >
              <span>Delete all budgets</span>
              <Trash2 size={17} />
            </button>

            <button
              type="button"
              onClick={() => setDialog("everything")}
              className="flex w-full items-center justify-between rounded-xl bg-destructive px-4 py-3 text-sm font-semibold text-white transition hover:bg-destructive/90"
            >
              <span>Delete all PennyPlot data</span>
              <Trash2 size={17} />
            </button>
          </CardContent>
        </Card>

        {/* About */}
        <Card className="border-border bg-card/70">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">PennyPlot</p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Personal finance dashboard
                </p>
              </div>

              <span className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground">
                v1.0.0
              </span>
            </div>

            <div className="mt-5 border-t border-border pt-4">
              <p className="text-xs leading-5 text-muted-foreground/70">
                Your current data is stored locally on this device. Cloud
                synchronization will be added soon.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <Dialog
        open={dialog !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDialog(null);
          }
        }}
      >
        <DialogContent className="border-border bg-popover text-popover-foreground sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {dialog === "transactions" && "Delete all transactions?"}

              {dialog === "budgets" && "Delete all budgets?"}

              {dialog === "everything" && "Delete all PennyPlot data?"}

              {dialog === "restore" && "Restore this backup?"}
            </DialogTitle>

            <DialogDescription className="text-muted-foreground">
              {dialog === "transactions" &&
                "This will permanently delete all your saved transactions. This action cannot be undone."}

              {dialog === "budgets" &&
                "This will permanently delete all your saved budgets. This action cannot be undone."}

              {dialog === "everything" &&
                "This will permanently delete your transactions, budgets, custom categories, currency settings, and date preferences. This action cannot be undone."}

              {dialog === "restore" &&
                "Restoring this backup will replace your current PennyPlot data. Your existing data will be overwritten."}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-2">
            <button
              type="button"
              onClick={() => setDialog(null)}
              className="rounded-xl border border-border px-4 py-2.5 text-sm text-secondary-foreground transition hover:bg-accent hover:text-foreground"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => {
                if (dialog === "transactions") {
                  clearTransactions();
                }

                if (dialog === "budgets") {
                  clearBudgets();
                }

                if (dialog === "everything") {
                  clearEverything();
                }

                if (dialog === "restore") {
                  restoreBackup();
                }
              }}
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition ${
                dialog === "restore"
                  ? "bg-primary hover:bg-primary/90"
                  : "bg-destructive hover:bg-destructive/90"
              }`}
            >
              {dialog === "restore" ? "Restore" : "Delete"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Settings;
