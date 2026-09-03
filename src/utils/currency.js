const currencyMap = {
  NGN: {
    symbol: "₦",
    name: "Nigerian naira",
  },
  USD: {
    symbol: "$",
    name: "US dollars",
  },
  GBP: {
    symbol: "£",
    name: "British pounds",
  },
  EUR: {
    symbol: "€",
    name: "euros",
  },
};

export function getCurrencySymbol(currency = "NGN") {
  return currencyMap[currency]?.symbol || "₦";
}

export function getCurrencyName(currency = "NGN") {
  return currencyMap[currency]?.name || "Nigerian naira";
}

export function formatCurrency(amount, currency = "NGN") {
  const symbol = currencyMap[currency]?.symbol || "₦";

  return `${symbol}${Number(amount || 0).toLocaleString("en-NG")}`;
}