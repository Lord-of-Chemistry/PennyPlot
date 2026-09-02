import {
  LayoutDashboard,
  ArrowLeftRight,
  ChartNoAxesCombined,
  Wallet,
  Settings,
  ArrowRightToLine,
} from "lucide-react";
import { Button } from "@/components/ui/button";

function SideBar({ isCollapsed, setIsCollapsed }) {
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

        <a
          href="/dashboard"
          className={`flex items-center mb-3 px-3 py-2 rounded-md bg-[#049552]/10 text-[#049552] transition-all duration-300 ease-in-out ${
            isCollapsed ? "justify-center" : "gap-3"
          }`}
        >
          <LayoutDashboard size={20} className="shrink-0" />
          <span
            className={`whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${
              isCollapsed
                ? "max-w-0 opacity-0"
                : "max-w-40 opacity-100"
            }`}
          >
            Dashboard
          </span>
        </a>

        <a
          href="/transactions"
          className={`flex items-center mb-3 px-3 py-2 hover:text-[#049552] transition-all duration-300 ease-in-out ${
            isCollapsed ? "justify-center" : "gap-3"
          }`}
        >
          <ArrowLeftRight size={20} className="shrink-0" />
          <span
            className={`whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${
              isCollapsed
                ? "max-w-0 opacity-0"
                : "max-w-40 opacity-100"
            }`}
          >
            Transactions
          </span>
        </a>

        <a
          href="/analytics"
          className={`flex items-center mb-3 px-3 py-2 hover:text-[#049552] transition-all duration-300 ease-in-out ${
            isCollapsed ? "justify-center" : "gap-3"
          }`}
        >
          <ChartNoAxesCombined size={20} className="shrink-0" />
          <span
            className={`whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${
              isCollapsed
                ? "max-w-0 opacity-0"
                : "max-w-40 opacity-100"
            }`}
          >
            Analytics
          </span>
        </a>

        <a
          href="/budgets"
          className={`flex items-center mb-3 px-3 py-2 hover:text-[#049552] transition-all duration-300 ease-in-out ${
            isCollapsed ? "justify-center" : "gap-3"
          }`}
        >
          <Wallet size={20} className="shrink-0" />
          <span
            className={`whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${
              isCollapsed
                ? "max-w-0 opacity-0"
                : "max-w-40 opacity-100"
            }`}
          >
            Budgets
          </span>
        </a>
      </div>

      <a
        href="/settings"
        className={`mt-auto flex items-center mb-3 px-3 py-2 rounded-md bg-white/10 text-white transition-all duration-300 ease-in-out ${
          isCollapsed ? "justify-center" : "gap-3"
        }`}
      >
        <Settings size={20} className="shrink-0" />
        <span
          className={`whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${
            isCollapsed
              ? "max-w-0 opacity-0"
              : "max-w-40 opacity-100"
          }`}
        >
          Settings
        </span>
      </a>
    </aside>
  );
}

export default SideBar;