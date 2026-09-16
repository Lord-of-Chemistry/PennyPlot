import {
  LayoutDashboard,
  ArrowLeftRight,
  ChartNoAxesCombined,
  Wallet,
  ArrowRightToLine,
  Repeat2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavLink } from "react-router-dom";

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
    name: "Recurring",
    path: "/recurring",
    icon: Repeat2,
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

function SideBar({ isCollapsed, setIsCollapsed }) {
  return (
    <>
      {/* ======================================================
          DESKTOP SIDEBAR
      ====================================================== */}

      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-border/50 bg-sidebar/95 text-sidebar-foreground shadow-xl shadow-black/5 backdrop-blur-xl transition-[width] duration-300 ease-out md:flex ${
          isCollapsed ? "w-20" : "w-60"
        }`}
      >
        {/* ====================================================
            BRAND / COLLAPSE
        ==================================================== */}

        <div
          className={`flex h-20 items-center px-4 ${
            isCollapsed ? "justify-center" : "justify-between"
          }`}
        >
          {!isCollapsed && (
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold tracking-tight text-foreground">
                PennyPlot
              </p>

              <p className="text-[11px] text-muted-foreground">
                Personal finance
              </p>
            </div>
          )}

          <Button
            onClick={() => setIsCollapsed((current) => !current)}
            variant="ghost"
            size="icon"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={`shrink-0 rounded-xl text-muted-foreground transition-all duration-300 hover:bg-primary/10 hover:text-primary ${
              isCollapsed ? "rotate-180" : "rotate-0"
            }`}
          >
            <ArrowRightToLine size={19} />
          </Button>
        </div>

        {/* ====================================================
            NAVIGATION
        ==================================================== */}

        <nav aria-label="Main navigation" className="flex-1 px-3 py-3">
          <div className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className="group relative block"
                >
                  {({ isActive }) => (
                    <div
                      className={`relative flex h-11 items-center rounded-xl transition-all duration-200 ${
                        isCollapsed ? "justify-center" : "gap-3 px-3"
                      } ${
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                      }`}
                    >
                      {/* Active indicator */}
                      {isActive && (
                        <span
                          aria-hidden="true"
                          className="absolute left-0 h-5 w-0.5 rounded-full bg-primary"
                        />
                      )}

                      <Icon
                        size={20}
                        aria-hidden="true"
                        className={`shrink-0 transition-transform duration-200 ${
                          isActive ? "text-primary" : "text-muted-foreground"
                        } ${isCollapsed ? "group-hover:scale-110" : ""}`}
                      />

                      <span
                        className={`overflow-hidden whitespace-nowrap text-sm font-medium transition-[max-width,opacity] duration-300 ease-out ${
                          isCollapsed
                            ? "max-w-0 opacity-0"
                            : "max-w-40 opacity-100"
                        }`}
                      >
                        {item.name}
                      </span>

                      {/* Collapsed tooltip */}
                      {isCollapsed && (
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute left-full z-50 ml-3 origin-left scale-95 whitespace-nowrap rounded-lg border border-border/60 bg-popover px-3 py-1.5 text-xs font-medium text-popover-foreground opacity-0 shadow-xl transition-all duration-150 group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100"
                        >
                          {item.name}
                        </span>
                      )}
                    </div>
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>
      </aside>

      {/* ======================================================
          MOBILE FLOATING NAVIGATION
      ====================================================== */}

      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-4 bottom-4 z-50 md:hidden"
      >
        <div className="mx-auto flex max-w-md items-center justify-around rounded-2xl border border-border/60 bg-sidebar/90 px-2 py-2 shadow-2xl shadow-black/20 backdrop-blur-xl">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className="group relative flex flex-1 items-center justify-center"
              >
                {({ isActive }) => (
                  <div
                    className={`relative flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-primary/12 text-primary shadow-sm"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    }`}
                  >
                    <Icon
                      size={20}
                      aria-hidden="true"
                      className="transition-transform duration-200 group-hover:scale-105"
                    />

                    {/* Active dot */}
                    {isActive && (
                      <span
                        aria-hidden="true"
                        className="absolute -bottom-0.5 h-1 w-1 rounded-full bg-primary"
                      />
                    )}

                    {/* Mobile tooltip */}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -top-11 left-1/2 -translate-x-1/2 scale-95 whitespace-nowrap rounded-lg border border-border/60 bg-popover px-2.5 py-1 text-[11px] font-medium text-popover-foreground opacity-0 shadow-lg transition-all duration-150 group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100"
                    >
                      {item.name}
                    </span>
                  </div>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </>
  );
}

export default SideBar;
