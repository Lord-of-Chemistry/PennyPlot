import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

function LandingNavbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto max-w-6xl px-5 pt-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between rounded-xl border border-border/60 bg-background/85 px-4 shadow-lg shadow-black/10 backdrop-blur-xl sm:px-5">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src="/favicon.svg" alt="PennyPlot" className="h-7 w-7" />

            <span className="text-[15px] font-bold tracking-[-0.02em] text-foreground">
              Penny<span className="text-primary">Plot</span>
            </span>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-1.5">
            <Link
              to="/dashboard"
              className="hidden rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:block"
            >
              Sign in
            </Link>

            <Link
              to="/dashboard"
              className="group flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:text-sm"
            >
              Get started
              <ArrowRight
                size={14}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

export default LandingNavbar;
