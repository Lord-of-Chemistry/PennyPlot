import { ArrowDownRight, ArrowUpRight, Wallet } from "lucide-react";

function ClarityVisual() {
  return (
    <div
      aria-hidden="true"
      className="relative mx-auto mt-12 h-52 w-full max-w-md overflow-hidden"
    >
      <div className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.08] blur-[70px]" />

      <div className="absolute left-1/2 top-1/2 w-64 -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border/70 bg-card/90 p-5 shadow-2xl shadow-black/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Wallet size={15} />
            </div>

            <div>
              <p className="text-xs font-medium text-foreground">This month</p>
              <p className="text-[10px] text-muted-foreground">
                Spending overview
              </p>
            </div>
          </div>

          <span className="text-xs font-medium text-primary">+12.4%</span>
        </div>

        <div className="mt-5">
          <p className="text-[10px] text-muted-foreground">Total spent</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
            ₦84,250
          </p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-background/70 px-3 py-2.5">
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <ArrowUpRight size={11} />
              Income
            </div>
            <p className="mt-1 text-xs font-medium text-foreground">₦180,000</p>
          </div>

          <div className="rounded-xl bg-background/70 px-3 py-2.5">
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <ArrowDownRight size={11} />
              Expenses
            </div>
            <p className="mt-1 text-xs font-medium text-foreground">₦84,250</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClarityVisual;
