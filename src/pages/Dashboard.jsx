import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SideBar from "@/components/SideBar.jsx";
import { useState } from "react";

function Dashboard() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  return (
    <div className="min-h-screen bg-[#0f1714]">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="text-sm text-gray-400 mb-10">
        Here's your financial review.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        <Card className="rounded-xl border border-white/10 hover:bg-[#049552]/10 transition-colors duration-200 ease-in-out">
          <CardHeader>
            <CardTitle>Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-[#049552]">₦125,400</p>
            <p className="text-gray-400 text-xs mt-4">+12% this month</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-white/10 hover:bg-[#049552]/10 transition-colors duration-200 ease-in-out">
          <CardHeader>
            <CardTitle>Income</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-[#049552]">₦85,000</p>
            <p className="text-gray-400 text-xs mt-4">+8% this month</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-white/10 hover:bg-[#049552]/10 transition-colors duration-200 ease-in-out">
          <CardHeader>
            <CardTitle>Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-red-500">₦32,500</p>
            <p className="text-gray-400 text-xs mt-4">-8.2% this month</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-white/10 hover:bg-[#049552]/10 transition-colors duration-200 ease-in-out">
          <CardHeader>
            <CardTitle>Savings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-[#049552]">₦52,500</p>
            <p className="text-gray-400 text-xs mt-4">+15% this month</p>
          </CardContent>
        </Card>
      </div>

      <section className="mt-8 border border-white/10 p-4 rounded-xl">
        <div className="flex justify-between items-center p-4">
          <h2>Recent Transactions</h2>
          <p className="text-[#049552]">View All </p>
        </div>
        <div className="flex justify-between p-4 items-center border-t border-white/10">
          <div>
            <p>Groceries</p>
            <p className="text-gray-400 text-sm">Food and Household</p>
          </div>
          <div>
            <p className="text-red-500">- ₦8,500</p>
            <p>Today</p>
          </div>
        </div>

        <div className="flex justify-between p-4 items-center border-t border-white/10">
          <div>
            <p>Salaries</p>
            <p className="text-gray-400 text-sm">Personal</p>
          </div>
          <div>
            <p className="text-green-500">+ ₦85,000</p>
            <p>Today</p>
          </div>
        </div>

        <div className="flex justify-between p-4 items-center border-t border-white/10">
          <div>
            <p>Transport</p>
            <p className="text-gray-400 text-sm">Outdoor</p>
          </div>
          <div>
            <p className="text-red-500">- ₦3,200</p>
            <p>Yesterday</p>
          </div>
        </div>

        <div className="flex justify-between p-4 items-center border-t border-white/10">
          <div>
            <p>Entertainment</p>
            <p className="text-gray-400 text-sm">Miscellaneous</p>
          </div>
          <div>
            <p className="text-red-500">- ₦5,000</p>
            <p>Aug 28</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
