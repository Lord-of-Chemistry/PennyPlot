import { downloadCSV } from "./exportCsv";

export function downloadBudgetsCSV(
  budgetData,
  currency = "NGN",
) {
  if (!budgetData || budgetData.length === 0) {
    throw new Error("There are no budgets to export.");
  }

  const headers = [
    "Category",
    "Period",
    "Budget",
    "Spent",
    "Remaining",
    "Usage",
    "Status",
    "Currency",
  ];

  const rows = budgetData.map((budget) => [
    budget.category,
    budget.period,
    budget.amount,
    budget.spent,
    budget.remaining,
    `${Math.round(budget.percentage)}%`,
    budget.status,
    currency,
  ]);

  downloadCSV(
    `pennyplot-budgets-${new Date()
      .toISOString()
      .split("T")[0]}.csv`,
    headers,
    rows,
  );
}