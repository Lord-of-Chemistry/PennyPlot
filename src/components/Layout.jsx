import { useState } from "react";
import { Outlet } from "react-router-dom";
import SideBar from "./SideBar";

function Layout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [transactions, setTransactions] = useState([]);

  return (
    <div className="min-h-screen bg-[#0f1714]">
      <SideBar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      <main
        className={`p-4 pb-24 md:pb-4 bg-[#0f1714] text-white min-h-screen overflow-y-auto transition-[margin] duration-300 ease-in-out ${
          isCollapsed ? "md:ml-20" : "md:ml-56"
        }`}
      >
        <Outlet
          context={{
            transactions,
            setTransactions,
          }}
        />
      </main>
    </div>
  );
}

export default Layout;