import {
  LayoutDashboard,
  ArrowLeftRight,
  ChartNoAxesCombined,
  Wallet,
  Settings,
  ArrowRightToLine,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavLink } from "react-router-dom";

function SideBar({ isCollapsed, setIsCollapsed }) {
  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Transactions", path: "/transactions", icon: ArrowLeftRight },
    { name: "Analytics", path: "/analytics", icon: ChartNoAxesCombined },
    { name: "Budgets", path: "/budgets", icon: Wallet },
  ];
  const currentPath = window.location.pathname;

  console.log(currentPath);
  return (
    <aside
      className={`flex ${
        isCollapsed ? "w-20" : "w-64"
      } p-5 border-r border-white/10 bg-[#22332b] text-white rounded-r-xl fixed h-screen overflow-y-auto flex-col transition-[width] duration-300 ease-in-out`}
    >
      <div>
        <Button
          onClick={() => setIsCollapsed(!isCollapsed)}
          variant="ghost"
          size="icon"
          className={`mb-6 ml-auto rounded-lg text-gray-400 hover:bg-[#049552]/10 hover:text-[#049552] transition-transform duration-300 ease-in-out ${
            isCollapsed ? "rotate-180" : "rotate-0"
          }`}
        >
          <ArrowRightToLine size={20} />
        </Button>

        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center mb-3 px-3 py-2 rounded-md transition-all duration-300 ease-in-out ${
                isCollapsed ? "justify-center" : "gap-3"
              }`}
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={20}
                    className={`shrink-0 ${isActive ? "text-[#049552]" : ""}`}
                  />

                  <span
                    className={`whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${
                      isCollapsed ? "max-w-0 opacity-0" : "max-w-40 opacity-100"
                    } ${isActive ? "text-[#049552]" : "text-white"}`}
                  >
                    {item.name}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      <NavLink
        to="/settings"
        className={`mt-auto flex items-center mb-3 px-3 py-2 rounded-md transition-all duration-300 ease-in-out ${
          isCollapsed ? "justify-center" : "gap-3"
        }`}
      >
        {({ isActive }) => (
          <>
            <Settings size={20} className={isActive ? "text-[#049552]" : ""} />

            <span
              className={`whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${
                isCollapsed ? "max-w-0 opacity-0" : "max-w-40 opacity-100"
              } ${isActive ? "text-[#049552]" : "text-white"}`}
            >
              Settings
            </span>
          </>
        )}
      </NavLink>
    </aside>
  );
}

export default SideBar;
