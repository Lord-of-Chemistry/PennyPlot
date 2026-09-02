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
    <>
      <aside
        className={`hidden md:flex ${
          isCollapsed ? "w-20" : "w-56"
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
                className="group relative px-2 cursor-pointer"
              >
                {({ isActive }) => (
                  <>
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-300 ${
                        isActive
                          ? "bg-[#049552]/15 text-[#049552]"
                          : "text-gray-400 hover:bg-[#049552]/10 hover:text-[#049552]"
                      }`}
                    >
                      <Icon
                        size={20}
                        className="transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>

                    <span className="absolute -top-12 left-1/2 -translate-x-1/2 z-20 origin-bottom scale-0 px-3 py-1.5 rounded-lg border border-white/10 bg-[#22332b] text-xs font-medium text-white shadow-lg transition-all duration-300 ease-in-out group-hover:scale-100 whitespace-nowrap">
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
          className={`group-hover:scale-110 mt-auto flex items-center mb-3 px-3 py-2 rounded-md transition-all duration-300 ease-in-out ${
            isCollapsed ? "justify-center" : "gap-3"
          }`}
        >
          {({ isActive }) => (
            <>
              <Settings
                size={22}
                className={isActive ? "text-[#049552]" : ""}
              />

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
      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex md:hidden gap-2 p-3 rounded-2xl border border-white/10 bg-[#22332b]/90 backdrop-blur-md shadow-xl">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="group relative px-2 cursor-pointer"
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-300 ${
                      isActive
                        ? "bg-[#049552]/15 text-[#049552]"
                        : "text-gray-400 hover:bg-[#049552]/10 hover:text-[#049552]"
                    }`}
                  >
                    <Icon
                      size={20}
                      className="transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>

                  <span className="absolute -top-12 left-1/2 -translate-x-1/2 z-20 origin-bottom scale-0 px-3 py-1.5 rounded-lg border border-white/10 bg-[#22332b] text-xs font-medium text-white shadow-lg transition-all duration-300 ease-in-out group-hover:scale-100 whitespace-nowrap">
                    {item.name}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}

        <NavLink to="/settings" className="group relative px-2 cursor-pointer">
          {({ isActive }) => (
            <>
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-300 ${
                  isActive
                    ? "bg-[#049552]/15 text-[#049552]"
                    : "text-gray-400 hover:bg-[#049552]/10 hover:text-[#049552]"
                }`}
              >
                <Settings
                  size={20}
                  className="transition-transform duration-300 group-hover:scale-110"
                />
              </div>

              <span className="absolute -top-12 left-1/2 -translate-x-1/2 z-20 origin-bottom scale-0 px-3 py-1.5 rounded-lg border border-white/10 bg-[#22332b] text-xs font-medium text-white shadow-lg transition-all duration-300 ease-in-out group-hover:scale-100 whitespace-nowrap">
                Settings
              </span>
            </>
          )}
        </NavLink>
      </nav>
    </>
  );
}

export default SideBar;
