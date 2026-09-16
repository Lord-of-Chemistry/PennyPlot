import { ArrowRight, Check, Wallet, TrendingUp, PieChart } from "lucide-react";
import { Link } from "react-router-dom";

import LandingNavbar from "@/components/landing/LandingNavbar";
import HeroGraph from "@/components/landing/HeroGraph";
import FeatureVisual from "@/components/landing/FeatureVisual";
import ClarityVisual from "@/components/landing/ClarityVisual";

function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <LandingNavbar />

      {/* Hero */}
      <main>
        <section className="relative isolate overflow-hidden px-5 pb-20 pt-36 sm:px-6 sm:pb-24 sm:pt-40 lg:px-8 lg:pb-28 lg:pt-44">
          <HeroGraph />

          <div className="relative z-10 mx-auto max-w-4xl text-center">
            <div className="mx-auto inline-flex items-center rounded-full border border-border/70 bg-card/60 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm">
              Personal finance, made clear.
            </div>

            <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl lg:text-6xl">
              Your money,
              <span className="text-primary"> plotted clearly.</span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              Track spending, set budgets, and see your financial habits clearly
              — without the spreadsheet clutter.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/dashboard"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-transform duration-200 hover:-translate-y-0.5 hover:bg-primary/90"
              >
                Get started
                <ArrowRight
                  size={15}
                  aria-hidden="true"
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </Link>

              <a
                href="#features"
                className="inline-flex items-center justify-center rounded-xl border border-border/70 bg-card/40 px-5 py-3 text-sm font-medium text-secondary-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                Explore PennyPlot
              </a>
            </div>
          </div>

          {/* Product preview */}
          <div className="relative z-10 mx-auto mt-16 max-w-5xl sm:mt-20">
            <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/80 shadow-2xl shadow-black/20 backdrop-blur-xl">
              <div className="border-b border-border/60 px-4 py-3 sm:px-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Overview
                    </p>
                    <p className="mt-1 text-lg font-semibold tracking-tight">
                      ₦245,800
                    </p>
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Wallet size={16} aria-hidden="true" />
                  </div>
                </div>
              </div>

              <div className="grid gap-0 sm:grid-cols-[1.1fr_0.9fr]">
                {/* Chart */}
                <div className="border-b border-border/60 p-5 sm:border-b-0 sm:border-r sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Spending</p>
                      <p className="mt-1 text-sm font-medium">
                        ₦84,250 this month
                      </p>
                    </div>

                    <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-medium text-primary">
                      +12.4%
                    </span>
                  </div>

                  <div className="mt-8 flex h-40 items-end gap-2 sm:gap-3">
                    {[35, 52, 42, 68, 48, 76, 58, 88, 65, 72, 54, 82].map(
                      (height, index) => (
                        <div
                          key={index}
                          className="flex-1 rounded-t-md bg-primary/50 transition-colors hover:bg-primary/80"
                          style={{ height: `${height}%` }}
                        />
                      ),
                    )}
                  </div>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-2 gap-px bg-border/60">
                  <div className="bg-card p-5 sm:p-6">
                    <p className="text-xs text-muted-foreground">Income</p>
                    <p className="mt-2 text-lg font-semibold">₦330,050</p>
                    <div className="mt-3 flex items-center gap-1 text-[10px] text-primary">
                      <TrendingUp size={11} aria-hidden="true" />
                      Monthly total
                    </div>
                  </div>

                  <div className="bg-card p-5 sm:p-6">
                    <p className="text-xs text-muted-foreground">Expenses</p>
                    <p className="mt-2 text-lg font-semibold">₦84,250</p>
                    <div className="mt-3 flex items-center gap-1 text-[10px] text-muted-foreground">
                      <PieChart size={11} aria-hidden="true" />3 categories
                    </div>
                  </div>

                  <div className="col-span-2 bg-card p-5 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Budget progress
                        </p>
                        <p className="mt-1 text-sm font-medium">
                          ₦72,400 remaining
                        </p>
                      </div>

                      <span className="text-xs font-medium text-muted-foreground">
                        68%
                      </span>
                    </div>

                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: "68%" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section
          id="features"
          className="relative border-t border-border/50 px-5 py-24 sm:px-6 sm:py-28 lg:px-8"
        >
          <FeatureVisual />

          <div className="relative z-10 mx-auto max-w-6xl">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                Everything in one place
              </p>

              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                Less tracking.
                <br />
                More understanding.
              </h2>

              <p className="mt-5 text-base leading-7 text-muted-foreground">
                PennyPlot keeps the important parts of your finances close,
                without turning every decision into a spreadsheet.
              </p>
            </div>

            <div className="mt-14 grid gap-4 md:grid-cols-3">
              <FeatureCard
                icon={Wallet}
                title="Track spending"
                description="Keep your income and expenses organized so you always know where your money is going."
              />

              <FeatureCard
                icon={PieChart}
                title="Set budgets"
                description="Give your money boundaries and see how much you've used at a glance."
              />

              <FeatureCard
                icon={TrendingUp}
                title="See insights"
                description="Spot patterns in your spending instead of relying on guesswork."
              />
            </div>
          </div>
        </section>

        {/* Clarity */}
        <section className="border-t border-border/50 px-5 py-24 sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Check size={18} aria-hidden="true" />
            </div>

            <h2 className="mt-6 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
              Know where your money goes.
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-muted-foreground">
              Good financial tracking shouldn't make your finances feel more
              complicated. PennyPlot gives you the information you need, without
              getting in the way.
            </p>

            <ClarityVisual />
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border/50 px-5 py-24 sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
              Start plotting your money.
            </h2>

            <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-muted-foreground">
              Set things up once, then let PennyPlot keep the picture clear.
            </p>

            <Link
              to="/dashboard"
              className="group mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-transform duration-200 hover:-translate-y-0.5 hover:bg-primary/90"
            >
              Open PennyPlot
              <ArrowRight
                size={15}
                aria-hidden="true"
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 px-5 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-xs text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <img src="/favicon.svg" alt="" className="h-5 w-5" />
            <span>
              Penny<span className="text-primary">Plot</span>
            </span>
          </div>

          <p>Personal finance, plotted clearly.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }) {
  return (
    <article className="rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur-sm transition-colors hover:border-border hover:bg-card/80">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon size={16} aria-hidden="true" />
      </div>

      <h3 className="mt-5 text-sm font-semibold text-foreground">{title}</h3>

      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </article>
  );
}

export default LandingPage;
