const RECURRING_TRANSACTIONS_KEY =
  "pennyplot-recurring-transactions";

export const RECURRING_FREQUENCIES = {
  DAILY: "daily",
  WEEKLY: "weekly",
  MONTHLY: "monthly",
  YEARLY: "yearly",
};

export function getRecurringTransactions() {
  try {
    const saved = localStorage.getItem(
      RECURRING_TRANSACTIONS_KEY,
    );

    if (!saved) return [];

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error(
      "Failed to load recurring transactions:",
      error,
    );

    return [];
  }
}

export function saveRecurringTransactions(
  recurringTransactions,
) {
  try {
    localStorage.setItem(
      RECURRING_TRANSACTIONS_KEY,
      JSON.stringify(recurringTransactions),
    );

    return true;
  } catch (error) {
    console.error(
      "Failed to save recurring transactions:",
      error,
    );

    return false;
  }
}

export function createRecurringTransaction(data) {
  const recurringTransactions =
    getRecurringTransactions();

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

  saveRecurringTransactions([
    recurringTransaction,
    ...recurringTransactions,
  ]);

  return recurringTransaction;
}

export function updateRecurringTransaction(
  id,
  updates,
) {
  const recurringTransactions =
    getRecurringTransactions();

  const updated = recurringTransactions.map(
    (transaction) =>
      transaction.id === id
        ? {
            ...transaction,
            ...updates,
          }
        : transaction,
  );

  saveRecurringTransactions(updated);

  return updated;
}

export function deleteRecurringTransaction(id) {
  const recurringTransactions =
    getRecurringTransactions();

  const updated = recurringTransactions.filter(
    (transaction) => transaction.id !== id,
  );

  saveRecurringTransactions(updated);

  return updated;
}

export function toggleRecurringTransaction(id) {
  const recurringTransactions =
    getRecurringTransactions();

  const updated = recurringTransactions.map(
    (transaction) =>
      transaction.id === id
        ? {
            ...transaction,
            active: !transaction.active,
          }
        : transaction,
  );

  saveRecurringTransactions(updated);

  return updated;
}

export function calculateNextOccurrence(
  currentDate,
  frequency,
) {
  const date = new Date(`${currentDate}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return currentDate;
  }

  if (frequency === RECURRING_FREQUENCIES.DAILY) {
    date.setDate(date.getDate() + 1);
  }

  if (frequency === RECURRING_FREQUENCIES.WEEKLY) {
    date.setDate(date.getDate() + 7);
  }

  if (frequency === RECURRING_FREQUENCIES.MONTHLY) {
    date.setMonth(date.getMonth() + 1);
  }

  if (frequency === RECURRING_FREQUENCIES.YEARLY) {
    date.setFullYear(date.getFullYear() + 1);
  }

  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function processRecurringTransactions(
  transactions,
) {
  const recurringTransactions =
    getRecurringTransactions();

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
  let updatedRecurringTransactions = [
    ...recurringTransactions,
  ];

  const processed = [];

  updatedRecurringTransactions =
    updatedRecurringTransactions.map((recurring) => {
      if (!recurring.active) {
        return recurring;
      }

      let nextOccurrence =
        recurring.nextOccurrence;

      let occurrenceDate = new Date(
        `${nextOccurrence}T00:00:00`,
      );

      if (Number.isNaN(occurrenceDate.getTime())) {
        return recurring;
      }

      let safetyCounter = 0;

      while (
        occurrenceDate <= today &&
        safetyCounter < 100
      ) {
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

        updatedTransactions.push(
          generatedTransaction,
        );

        processed.push({
          recurring,
          transaction: generatedTransaction,
        });

        nextOccurrence =
          calculateNextOccurrence(
            nextOccurrence,
            recurring.frequency,
          );

        occurrenceDate = new Date(
          `${nextOccurrence}T00:00:00`,
        );

        safetyCounter++;
      }

      return {
        ...recurring,
        nextOccurrence,
      };
    });

  saveRecurringTransactions(
    updatedRecurringTransactions,
  );

  return {
    transactions: updatedTransactions,
    recurringTransactions:
      updatedRecurringTransactions,
    processed,
  };
}