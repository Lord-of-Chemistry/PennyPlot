import {
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  LineChart,
  WalletCards,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const slides = [
  {
    eyebrow: "SEE",
    title: "Know where your money is going.",
    description:
      "See your income, spending, and balance without digging through numbers.",
    visual: "overview",
  },
  {
    eyebrow: "TRACK",
    title: "Tracking shouldn't feel like bookkeeping.",
    description:
      "Add what you spend in seconds and get back to your life.",
    visual: "transactions",
  },
  {
    eyebrow: "UNDERSTAND",
    title: "Find the pattern.",
    description:
      "Turn everyday transactions into a clearer picture of your spending.",
    visual: "insights",
  },
];

const TRANSITION_DURATION = 720;

function FirstLaunch() {
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [paintKey, setPaintKey] = useState(0);

  const touchStartX = useRef(null);
  const transitionTimeout = useRef(null);

  const isFinalStep = step === slides.length;
  const currentSlide = slides[step];

  const completeOnboarding = useCallback(() => {
    localStorage.setItem("pennyplot-onboarding-complete", "true");
    navigate("/dashboard");
  }, [navigate]);

  const transitionTo = useCallback(
    (nextStep, nextDirection) => {
      if (
        isTransitioning ||
        nextStep < 0 ||
        nextStep > slides.length ||
        nextStep === step
      ) {
        return;
      }

      setDirection(nextDirection);
      setIsTransitioning(true);
      setPaintKey((current) => current + 1);

      if (transitionTimeout.current) {
        clearTimeout(transitionTimeout.current);
      }

      transitionTimeout.current = setTimeout(() => {
        setStep(nextStep);
        setIsTransitioning(false);
      }, TRANSITION_DURATION / 2);
    },
    [isTransitioning, step],
  );

  const goNext = useCallback(() => {
    if (isTransitioning) return;

    if (isFinalStep) {
      completeOnboarding();
      return;
    }

    transitionTo(step + 1, 1);
  }, [
    completeOnboarding,
    isFinalStep,
    isTransitioning,
    step,
    transitionTo,
  ]);

  const goPrevious = useCallback(() => {
    if (isTransitioning || step === 0) return;

    transitionTo(step - 1, -1);
  }, [isTransitioning, step, transitionTo]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "ArrowRight") {
        goNext();
      }

      if (event.key === "ArrowLeft") {
        goPrevious();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);

      if (transitionTimeout.current) {
        clearTimeout(transitionTimeout.current);
      }
    };
  }, [goNext, goPrevious]);

  function handlePointerDown(event) {
    if (event.pointerType !== "touch") return;

    touchStartX.current = event.clientX;
  }

  function handlePointerUp(event) {
    if (event.pointerType !== "touch" || touchStartX.current === null) {
      return;
    }

    const distance = event.clientX - touchStartX.current;

    touchStartX.current = null;

    if (Math.abs(distance) < 55 || isTransitioning) return;

    if (distance < 0) {
      goNext();
    } else {
      goPrevious();
    }
  }

  function handlePointerCancel() {
    touchStartX.current = null;
  }

  return (
    <main
      className="relative h-[100svh] overflow-hidden bg-background text-foreground select-none"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
    >
      {/* Ambient background */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute left-1/2 top-[-18rem] h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-primary/[0.055] blur-[130px]" />

        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="relative z-10 mx-auto flex h-full w-full max-w-6xl flex-col px-5 py-5 sm:px-8 sm:py-7">
        <header className="flex shrink-0 items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
            aria-label="PennyPlot home"
          >
            <img src="/favicon.svg" alt="" className="h-8 w-8" />

            <span className="text-[15px] font-bold tracking-tight">
              Penny<span className="text-primary">Plot</span>
            </span>
          </button>

          {!isFinalStep && (
            <button
              type="button"
              onClick={completeOnboarding}
              className="rounded-lg px-2.5 py-2 text-xs font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground sm:px-3 sm:text-sm"
            >
              Skip
            </button>
          )}
        </header>

        <div className="min-h-0 flex-1">
          {isFinalStep ? (
            <FinalStep
              key="final"
              onContinue={completeOnboarding}
              direction={direction}
            />
          ) : (
            <Slide
              key={step}
              slide={currentSlide}
              direction={direction}
            />
          )}
        </div>

        <footer className="relative z-20 flex shrink-0 items-center justify-between">
          <div className="flex items-center gap-1.5">
            {slides.map((slide, index) => (
              <span
                key={slide.eyebrow}
                className={`h-1.5 rounded-full transition-all duration-500 ease-out ${
                  index === step
                    ? "w-7 bg-primary"
                    : "w-1.5 bg-muted-foreground/25"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                type="button"
                onClick={goPrevious}
                disabled={isTransitioning}
                aria-label="Previous"
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-border/60 bg-card/50 text-muted-foreground backdrop-blur-sm transition-all duration-200 hover:bg-accent hover:text-foreground active:scale-95 disabled:pointer-events-none sm:h-12 sm:w-12"
              >
                <ArrowLeft size={16} />
              </button>
            )}

            <button
              type="button"
              onClick={goNext}
              disabled={isTransitioning}
              aria-label={isFinalStep ? "Continue to PennyPlot" : "Next"}
              className="group flex h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/10 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-primary/90 active:translate-y-0 active:scale-[0.98] disabled:pointer-events-none sm:h-12 sm:px-5"
            >
              {isFinalStep ? "Continue" : "Next"}

              <ArrowRight
                size={16}
                className="transition-transform duration-300 ease-out group-hover:translate-x-1"
              />
            </button>
          </div>
        </footer>
      </div>

      {isTransitioning && (
        <div
          key={paintKey}
          aria-hidden="true"
          className={`pennyplot-paint-transition ${
            direction > 0
              ? "pennyplot-paint-forward"
              : "pennyplot-paint-backward"
          }`}
        >
          <div className="pennyplot-paint-layer pennyplot-paint-main" />
          <div className="pennyplot-paint-layer pennyplot-paint-secondary" />
          <div className="pennyplot-paint-layer pennyplot-paint-edge" />
        </div>
      )}
    </main>
  );
}

function Slide({ slide, direction }) {
  return (
    <section
      className={`flex h-full w-full items-center justify-center ${
        direction > 0
          ? "pennyplot-slide-forward"
          : "pennyplot-slide-backward"
      }`}
    >
      <div className="flex w-full flex-col items-center gap-7 sm:gap-10 md:grid md:grid-cols-[1.05fr_0.95fr] md:gap-12 lg:gap-20">
        <div className="order-1 flex w-full justify-center md:order-2">
          <div className="pennyplot-visual-in">
            <OnboardingVisual type={slide.visual} />
          </div>
        </div>

        <div className="order-2 w-full text-center md:order-1 md:text-left">
          <p className="pennyplot-copy-eyebrow text-[10px] font-semibold tracking-[0.24em] text-primary sm:text-xs">
            {slide.eyebrow}
          </p>

          <h1 className="pennyplot-copy-title mt-3 max-w-lg text-[clamp(2rem,7vw,4.5rem)] font-semibold leading-[0.98] tracking-[-0.055em]">
            {slide.title}
          </h1>

          <p className="pennyplot-copy-description mx-auto mt-4 max-w-md text-xs leading-5 text-muted-foreground sm:text-sm sm:leading-6 md:mx-0 md:text-base">
            {slide.description}
          </p>
        </div>
      </div>
    </section>
  );
}

function OnboardingVisual({ type }) {
  if (type === "overview") {
    return <OverviewVisual />;
  }

  if (type === "transactions") {
    return <TransactionsVisual />;
  }

  return <InsightsVisual />;
}

function FinalStep({ onContinue, direction }) {
  return (
    <section
      className={`flex h-full items-center justify-center text-center ${
        direction > 0
          ? "pennyplot-slide-forward"
          : "pennyplot-slide-backward"
      }`}
    >
      <div className="w-full max-w-md">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary pennyplot-final-icon">
          <Check size={24} />
        </div>

        <p className="mt-6 text-[10px] font-semibold tracking-[0.24em] text-primary sm:text-xs">
          WELCOME TO PENNYPLOT
        </p>

        <h1 className="mt-3 text-4xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-5xl">
          Your money.
          <br />
          Your picture.
        </h1>

        <p className="mx-auto mt-5 max-w-sm text-xs leading-5 text-muted-foreground sm:text-sm sm:leading-6">
          A clearer way to keep track of your money and understand where it
          goes.
        </p>

        <button
          type="button"
          onClick={onContinue}
          className="mx-auto mt-8 flex h-12 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/10 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-primary/90 active:translate-y-0 active:scale-[0.98]"
        >
          Continue without an account
          <ArrowRight size={16} />
        </button>
      </div>
    </section>
  );
}

export default FirstLaunch;
