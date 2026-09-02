import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import SideBar from "./SideBar";
import { createBackup } from "../utils/backup";

function Layout() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Online / Offline status
  const [isOnline, setIsOnline] = useState(true);
  const [showBackOnline, setShowBackOnline] = useState(false);

  const [transactions, setTransactions] = useState(() => {
    try {
      const savedTransactions = localStorage.getItem("pennyplot-transactions");

      return savedTransactions ? JSON.parse(savedTransactions) : [];
    } catch (error) {
      console.error("Failed to load transactions:", error);
      return [];
    }
  });

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
    // Check immediately when PennyPlot loads
    checkConnection();

    // Check every 5 seconds
    const connectionInterval = setInterval(() => {
      checkConnection(true);
    }, 5000);

    // React quickly to browser connection events
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

  // Save transactions locally
  useEffect(() => {
    localStorage.setItem(
      "pennyplot-transactions",
      JSON.stringify(transactions),
    );
  }, [transactions]);

  useEffect(() => {
  createBackup();
}, [transactions]);

  return (
    <div className="min-h-screen bg-[#0f1714]">
      <SideBar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isOnline={isOnline}
      />

      {/* Back online notification */}
      <div
        className={`fixed right-4 top-4 z-[100] flex items-center gap-2 rounded-xl border border-[#049552]/30 bg-[#1b2922] px-4 py-3 text-sm text-white shadow-2xl transition-all duration-300 ${
          showBackOnline
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-3 opacity-0"
        }`}
      >
        <span className="h-2.5 w-2.5 rounded-full bg-[#049552]" />
        Back online
      </div>

      <main
        className={`bg-[#0f1714] p-4 pb-24 text-white transition-[margin] duration-300 ease-in-out md:pb-4 ${
          isCollapsed ? "md:ml-20" : "md:ml-56"
        }`}
      >
          <Outlet
            context={{
              transactions,
              setTransactions,
              isOnline,
            }}
          />
      </main>
    </div>
  );
}

export default Layout;
