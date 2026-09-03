const DATE_FORMAT_KEY = "pennyplot-date-format";

export const DEFAULT_DATE_FORMAT = "DD/MM/YYYY";

export function getDateFormat() {
  return localStorage.getItem(DATE_FORMAT_KEY) || DEFAULT_DATE_FORMAT;
}

export function formatDate(date, format = getDateFormat()) {
  if (!date) return "";

  const [year, month, day] = date.split("-");

  if (!year || !month || !day) {
    return date;
  }

  if (format === "MM/DD/YYYY") {
    return `${month}/${day}/${year}`;
  }

  if (format === "YYYY-MM-DD") {
    return `${year}-${month}-${day}`;
  }

  return `${day}/${month}/${year}`;
}
