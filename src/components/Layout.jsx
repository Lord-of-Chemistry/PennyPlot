import { Outlet } from "react-router-dom";
import { useState } from "react";
import SideBar from "./SideBar";

function Layout() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#0f1714]">
      <SideBar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      <main
        className={`p-4 bg-[#0f1714] text-white min-h-screen overflow-y-auto transition-[margin] duration-300 ease-in-out ${
          isCollapsed ? "ml-20" : "ml-64"
        }`}
      >
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;