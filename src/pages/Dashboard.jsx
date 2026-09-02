import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AddTransaction from "@/components/AddTransaction";
import { useOutletContext } from "react-router-dom";
import { Wallet, TrendingUp, TrendingDown, PiggyBank } from "lucide-react";

function Dashboard() {
  const { transactions } = useOutletContext();
  const income = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((total, transaction) => total + transaction.amount, 0);
  const expenses = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((total, transaction) => total + transaction.amount, 0);
  const balance = income - expenses;
  const savings = balance > 0 ? balance : 0;
  function formatCurrency(amount) {
    return `₦${amount.toLocaleString("en-NG")}`;
  }
  const cards = [
    {
      title: "Total Balance",
      value: formatCurrency(balance),
      description: "Current available balance",
      icon: Wallet,
      color: "text-[#049552]",
    },
    {
      title: "Income",
      value: formatCurrency(income),
      description: "Total money received",
      icon: TrendingUp,
      color: "text-[#049552]",
    },
    {
      title: "Expenses",
      value: formatCurrency(expenses),
      description: "Total money spent",
      icon: TrendingDown,
      color: "text-red-400",
    },
    {
      title: "Savings",
      value: formatCurrency(savings),
      description: "Current savings",
      icon: PiggyBank,
      color: "text-[#049552]",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0f1714]">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-400">
          Here's your financial overview.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.title}
              className="border-white/10 bg-[#22332b]/60 transition-all duration-200 hover:-translate-y-1 hover:border-[#049552]/30 hover:bg-[#049552]/10"
            >
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-sm font-medium text-gray-400">
                  {card.title}
                </CardTitle>
                <Icon size={20} className={card.color} />
              </CardHeader>
              <CardContent>
                <p className={`text-3xl font-bold ${card.color}`}>
                  {card.value}
                </p>
                <p className="mt-3 text-xs text-gray-500">{card.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <section className="mt-8 rounded-2xl border border-white/10 bg-[#22332b]/40 p-5">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-white">
            Recent Transactions
          </h2>
          <p className="text-sm text-gray-500">
            Your latest financial activity
          </p>
        </div>

        <div className="space-y-3">
          {transactions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 py-10 text-center">
              <p className="text-sm text-gray-400">No transactions yet.</p>
              <p className="mt-1 text-xs text-gray-600">
                Add your first transaction below.
              </p>
            </div>
          ) : (
            transactions.slice(0, 5).map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] p-4 transition hover:bg-white/[0.05]"
              >
                <div>
                  <p className="font-medium text-white">
                    {transaction.description}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    {transaction.category} · {transaction.date}
                  </p>
                </div>

                <span
                  className={
                    transaction.type === "income"
                      ? "font-semibold text-[#049552]"
                      : "font-semibold text-red-400"
                  }
                >
                  {transaction.type === "income" ? "+" : "-"}
                  {formatCurrency(transaction.amount)}
                </span>
              </div>
            ))
          )}
        </div>
      </section>
        <AddTransaction />
    </div>
  );
}

export default Dashboard;
