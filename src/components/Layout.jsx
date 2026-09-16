import { useEffect, useMemo, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import SideBar from "./SideBar";
import NotificationCenter from "./NotificationCenter";
import ProfileMenu from "./ProfileMenu";
import { createBackup } from "../utils/backup";
import { getProfile } from "../utils/profile";
import {
  getNotifications,
  saveNotifications,
  createNotification,
  NOTIFICATION_TYPES,
} from "../utils/notifications";
import { formatCurrency } from "../utils/currency";
import { processRecurringTransactions } from "../utils/recurringTransactions";

function Layout() {
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(false);

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
  const [notifications, setNotifications] = useState(() => getNotifications());

  //RECURRING TRANSACTIONS
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

  function handleSignOut() {
    localStorage.removeItem("pennyplot-profile");
    setProfile(null);
    navigate("/");
  }

  /*
    ============================================================
    BUDGET ALERT SYSTEM
    ============================================================
  */

  const budgets = useMemo(() => {
    try {
      const savedBudgets = localStorage.getItem("pennyplot-budgets");

      if (!savedBudgets) {
        return [];
      }

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

      const budgetAmount = Number(budget.amount || 0);

      const percentage = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;

      const remaining = budgetAmount - spent;

      return {
        ...budget,
        spent,
        percentage,
        remaining,
      };
    });
  }, [budgets, transactions]);

  useEffect(() => {
    if (budgetData.length === 0) {
      return;
    }

    const ALERTS_KEY = "pennyplot-budget-alerts";

    let sentAlerts = {};

    try {
      const savedAlerts = localStorage.getItem(ALERTS_KEY);

      if (savedAlerts) {
        const parsedAlerts = JSON.parse(savedAlerts);

        if (
          parsedAlerts &&
          typeof parsedAlerts === "object" &&
          !Array.isArray(parsedAlerts)
        ) {
          sentAlerts = parsedAlerts;
        }
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
    PERSISTENCE
    ============================================================
  */

  useEffect(() => {
    localStorage.setItem(
      "pennyplot-transactions",
      JSON.stringify(transactions),
    );
  }, [transactions]);

  useEffect(() => {
    createBackup();
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem("pennyplot-currency", currency);
  }, [currency]);

  useEffect(() => {
    localStorage.setItem("pennyplot-date-format", dateFormat);
  }, [dateFormat]);

  useEffect(() => {
    if (profile) {
      localStorage.setItem("pennyplot-profile", JSON.stringify(profile));
    }
  }, [profile]);

  useEffect(() => {
    saveNotifications(notifications);
  }, [notifications]);

  return (
    <div className="min-h-screen bg-background">
      <SideBar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        profile={profile}
      />

      <main
        className={`bg-background text-foreground transition-[margin] duration-300 ease-in-out ${
          isCollapsed ? "md:ml-20" : "md:ml-60"
        }`}
      >
        <header className="sticky top-0 z-[100] border-b border-border/60 bg-background/95 px-4 py-3 backdrop-blur-md">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src="/favicon.svg" alt="PennyPlot" className="h-8 w-8" />

              <span className="text-lg font-bold tracking-tight text-foreground">
                Penny<span className="text-primary">Plot</span>
              </span>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <NotificationCenter
                notifications={notifications}
                setNotifications={setNotifications}
              />

              <div>
                <ProfileMenu profile={profile} mobile />
              </div>

              <button
                type="button"
                onClick={handleSignOut}
                aria-label="Sign out"
                title="Sign out"
                className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          </div>
        </header>

        <Outlet
          context={{
            transactions,
            setTransactions,
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
      </main>
    </div>
  );
}

export default Layout;
