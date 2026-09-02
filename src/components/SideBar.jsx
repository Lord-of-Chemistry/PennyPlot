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

function SideBar({ isCollapsed, setIsCollapsed, isOnline }) {
  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Transactions",
      path: "/transactions",
      icon: ArrowLeftRight,
    },
    {
      name: "Analytics",
      path: "/analytics",
      icon: ChartNoAxesCombined,
    },
    {
      name: "Budgets",
      path: "/budgets",
      icon: Wallet,
    },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`fixed hidden h-screen flex-col overflow-visible rounded-r-xl border-r border-white/10 bg-[#22332b] p-5 text-white transition-[width] duration-300 ease-in-out md:flex ${
          isCollapsed ? "w-20" : "w-56"
        }`}
      >
        <div>
          {/* Collapse Button */}
          <Button
            onClick={() => setIsCollapsed(!isCollapsed)}
            variant="ghost"
            size="icon"
            className={`mb-6 ml-auto rounded-lg text-gray-400 transition-transform duration-300 ease-in-out hover:bg-[#049552]/10 hover:text-[#049552] ${
              isCollapsed ? "rotate-180" : "rotate-0"
            }`}
          >
            <ArrowRightToLine size={20} />
          </Button>

          {/* Navigation */}
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`group relative mb-3 flex items-center rounded-md px-3 py-2 transition-all duration-300 ease-in-out ${
                  isCollapsed ? "justify-center" : "gap-3"
                }`}
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={22}
                      className={`shrink-0 transition-all duration-300 ${
                        isActive ? "text-[#049552]" : "text-gray-400"
                      } ${isCollapsed ? "group-hover:scale-110" : ""}`}
                    />

                    <span
                      className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out ${
                        isCollapsed
                          ? "max-w-0 opacity-0"
                          : "max-w-40 opacity-100"
                      } ${isActive ? "text-[#049552]" : "text-white"}`}
                    >
                      {item.name}
                    </span>

                    {/* Collapsed Tooltip */}
                    {isCollapsed && (
                      <span className="absolute left-full z-20 ml-3 origin-left scale-0 whitespace-nowrap rounded-lg border border-white/10 bg-[#22332b] px-3 py-1.5 text-xs font-medium text-white shadow-lg transition-all duration-300 group-hover:scale-100">
                        {item.name}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Bottom Area */}
        <div className="mt-auto">
          {/* Online / Offline Status */}
          <div
            className={`mb-4 flex items-center rounded-xl border border-white/5 bg-[#0f1714]/40 px-3 py-2.5 transition-all duration-300 ${
              isCollapsed ? "justify-center" : "gap-3"
            }`}
          >
            {/* Status Dot */}
            <span className="relative flex h-2.5 w-2.5 shrink-0 items-center justify-center">
              {isOnline && (
                <span className="absolute h-2.5 w-2.5 animate-ping rounded-full bg-[#049552] opacity-75" />
              )}

              <span
                className={`relative z-10 h-2.5 w-2.5 rounded-full ${
                  isOnline ? "bg-[#049552]" : "bg-red-400"
                }`}
              />
            </span>

            {/* Status Text */}
            <span
              className={`overflow-hidden whitespace-nowrap text-xs font-medium transition-all duration-300 ${
                isCollapsed ? "max-w-0 opacity-0" : "max-w-40 opacity-100"
              } ${isOnline ? "text-[#049552]" : "text-red-400"}`}
            >
              {isOnline ? "Online" : "Offline"}
            </span>

            {/* Collapsed Tooltip */}
            {isCollapsed && (
              <span className="pointer-events-none absolute left-full z-30 ml-3 whitespace-nowrap rounded-lg border border-white/10 bg-[#22332b] px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-all duration-300 group-hover:opacity-100">
                {isOnline ? "Online" : "Offline"}
              </span>
            )}
          </div>

          {/* Settings */}
          <NavLink
            to="/settings"
            className={`group relative mb-3 flex items-center rounded-md px-3 py-2 transition-all duration-300 ease-in-out hover:scale-[1.02] ${
              isCollapsed ? "justify-center" : "gap-3"
            }`}
          >
            {({ isActive }) => (
              <>
                <Settings
                  size={22}
                  className={`shrink-0 transition-all duration-300 ${
                    isActive ? "text-[#049552]" : "text-gray-400"
                  }`}
                />

                <span
                  className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out ${
                    isCollapsed ? "max-w-0 opacity-0" : "max-w-40 opacity-100"
                  } ${isActive ? "text-[#049552]" : "text-gray-400"}`}
                >
                  Settings
                </span>

                {/* Collapsed Tooltip */}
                {isCollapsed && (
                  <span className="absolute left-full z-20 ml-3 origin-left scale-0 whitespace-nowrap rounded-lg border border-white/10 bg-[#22332b] px-3 py-1.5 text-xs font-medium text-white shadow-lg transition-all duration-300 group-hover:scale-100">
                    Settings
                  </span>
                )}
              </>
            )}
          </NavLink>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed inset-x-0 bottom-0 w-full z-50 flex justify-around gap-2 rounded-t-2xl border border-white/10 bg-[#22332b]/90 p-3 shadow-xl backdrop-blur-md md:hidden">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="group relative cursor-pointer px-2"
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

                  <span className="absolute -top-12 left-1/2 z-20 -translate-x-1/2 origin-bottom scale-0 whitespace-nowrap rounded-lg border border-white/10 bg-[#22332b] px-3 py-1.5 text-xs font-medium text-white shadow-lg transition-all duration-300 ease-in-out group-hover:scale-100">
                    {item.name}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}

        {/* Mobile Settings */}
        <NavLink to="/settings" className="group relative cursor-pointer px-2">
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

              <span className="absolute -top-12 left-1/2 z-20 -translate-x-1/2 origin-bottom scale-0 whitespace-nowrap rounded-lg border border-white/10 bg-[#22332b] px-3 py-1.5 text-xs font-medium text-white shadow-lg transition-all duration-300 ease-in-out group-hover:scale-100">
                Settings
              </span>
            </>
          )}
        </NavLink>

        {/* Mobile Connection Indicator */}
        <div className="group relative ml-1 flex items-center justify-center border-l border-white/10 pl-2">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-300 ${
              isOnline ? "text-[#049552]" : "text-red-400"
            }`}
          >
            <span className="relative flex h-2.5 w-2.5 items-center justify-center">
              {isOnline && (
                <span className="absolute h-2.5 w-2.5 animate-ping rounded-full bg-[#049552] opacity-75" />
              )}

              <span
                className={`relative z-10 h-2.5 w-2.5 rounded-full ${
                  isOnline ? "bg-[#049552]" : "bg-red-400"
                }`}
              />
            </span>
          </div>

          {/* Mobile Status Tooltip */}
          <span className="pointer-events-none absolute -top-12 left-1/2 z-30 -translate-x-1/2 scale-0 whitespace-nowrap rounded-lg border border-white/10 bg-[#22332b] px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-all duration-200 group-hover:scale-100 group-hover:opacity-100">
            {isOnline ? "Online" : "Offline"}
          </span>
        </div>
      </nav>
    </>
  );
}

export default SideBar;
