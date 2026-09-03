const BACKUP_KEY = "pennyplot-backup";

const CUSTOM_INCOME_KEY = "pennyplot-custom-income-categories";
const CUSTOM_EXPENSE_KEY = "pennyplot-custom-expense-categories";

export function createBackup() {
  const transactions = JSON.parse(
    localStorage.getItem("pennyplot-transactions") || "[]",
  );

  const budgets = JSON.parse(
    localStorage.getItem("pennyplot-budgets") || "[]",
  );

  const currency =
    localStorage.getItem("pennyplot-currency") || "NGN";

  const dateFormat =
    localStorage.getItem("pennyplot-date-format") || "DD/MM/YYYY";

  const customIncomeCategories = JSON.parse(
    localStorage.getItem(CUSTOM_INCOME_KEY) || "[]",
  );

  const customExpenseCategories = JSON.parse(
    localStorage.getItem(CUSTOM_EXPENSE_KEY) || "[]",
  );

  const backup = {
    app: "PennyPlot",
    version: "1.0.0",
    createdAt: new Date().toISOString(),

    data: {
      transactions,
      budgets,

      settings: {
        currency,
        dateFormat,
      },

      customCategories: {
        income: Array.isArray(customIncomeCategories)
          ? customIncomeCategories
          : [],

        expense: Array.isArray(customExpenseCategories)
          ? customExpenseCategories
          : [],
      },
    },
  };

  localStorage.setItem(BACKUP_KEY, JSON.stringify(backup));

  return backup;
}

export function getBackup() {
  try {
    const savedBackup = localStorage.getItem(BACKUP_KEY);

    return savedBackup ? JSON.parse(savedBackup) : null;
  } catch (error) {
    console.error("Failed to load PennyPlot backup:", error);

    return null;
  }
}

export function getLastBackupDate() {
  const backup = getBackup();

  return backup?.createdAt || null;
}

export function downloadBackup() {
  const backup = createBackup();

  const blob = new Blob(
    [JSON.stringify(backup, null, 2)],
    {
      type: "application/json",
    },
  );

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;

  link.download = `pennyplot-backup-${new Date()
    .toISOString()
    .slice(0, 10)}.json`;

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}