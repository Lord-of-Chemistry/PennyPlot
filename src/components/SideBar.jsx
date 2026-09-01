import { LayoutDashboard } from "lucide-react";

function SideBar() {
  return (
    <aside className="hidden md:block w-64 min-h-screen p-5 border border-r border-white/10 bg-[#22332b] text-white rounded-r-xl fixed h-screen overflow-y-auto">
      <div className="flex items-center gap-3 mb-3 px-3 py-2 rounded-md bg-[#049552]/10 text-[#049552]">
        <LayoutDashboard size={20} />
        <p>Dashboard</p>
      </div>
      <p className="mb-3 hover:text-[#049552] ease-in-out duration-200 transition-colors">
        Transactions
      </p>
      <p className="mb-3 hover:text-[#049552] ease-in-out duration-200 transition-colors">
        Analytics
      </p>
      <p className="mb-20 hover:text-[#049552] ease-in-out duration-200 transition-colors">
        Budgets
      </p>
      <p>Settings</p>
    </aside>
  );
}

export default SideBar;
