import { downloadCSV } from "./exportCsv";

export function downloadAnalyticsCSV(
  periodData,
  currency = "NGN",
) {
  if (!periodData || periodData.length === 0) {
    throw new Error("There is no analytics data to export.");
  }

  const headers = [
    "Period",
    "Income",
    "Expenses",
    "Net",
    "Currency",
  ];

  const rows = periodData.map((period) => [
    period.label,
    period.income,
    period.expenses,
    period.net,
    currency,
  ]);

  downloadCSV(
    `pennyplot-analytics-${new Date()
      .toISOString()
      .split("T")[0]}.csv`,
    headers,
    rows,
  );
}