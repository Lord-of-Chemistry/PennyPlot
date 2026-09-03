import { useRef, useState } from "react";
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
} from "lucide-react";
import {
  createBackup,
  downloadBackup,
  getLastBackupDate,
} from "../utils/backup";

function Settings() {
  const { transactions, setTransactions, currency, setCurrency } =
    useOutletContext();

  const [dateFormat, setDateFormat] = useState(() => {
    return localStorage.getItem("pennyplot-date-format") || "DD/MM/YYYY";
  });

  const [dialog, setDialog] = useState(null);
  const [pendingBackup, setPendingBackup] = useState(null);
  const [message, setMessage] = useState("");

  const [lastBackup, setLastBackup] = useState(getLastBackupDate());

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

    const transactions = pendingBackup.data.transactions || [];
    const budgets = pendingBackup.data.budgets || [];
    const settings = pendingBackup.data.settings || {};

    localStorage.setItem(
      "pennyplot-transactions",
      JSON.stringify(transactions),
    );

    localStorage.setItem("pennyplot-budgets", JSON.stringify(budgets));

    if (settings.currency) {
      localStorage.setItem("pennyplot-currency", settings.currency);
    }

    if (settings.dateFormat) {
      localStorage.setItem("pennyplot-date-format", settings.dateFormat);
    }

    setTransactions(transactions);

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

    setTransactions([]);

    setDialog(null);

    showMessage("All PennyPlot data has been cleared.");

    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }
  return (
    <div className="min-h-screen bg-[#0f1714]">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#049552]/10 text-[#049552]">
            <SettingsIcon size={21} />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-white">Settings</h1>

            <p className="mt-1 text-sm text-gray-400">
              Manage your PennyPlot preferences and data.
            </p>
          </div>
        </div>
      </div>

      {/* Saved Message */}
      {message && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-[#049552]/20 bg-[#049552]/10 px-4 py-3 text-sm text-[#049552]">
          <CheckCircle2 size={17} />
          {message}
        </div>
      )}

      <div className="space-y-6">
        {/* Preferences */}
        <Card className="border-white/10 bg-[#22332b]/40">
          <CardHeader>
            <CardTitle className="text-lg text-white">Preferences</CardTitle>

            <p className="text-sm text-gray-500">
              Customize how PennyPlot displays your information.
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Currency */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-white">Currency</p>

                <p className="mt-1 text-xs text-gray-500">
                  Choose the currency used throughout PennyPlot.
                </p>
              </div>

              <select
                value={currency}
                onChange={(e) => updateCurrency(e.target.value)}
                className="rounded-xl border border-white/10 bg-[#0f1714] px-4 py-2.5 text-sm text-white outline-none focus:border-[#049552]"
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
                <p className="text-sm font-medium text-white">Date Format</p>

                <p className="mt-1 text-xs text-gray-500">
                  Choose how dates should be displayed.
                </p>
              </div>

              <select
                value={dateFormat}
                onChange={(e) => updateDateFormat(e.target.value)}
                className="rounded-xl border border-white/10 bg-[#0f1714] px-4 py-2.5 text-sm text-white outline-none focus:border-[#049552]"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>

                <option value="MM/DD/YYYY">MM/DD/YYYY</option>

                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="border-white/10 bg-[#22332b]/40">
          <CardHeader>
            <CardTitle className="text-lg text-white">
              Data Management
            </CardTitle>

            <p className="text-sm text-gray-500">
              Export or manage the information stored in PennyPlot.
            </p>
          </CardHeader>

          <CardContent className="space-y-3">
            {/* Transactions */}
            <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#0f1714]/50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <Database size={19} className="mt-0.5 text-[#049552]" />

                <div>
                  <p className="text-sm font-medium text-white">Transactions</p>

                  <p className="mt-1 text-xs text-gray-500">
                    {transactions.length} transaction
                    {transactions.length === 1 ? "" : "s"} stored.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={downloadTransactions}
                className="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-gray-300 transition hover:bg-white/5 hover:text-white"
              >
                <Download size={16} />
                Download
              </button>
            </div>

            {/* Budgets */}
            <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#0f1714]/50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <Wallet size={19} className="mt-0.5 text-[#049552]" />

                <div>
                  <p className="text-sm font-medium text-white">Budgets</p>

                  <p className="mt-1 text-xs text-gray-500">
                    Export your saved budget data.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={downloadBudgets}
                className="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-gray-300 transition hover:bg-white/5 hover:text-white"
              >
                <Download size={16} />
                Download
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Backup & Restore */}
        <Card className="border-white/10 bg-[#22332b]/40">
          <CardHeader>
            <CardTitle className="text-lg text-white">
              Backup & Restore
            </CardTitle>

            <p className="text-sm text-gray-500">
              Keep a portable copy of your PennyPlot data.
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Backup Status */}
            <div className="rounded-2xl border border-[#049552]/10 bg-[#049552]/5 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#049552]/10 text-[#049552]">
                  <Database size={19} />
                </div>

                <div>
                  <p className="text-sm font-medium text-white">
                    Backup status
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    {lastBackup
                      ? `Last backup: ${new Date(lastBackup).toLocaleString()}`
                      : "No backup has been created yet."}
                  </p>
                </div>
              </div>
            </div>

            {/* Create Backup */}
            <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#0f1714]/50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-white">Back Up Now</p>

                <p className="mt-1 text-xs text-gray-500">
                  Save your current PennyPlot data locally.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCreateBackup}
                className="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-gray-300 transition hover:bg-white/5 hover:text-white"
              >
                <Database size={16} />
                Back Up Now
              </button>
            </div>

            {/* Download Backup */}
            <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#0f1714]/50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-white">
                  Download backup
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Download a complete copy of your PennyPlot data.
                </p>
              </div>

              <button
                type="button"
                onClick={handleDownloadBackup}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#049552] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#038247]"
              >
                <Download size={16} />
                Download Backup
              </button>
            </div>

            {/* Restore Backup */}
            <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#0f1714]/50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-white">Restore backup</p>

                <p className="mt-1 text-xs text-gray-500">
                  Restore your data from a PennyPlot backup file.
                </p>
              </div>

              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-gray-300 transition hover:bg-white/5 hover:text-white">
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

            <p className="text-xs leading-5 text-gray-600">
              Backup files contain your transactions, budgets, currency, and
              date-format preferences. Keep downloaded backups somewhere safe.
            </p>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-500/15 bg-red-500/[0.02]">
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertTriangle size={20} className="text-red-400" />

              <div>
                <CardTitle className="text-lg text-white">
                  Danger Zone
                </CardTitle>

                <p className="mt-1 text-sm text-gray-500">
                  These actions permanently delete your data.
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            <button
              type="button"
              onClick={() => setDialog("transactions")}
              className="flex w-full items-center justify-between rounded-xl border border-red-500/10 bg-red-500/5 px-4 py-3 text-sm text-red-400 transition hover:bg-red-500/10"
            >
              <span>Delete all transactions</span>
              <Trash2 size={17} />
            </button>

            <button
              type="button"
              onClick={() => setDialog("budgets")}
              className="flex w-full items-center justify-between rounded-xl border border-red-500/10 bg-red-500/5 px-4 py-3 text-sm text-red-400 transition hover:bg-red-500/10"
            >
              <span>Delete all budgets</span>
              <Trash2 size={17} />
            </button>

            <button
              type="button"
              onClick={() => setDialog("everything")}
              className="flex w-full items-center justify-between rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-600"
            >
              <span>Delete all PennyPlot data</span>

              <Trash2 size={17} />
            </button>
          </CardContent>
        </Card>

        {/* About */}
        <Card className="border-white/10 bg-[#22332b]/40">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">PennyPlot</p>

                <p className="mt-1 text-xs text-gray-500">
                  Personal finance dashboard
                </p>
              </div>

              <span className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-500">
                v1.0.0
              </span>
            </div>

            <div className="mt-5 border-t border-white/10 pt-4">
              <p className="text-xs leading-5 text-gray-600">
                Your current data is stored locally on this device. Cloud
                synchronization can be added later.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={dialog !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDialog(null);
          }
        }}
      >
        <DialogContent className="border-white/10 bg-[#1b2922] text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {dialog === "transactions" && "Delete all transactions?"}
              {dialog === "budgets" && "Delete all budgets?"}
              {dialog === "everything" && "Delete all PennyPlot data?"}
              {dialog === "restore" && "Restore this backup?"}
            </DialogTitle>

            <DialogDescription className="text-gray-400">
              {dialog === "transactions" &&
                "This will permanently delete all your saved transactions. This action cannot be undone."}

              {dialog === "budgets" &&
                "This will permanently delete all your saved budgets. This action cannot be undone."}

              {dialog === "everything" &&
                "This will permanently delete your transactions, budgets, currency settings, and date preferences. This action cannot be undone."}

              {dialog === "restore" &&
                "Restoring this backup will replace your current PennyPlot data. Your existing data will be overwritten."}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-2">
            <button
              type="button"
              onClick={() => setDialog(null)}
              className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-gray-300 transition hover:bg-white/5 hover:text-white"
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
              className="rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600"
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
