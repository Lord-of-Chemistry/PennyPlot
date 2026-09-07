import { useEffect, useMemo, useState } from "react";
import { Outlet } from "react-router-dom";
import SideBar from "./SideBar";
import { createBackup } from "../utils/backup";
import { getProfile } from "../utils/profile";
import {
  getNotifications,
  saveNotifications,
  createNotification,
  NOTIFICATION_TYPES,
} from "../utils/notifications";
import NotificationCenter from "./NotificationCenter";
import { formatCurrency } from "../utils/currency";
import { processRecurringTransactions } from "../utils/recurringTransactions";

function Layout() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Online / Offline status
  const [isOnline, setIsOnline] = useState(true);
  const [showBackOnline, setShowBackOnline] = useState(false);

  // Currency
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem("pennyplot-currency") || "NGN";
  });

  // Date format
  const [dateFormat, setDateFormat] = useState(() => {
    return localStorage.getItem("pennyplot-date-format") || "DD/MM/YYYY";
  });

  // Profile
  const [profile, setProfile] = useState(() => getProfile());

  // Transactions
  const [transactions, setTransactions] = useState(() => {
    try {
      const savedTransactions = localStorage.getItem("pennyplot-transactions");

      return savedTransactions ? JSON.parse(savedTransactions) : [];
    } catch (error) {
      console.error("Failed to load transactions:", error);

      return [];
    }
  });

  // Notifications
  const [notifications, setNotifications] = useState(getNotifications());

  /*
    ============================================================
    RECURRING TRANSACTIONS
    ============================================================
  */

  useEffect(() => {
    const result = processRecurringTransactions(transactions);

    if (result.processed.length === 0) {
      return;
    }

    setTransactions(result.transactions);

    result.processed.forEach(({ recurring }) => {
      const notification = createNotification({
        type: NOTIFICATION_TYPES.RECURRING,
        title: "Recurring transaction added",
        message: `${recurring.description} of ${formatCurrency(
          recurring.amount,
          currency,
        )} was automatically added to your transactions.`,
      });

      setNotifications((currentNotifications) => [
        notification,
        ...currentNotifications,
      ]);
    });
  }, []);

  /*
    ============================================================
    INTERNET CONNECTION
    ============================================================
  */

  // Check if the internet is actually reachable
  async function checkConnection(showNotification = false) {
    try {
      await fetch(
        `https://www.google.com/generate_204?cacheBust=${Date.now()}`,
        {
          method: "GET",
          mode: "no-cors",
          cache: "no-store",
        },
      );

      setIsOnline((previous) => {
        if (!previous && showNotification) {
          setShowBackOnline(true);

          const notification = createNotification({
            type: NOTIFICATION_TYPES.CONNECTION,
            title: "Back online",
            message: "PennyPlot is connected to the internet again.",
          });

          setNotifications((currentNotifications) => [
            notification,
            ...currentNotifications,
          ]);

          setTimeout(() => {
            setShowBackOnline(false);
          }, 3000);
        }

        return true;
      });
    } catch {
      setIsOnline(false);
    }
  }

  // Monitor internet connection
  useEffect(() => {
    checkConnection();

    const connectionInterval = setInterval(() => {
      checkConnection(true);
    }, 5000);

    function handleOnline() {
      checkConnection(true);
    }

    function handleOffline() {
      setIsOnline(false);
      setShowBackOnline(false);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      clearInterval(connectionInterval);

      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  /*
    ============================================================
    BUDGET ALERT SYSTEM
    ============================================================

    This now lives in Layout instead of Budgets.jsx.

    Therefore budget alerts can be detected globally,
    regardless of which page the user is currently viewing.

    75%  -> Warning
    90%  -> Almost reached
    100% -> Exceeded
  */

  const budgets = useMemo(() => {
    try {
      const savedBudgets = localStorage.getItem("pennyplot-budgets");

      if (!savedBudgets) return [];

      const parsedBudgets = JSON.parse(savedBudgets);

      return Array.isArray(parsedBudgets) ? parsedBudgets : [];
    } catch (error) {
      console.error("Failed to load budgets for alerts:", error);

      return [];
    }
  }, [transactions]);

  const budgetData = useMemo(() => {
    const now = new Date();

    return budgets.map((budget) => {
      const spent = transactions
        .filter(
          (transaction) =>
            transaction.type === "expense" &&
            transaction.category === budget.category,
        )
        .filter((transaction) => {
          const transactionDate = new Date(transaction.date);

          if (Number.isNaN(transactionDate.getTime())) {
            return false;
          }

          if (budget.period === "monthly") {
            return (
              transactionDate.getMonth() === now.getMonth() &&
              transactionDate.getFullYear() === now.getFullYear()
            );
          }

          if (budget.period === "yearly") {
            return transactionDate.getFullYear() === now.getFullYear();
          }

          return false;
        })
        .reduce(
          (total, transaction) => total + Number(transaction.amount || 0),
          0,
        );

      const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

      const remaining = Number(budget.amount || 0) - spent;

      return {
        ...budget,
        spent,
        percentage,
        remaining,
      };
    });
  }, [budgets, transactions]);

  // Check budget thresholds globally
  useEffect(() => {
    if (budgetData.length === 0) return;

    const ALERTS_KEY = "pennyplot-budget-alerts";

    let sentAlerts = {};

    try {
      const savedAlerts = localStorage.getItem(ALERTS_KEY);

      if (savedAlerts) {
        sentAlerts = JSON.parse(savedAlerts);
      }
    } catch (error) {
      console.error("Failed to load budget alert history:", error);
    }

    const now = new Date();

    const monthlyPeriodKey = `${now.getFullYear()}-${String(
      now.getMonth() + 1,
    ).padStart(2, "0")}`;

    const yearlyPeriodKey = String(now.getFullYear());

    let alertsChanged = false;

    budgetData.forEach((budget) => {
      const percentage = budget.percentage;

      const budgetPeriodKey =
        budget.period === "yearly" ? yearlyPeriodKey : monthlyPeriodKey;

      /*
        100%+ — Budget exceeded
      */
      if (percentage >= 100) {
        const alertKey = `${budget.id}-${budget.period}-${budgetPeriodKey}-100`;

        if (!sentAlerts[alertKey]) {
          const notification = createNotification({
            type: NOTIFICATION_TYPES.BUDGET,
            title: `${budget.category} budget exceeded`,
            message: `You've exceeded your ${budget.period} ${budget.category} budget by ${formatCurrency(
              Math.abs(budget.remaining),
              currency,
            )}.`,
          });

          setNotifications((currentNotifications) => [
            notification,
            ...currentNotifications,
          ]);

          sentAlerts[alertKey] = true;
          alertsChanged = true;
        }

        return;
      }

      /*
        90%+ — Almost exceeded
      */
      if (percentage >= 90) {
        const alertKey = `${budget.id}-${budget.period}-${budgetPeriodKey}-90`;

        if (!sentAlerts[alertKey]) {
          const notification = createNotification({
            type: NOTIFICATION_TYPES.BUDGET,
            title: `${budget.category} budget almost reached`,
            message: `You've used ${Math.round(
              percentage,
            )}% of your ${budget.period} ${budget.category} budget. Only ${formatCurrency(
              Math.max(budget.remaining, 0),
              currency,
            )} remains.`,
          });

          setNotifications((currentNotifications) => [
            notification,
            ...currentNotifications,
          ]);

          sentAlerts[alertKey] = true;
          alertsChanged = true;
        }

        return;
      }

      /*
        75%+ — Approaching limit
      */
      if (percentage >= 75) {
        const alertKey = `${budget.id}-${budget.period}-${budgetPeriodKey}-75`;

        if (!sentAlerts[alertKey]) {
          const notification = createNotification({
            type: NOTIFICATION_TYPES.BUDGET,
            title: `${budget.category} budget warning`,
            message: `You've used ${Math.round(
              percentage,
            )}% of your ${budget.period} ${budget.category} budget. You have ${formatCurrency(
              Math.max(budget.remaining, 0),
              currency,
            )} remaining.`,
          });

          setNotifications((currentNotifications) => [
            notification,
            ...currentNotifications,
          ]);

          sentAlerts[alertKey] = true;
          alertsChanged = true;
        }
      }
    });

    if (alertsChanged) {
      localStorage.setItem(ALERTS_KEY, JSON.stringify(sentAlerts));
    }
  }, [budgetData, currency]);

  /*
    ============================================================
    LOCAL STORAGE
    ============================================================
  */

  // Save transactions locally
  useEffect(() => {
    localStorage.setItem(
      "pennyplot-transactions",
      JSON.stringify(transactions),
    );
  }, [transactions]);

  // Create automatic backup
  useEffect(() => {
    createBackup();
  }, [transactions]);

  // Save date format
  useEffect(() => {
    localStorage.setItem("pennyplot-date-format", dateFormat);
  }, [dateFormat]);

  // Save profile
  useEffect(() => {
    localStorage.setItem("pennyplot-profile", JSON.stringify(profile));
  }, [profile]);

  // Save notifications
  useEffect(() => {
    saveNotifications(notifications);
  }, [notifications]);

  /*
    ============================================================
    LAYOUT
    ============================================================
  */

  return (
    <div className="min-h-screen bg-background">
      <SideBar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isOnline={isOnline}
        profile={profile}
      />

      <main
        className={`bg-background text-foreground transition-[margin] duration-300 ease-in-out ${
          isCollapsed ? "md:ml-20" : "md:ml-56"
        }`}
      >
        {/* Sticky global header */}
        <header className="sticky top-0 z-[100] border-b border-border/60 bg-background/95 px-4 py-3 backdrop-blur-md">
          <div className="flex items-center justify-end">
            <NotificationCenter
              notifications={notifications}
              setNotifications={setNotifications}
            />
          </div>
        </header>

        {/* Back online notification */}
        <div
          className={`fixed right-4 top-4 z-[150] flex items-center gap-2 rounded-xl border border-primary/30 bg-accent px-4 py-3 text-sm text-foreground shadow-2xl transition-all duration-300 ${
            showBackOnline
              ? "translate-y-0 opacity-100"
              : "pointer-events-none -translate-y-3 opacity-0"
          }`}
        >
          <span className="h-2.5 w-2.5 rounded-full bg-primary" />
          Back online
        </div>

        <div className="p-4 pb-24 md:pb-4">
          <Outlet
            context={{
              transactions,
              setTransactions,
              isOnline,
              currency,
              setCurrency,
              dateFormat,
              setDateFormat,
              profile,
              setProfile,
              notifications,
              setNotifications,
            }}
          />
        </div>
      </main>
    </div>
  );
}

export default Layout;
