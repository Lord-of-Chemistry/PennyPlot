import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Check,
  CreditCard,
  Wallet,
} from "lucide-react";
import { Link } from "react-router-dom";

import LandingNavbar from "../components/landing/LandingNavbar";
import HeroGraph from "../components/landing/HeroGraph";
import FeatureVisual from "../components/landing/FeatureVisual";
import ClarityVisual from "../components/landing/ClarityVisual";

function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-background text-foreground">
      <LandingNavbar />

      <main>
        {/* ================= HERO ================= */}
        <section className="relative px-5 pb-20 pt-32 sm:px-6 sm:pb-28 sm:pt-40 lg:px-8 lg:pt-44">
          <HeroGraph />

          {/* Background glow */}
          <div className="pointer-events-none absolute left-1/2 top-20 z-0 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />

          <div className="relative z-10 mx-auto max-w-4xl text-center">
            {/* Small label */}
            <div className="mx-auto mb-6 flex w-fit items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />A simpler
              way to manage your money
            </div>

            {/* Heading */}
            <h1 className="text-balance text-4xl font-semibold tracking-[-0.045em] sm:text-5xl md:text-6xl lg:text-7xl">
              Your money,
              <br />
              <span className="text-primary">plotted clearly.</span>
            </h1>

            {/* Description */}
            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
              Track your spending, manage budgets, and understand where your
              money goes, all in one simple place.
            </p>

            {/* Buttons */}
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/dashboard"
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/10 transition-all hover:bg-primary/90 sm:w-auto"
              >
                Get started
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </Link>

              <a
                href="#features"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card/40 px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent sm:w-auto"
              >
                Explore PennyPlot
              </a>
            </div>
          </div>

          {/* ================= PRODUCT PREVIEW ================= */}
          <div className="relative z-10 mx-auto mt-16 max-w-4xl sm:mt-20">
            <div className="relative mx-auto max-w-3xl">
              {/* Main balance card */}
              <div className="relative z-20 rounded-2xl border border-border bg-card p-5 shadow-2xl shadow-black/30 sm:p-7">
                {/* Card header */}
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Total balance
                    </p>

                    <p className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                      ₦284,500
                    </p>
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <Wallet size={17} className="text-primary" />
                  </div>
                </div>

                {/* Mini stats */}
                <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <PreviewStat
                    label="Income"
                    value="₦420,000"
                    icon={<ArrowUpRight size={14} />}
                  />

                  <PreviewStat
                    label="Expenses"
                    value="₦135,500"
                    icon={<CreditCard size={14} />}
                  />

                  <PreviewStat
                    label="This month"
                    value="+12.4%"
                    icon={<BarChart3 size={14} />}
                    className="col-span-2 sm:col-span-1"
                  />
                </div>

                {/* Chart */}
                <div className="mt-4 rounded-xl border border-border/70 bg-background/60 p-4 sm:p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-muted-foreground">
                        Spending overview
                      </p>

                      <p className="mt-1 text-sm font-medium">This month</p>
                    </div>

                    <span className="rounded-md bg-primary/10 px-2 py-1 text-[10px] font-medium text-primary">
                      Overview
                    </span>
                  </div>

                  <div className="mt-7 flex h-28 items-end gap-1.5 sm:h-36 sm:gap-2">
                    {[35, 52, 42, 68, 48, 76, 57, 84, 62, 72, 54, 88].map(
                      (height, index) => (
                        <div
                          key={index}
                          className="flex-1 rounded-t-sm bg-primary/60 transition-all duration-300 hover:bg-primary"
                          style={{ height: `${height}%` }}
                        />
                      ),
                    )}
                  </div>
                </div>
              </div>

              {/* Floating card */}
              <div className="absolute -bottom-8 -right-3 z-30 hidden w-48 rounded-xl border border-border bg-card p-4 shadow-xl shadow-black/30 sm:block lg:-right-10">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-muted-foreground">
                    Monthly budget
                  </p>

                  <Check size={14} className="text-primary" />
                </div>

                <p className="mt-2 text-sm font-semibold">₦72,400 left</p>

                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full w-[68%] rounded-full bg-primary" />
                </div>

                <p className="mt-2 text-[9px] text-muted-foreground">
                  68% of your budget used
                </p>
              </div>

              {/* Glow */}
              <div className="pointer-events-none absolute -bottom-20 left-1/2 -z-10 h-40 w-3/4 -translate-x-1/2 rounded-full bg-primary/10 blur-[100px]" />
            </div>
          </div>
        </section>

        {/* ================= FEATURES ================= */}
        <section
          id="features"
          className="relative overflow-hidden border-y border-border/60 bg-card/20 px-5 py-20 sm:px-6 sm:py-24 lg:px-8"
        >
          <FeatureVisual />

          <div className="relative z-10 mx-auto max-w-5xl">
            <div className="max-w-xl">
              <p className="text-xs font-medium uppercase tracking-widest text-primary">
                Everything in one place
              </p>

              <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                Financial clarity without the clutter.
              </h2>

              <p className="mt-4 text-sm leading-6 text-muted-foreground sm:text-base">
                PennyPlot gives you the tools you need to keep track of your
                money without making your finances feel complicated.
              </p>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon={<CreditCard size={18} />}
                title="Track spending"
                description="Keep your income and expenses organized in one clear timeline."
              />

              <FeatureCard
                icon={<Wallet size={18} />}
                title="Set budgets"
                description="Create spending limits and know when you're getting close."
              />

              <FeatureCard
                icon={<BarChart3 size={18} />}
                title="See insights"
                description="Turn your transactions into useful spending patterns and trends."
              />
            </div>
          </div>
        </section>

        {/* ================= SIMPLE STATEMENT ================= */}
        <section className="relative overflow-hidden px-5 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.05] blur-[120px]" />

          <div className="relative z-10 mx-auto max-w-3xl text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Check size={18} className="text-primary" />
            </div>

            <h2 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
              Know where your money goes.
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
              No complicated spreadsheets. No clutter. Just a clearer picture of
              your finances and the information you need to make better
              decisions.
            </p>

            <ClarityVisual />

            <Link
              to="/dashboard"
              className="group mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80"
            >
              Open PennyPlot
              <ArrowRight
                size={15}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>
        </section>

        {/* ================= CTA ================= */}
        <section className="px-5 pb-20 sm:px-6 sm:pb-24 lg:px-8">
          <div className="relative mx-auto max-w-5xl overflow-hidden rounded-2xl border border-primary/20 bg-primary/[0.04] px-6 py-14 text-center sm:px-10 sm:py-16">
            {/* CTA visual texture */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.06] blur-[90px]" />

            <div className="relative z-10">
              <p className="text-xs font-medium uppercase tracking-widest text-primary">
                Start today
              </p>

              <h2 className="mx-auto mt-3 max-w-lg text-2xl font-semibold tracking-tight sm:text-3xl">
                A clearer way to manage your money.
              </h2>

              <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-muted-foreground">
                Start tracking your finances with PennyPlot.
              </p>

              <Link
                to="/dashboard"
                className="group mt-7 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
              >
                Get started
                <ArrowRight
                  size={15}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-border/60 px-5 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
          <Link to="/" className="text-sm font-bold tracking-tight">
            Penny<span className="text-primary">Plot</span>
          </Link>

          <p className="text-xs text-muted-foreground">
            Simple tools for better money management.
          </p>

          <p className="text-xs text-muted-foreground/60">
            © {new Date().getFullYear()} PennyPlot
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ================= PREVIEW STAT ================= */

function PreviewStat({ label, value, icon, className = "" }) {
  return (
    <div
      className={`rounded-xl border border-border/70 bg-background/50 p-3 ${className}`}
    >
      <div className="flex items-center justify-between">
        <p className="text-[9px] text-muted-foreground">{label}</p>

        <span className="text-primary">{icon}</span>
      </div>

      <p className="mt-2 text-sm font-semibold">{value}</p>
    </div>
  );
}

/* ================= FEATURE CARD ================= */

function FeatureCard({ icon, title, description }) {
  return (
    <div className="group rounded-xl border border-border bg-card/70 p-5 backdrop-blur-sm transition-all duration-200 hover:border-primary/30 hover:bg-card">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
        {icon}
      </div>

      <h3 className="mt-5 text-sm font-semibold">{title}</h3>

      <p className="mt-2 text-xs leading-5 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

export default LandingPage;
