const RECURRING_TRANSACTIONS_KEY = "pennyplot-recurring-transactions";

export const RECURRING_FREQUENCIES = {
  DAILY: "day",
  WEEKLY: "week",
  MONTHLY: "month",
  YEARLY: "year",
};

function formatDateParts(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseDate(dateString) {
  const date = new Date(`${dateString}T00:00:00`);

  return Number.isNaN(date.getTime()) ? null : date;
}

export function getRecurringTransactions() {
  try {
    const saved = localStorage.getItem(RECURRING_TRANSACTIONS_KEY);

    if (!saved) return [];

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to load recurring transactions:", error);
    return [];
  }
}

export function saveRecurringTransactions(recurringTransactions) {
  try {
    localStorage.setItem(
      RECURRING_TRANSACTIONS_KEY,
      JSON.stringify(recurringTransactions),
    );

    return true;
  } catch (error) {
    console.error("Failed to save recurring transactions:", error);
    return false;
  }
}

export function createRecurringTransaction(data) {
  const recurringTransactions = getRecurringTransactions();

  const recurringTransaction = {
    id: crypto.randomUUID(),
    description: data.description.trim(),
    amount: Number(data.amount),
    type: data.type,
    category: data.category,
    frequency: data.frequency,
    startDate: data.startDate,
    nextOccurrence: data.startDate,
    active: true,
    createdAt: new Date().toISOString(),
  };

  saveRecurringTransactions([recurringTransaction, ...recurringTransactions]);

  return recurringTransaction;
}

export function updateRecurringTransaction(id, updates) {
  const recurringTransactions = getRecurringTransactions();

  const updated = recurringTransactions.map((transaction) =>
    transaction.id === id ? { ...transaction, ...updates } : transaction,
  );

  saveRecurringTransactions(updated);

  return updated;
}

export function deleteRecurringTransaction(id) {
  const recurringTransactions = getRecurringTransactions();

  const updated = recurringTransactions.filter(
    (transaction) => transaction.id !== id,
  );

  saveRecurringTransactions(updated);

  return updated;
}

export function toggleRecurringTransaction(id) {
  const recurringTransactions = getRecurringTransactions();

  const updated = recurringTransactions.map((transaction) =>
    transaction.id === id
      ? { ...transaction, active: !transaction.active }
      : transaction,
  );

  saveRecurringTransactions(updated);

  return updated;
}

export function calculateNextOccurrence(
  currentDate,
  frequency,
  anchorDate = currentDate,
) {
  const date = parseDate(currentDate);
  const anchor = parseDate(anchorDate);

  if (!date || !anchor) {
    return currentDate;
  }

  switch (frequency) {
    case RECURRING_FREQUENCIES.DAILY:
      date.setDate(date.getDate() + 1);
      break;

    case RECURRING_FREQUENCIES.WEEKLY:
      date.setDate(date.getDate() + 7);
      break;

    case RECURRING_FREQUENCIES.MONTHLY: {
      const anchorDay = anchor.getDate();

      date.setDate(1);
      date.setMonth(date.getMonth() + 1);

      const lastDayOfMonth = new Date(
        date.getFullYear(),
        date.getMonth() + 1,
        0,
      ).getDate();

      date.setDate(Math.min(anchorDay, lastDayOfMonth));
      break;
    }

    case RECURRING_FREQUENCIES.YEARLY: {
      const anchorMonth = anchor.getMonth();
      const anchorDay = anchor.getDate();

      date.setDate(1);
      date.setMonth(anchorMonth);
      date.setFullYear(date.getFullYear() + 1);

      const lastDayOfMonth = new Date(
        date.getFullYear(),
        anchorMonth + 1,
        0,
      ).getDate();

      date.setDate(Math.min(anchorDay, lastDayOfMonth));
      break;
    }

    default:
      return currentDate;
  }

  return formatDateParts(date);
}

export function processRecurringTransactions(transactions) {
  const recurringTransactions = getRecurringTransactions();

  if (recurringTransactions.length === 0) {
    return {
      transactions,
      recurringTransactions,
      processed: [],
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let updatedTransactions = [...transactions];
  let updatedRecurringTransactions = [...recurringTransactions];
  const processed = [];

  updatedRecurringTransactions = updatedRecurringTransactions.map(
    (recurring) => {
      if (!recurring.active) {
        return recurring;
      }

      let nextOccurrence = recurring.nextOccurrence;
      let occurrenceDate = parseDate(nextOccurrence);

      if (!occurrenceDate) {
        return recurring;
      }

      let safetyCounter = 0;

      while (occurrenceDate <= today && safetyCounter < 1000) {
        const alreadyExists = updatedTransactions.some(
          (transaction) =>
            transaction.recurringTransactionId === recurring.id &&
            transaction.date === nextOccurrence,
        );

        if (!alreadyExists) {
          const generatedTransaction = {
            id: crypto.randomUUID(),
            description: recurring.description,
            amount: Number(recurring.amount),
            type: recurring.type,
            category: recurring.category,
            date: nextOccurrence,
            recurringTransactionId: recurring.id,
            isRecurring: true,
          };

          updatedTransactions.push(generatedTransaction);

          processed.push({
            recurring,
            transaction: generatedTransaction,
          });
        }

        const updatedNextOccurrence = calculateNextOccurrence(
          nextOccurrence,
          recurring.frequency,
          recurring.startDate,
        );

        // Prevent an invalid frequency/date from creating an infinite loop.
        if (updatedNextOccurrence === nextOccurrence) {
          break;
        }

        nextOccurrence = updatedNextOccurrence;
        occurrenceDate = parseDate(nextOccurrence);
        safetyCounter++;
      }

      return {
        ...recurring,
        nextOccurrence,
      };
    },
  );

  saveRecurringTransactions(updatedRecurringTransactions);

  return {
    transactions: updatedTransactions,
    recurringTransactions: updatedRecurringTransactions,
    processed,
  };
}
