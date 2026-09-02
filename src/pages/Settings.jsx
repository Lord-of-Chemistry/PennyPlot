import { useState } from "react";
import { useOutletContext } from "react-router-dom";
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
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function Settings() {
  const { transactions, setTransactions } = useOutletContext();

  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem("pennyplot-currency") || "NGN";
  });

  const [dateFormat, setDateFormat] = useState(() => {
    return (
      localStorage.getItem("pennyplot-date-format") ||
      "DD/MM/YYYY"
    );
  });

  const [message, setMessage] = useState("");

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

    const headers = [
      "Description",
      "Type",
      "Amount",
      "Category",
      "Date",
    ];

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
        row
          .map((value) =>
            `"${String(value).replace(/"/g, '""')}"`
          )
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = `pennyplot-transactions-${new Date()
      .toISOString()
      .split("T")[0]}.csv`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    showMessage("Transactions downloaded.");
  }

  function downloadBudgets() {
    const savedBudgets = localStorage.getItem(
      "pennyplot-budgets"
    );

    const budgets = savedBudgets
      ? JSON.parse(savedBudgets)
      : [];

    if (budgets.length === 0) {
      showMessage("There are no budgets to download.");
      return;
    }

    const headers = [
      "Category",
      "Period",
      "Budget Amount",
    ];

    const rows = budgets.map((budget) => [
      budget.category,
      budget.period,
      budget.amount,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((value) =>
            `"${String(value).replace(/"/g, '""')}"`
          )
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = `pennyplot-budgets-${new Date()
      .toISOString()
      .split("T")[0]}.csv`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    showMessage("Budgets downloaded.");
  }

  function clearTransactions() {
    const confirmed = window.confirm(
      "Are you sure you want to delete all transactions? This cannot be undone."
    );

    if (!confirmed) return;

    setTransactions([]);

    localStorage.removeItem("pennyplot-transactions");

    showMessage("All transactions have been deleted.");
  }

  function clearBudgets() {
    const confirmed = window.confirm(
      "Are you sure you want to delete all budgets? This cannot be undone."
    );

    if (!confirmed) return;

    localStorage.removeItem("pennyplot-budgets");

    showMessage("All budgets have been deleted.");

    window.location.reload();
  }

  function clearEverything() {
    const confirmed = window.confirm(
      "This will permanently delete ALL PennyPlot data. Are you sure?"
    );

    if (!confirmed) return;

    localStorage.removeItem("pennyplot-transactions");
    localStorage.removeItem("pennyplot-budgets");
    localStorage.removeItem("pennyplot-currency");
    localStorage.removeItem("pennyplot-date-format");

    setTransactions([]);

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
            <h1 className="text-3xl font-bold text-white">
              Settings
            </h1>

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
            <CardTitle className="text-lg text-white">
              Preferences
            </CardTitle>

            <p className="text-sm text-gray-500">
              Customize how PennyPlot displays your information.
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Currency */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-white">
                  Currency
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Choose the currency used throughout PennyPlot.
                </p>
              </div>

              <select
                value={currency}
                onChange={(e) =>
                  updateCurrency(e.target.value)
                }
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
                <p className="text-sm font-medium text-white">
                  Date Format
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Choose how dates should be displayed.
                </p>
              </div>

              <select
                value={dateFormat}
                onChange={(e) =>
                  updateDateFormat(e.target.value)
                }
                className="rounded-xl border border-white/10 bg-[#0f1714] px-4 py-2.5 text-sm text-white outline-none focus:border-[#049552]"
              >
                <option value="DD/MM/YYYY">
                  DD/MM/YYYY
                </option>

                <option value="MM/DD/YYYY">
                  MM/DD/YYYY
                </option>

                <option value="YYYY-MM-DD">
                  YYYY-MM-DD
                </option>
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
                <Database
                  size={19}
                  className="mt-0.5 text-[#049552]"
                />

                <div>
                  <p className="text-sm font-medium text-white">
                    Transactions
                  </p>

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
                <Wallet
                  size={19}
                  className="mt-0.5 text-[#049552]"
                />

                <div>
                  <p className="text-sm font-medium text-white">
                    Budgets
                  </p>

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

        {/* Danger Zone */}
        <Card className="border-red-500/15 bg-red-500/[0.02]">
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertTriangle
                size={20}
                className="text-red-400"
              />

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
              onClick={clearTransactions}
              className="flex w-full items-center justify-between rounded-xl border border-red-500/10 bg-red-500/5 px-4 py-3 text-sm text-red-400 transition hover:bg-red-500/10"
            >
              <span>Delete all transactions</span>

              <Trash2 size={17} />
            </button>

            <button
              type="button"
              onClick={clearBudgets}
              className="flex w-full items-center justify-between rounded-xl border border-red-500/10 bg-red-500/5 px-4 py-3 text-sm text-red-400 transition hover:bg-red-500/10"
            >
              <span>Delete all budgets</span>

              <Trash2 size={17} />
            </button>

            <button
              type="button"
              onClick={clearEverything}
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
                <p className="font-semibold text-white">
                  PennyPlot
                </p>

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
                Your current data is stored locally on this
                device. Cloud synchronization can be added later.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Settings;