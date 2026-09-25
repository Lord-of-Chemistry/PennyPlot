import { useEffect, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

const scenes = ["intro", "movement", "organize", "pattern", "clarity"];

function FirstLaunch() {
  const navigate = useNavigate();
  const [sceneIndex, setSceneIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  const scene = scenes[sceneIndex];
  const isFirstScene = sceneIndex === 0;
  const isLastScene = sceneIndex === scenes.length - 1;

  function nextScene() {
    if (transitioning) return;

    if (isLastScene) {
      enterApp();
      return;
    }

    setTransitioning(true);

    window.setTimeout(() => {
      setSceneIndex((current) => current + 1);
      setTransitioning(false);
    }, 320);
  }

  function enterApp() {
    localStorage.setItem("pennyplot-first-launch-complete", "true");
    navigate("/dashboard", { replace: true });
  }

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key !== "Enter" && event.key !== "ArrowRight") {
        return;
      }

      if (document.activeElement?.tagName === "BUTTON") {
        return;
      }

      nextScene();
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [sceneIndex, transitioning]);

  return (
    <main className="relative h-svh overflow-hidden bg-background text-foreground">
      <AmbientBackground sceneIndex={sceneIndex} />

      <div
        className={`relative z-10 h-full transition-all duration-300 ease-out ${
          transitioning
            ? "translate-y-2 scale-[0.985] opacity-0"
            : "translate-y-0 scale-100 opacity-100"
        }`}
      >
        {scene === "intro" && <IntroScene onContinue={nextScene} />}
        {scene === "movement" && <MovementScene onContinue={nextScene} />}
        {scene === "organize" && <OrganizeScene onContinue={nextScene} />}
        {scene === "pattern" && <PatternScene onContinue={nextScene} />}
        {scene === "clarity" && <ClarityScene onEnter={enterApp} />}
      </div>

      {!isFirstScene && (
        <div className="absolute bottom-7 left-1/2 z-30 -translate-x-1/2">
          <SceneProgress sceneIndex={sceneIndex} />
        </div>
      )}

      <style>{`
        @keyframes fade-up {
          from {
            transform: translateY(18px);
            opacity: 0;
          }

          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes logo-in {
          0% {
            transform: scale(0.45);
            opacity: 0;
            filter: blur(12px);
          }

          65% {
            transform: scale(1.08);
            opacity: 1;
            filter: blur(0);
          }

          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes ring-out {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }

          35% {
            opacity: 0.8;
          }

          100% {
            transform: scale(1.8);
            opacity: 0;
          }
        }

        @keyframes breathe {
          0%, 100% {
            transform: scale(0.94);
          }

          50% {
            transform: scale(1.06);
          }
        }

        @keyframes float-in {
          from {
            transform: translateY(24px) scale(0.92);
            opacity: 0;
          }

          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes grow-x {
          from {
            transform: scaleX(0);
          }

          to {
            transform: scaleX(1);
          }
        }

        @keyframes grow-y {
          from {
            transform: scaleY(0);
          }

          to {
            transform: scaleY(1);
          }
        }

        @keyframes ring {
          0% {
            transform: scale(0.7);
            opacity: 0;
          }

          35% {
            opacity: 0.65;
          }

          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }

        @keyframes reveal {
          from {
            transform: scale(0.75);
            opacity: 0;
            filter: blur(8px);
          }

          to {
            transform: scale(1);
            opacity: 1;
            filter: blur(0);
          }
        }

        @keyframes draw-check {
          from {
            stroke-dashoffset: 100;
          }

          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </main>
  );
}

function AmbientBackground({ sceneIndex }) {
  const scales = [
    "scale-50 opacity-40",
    "scale-90 opacity-60",
    "scale-110 opacity-75",
    "scale-125 opacity-90",
    "scale-150 opacity-60",
  ];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className={`absolute left-1/2 top-1/2 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.05] blur-[110px] transition-all duration-[1800ms] ${scales[sceneIndex]}`}
      />

      <div className="absolute inset-0 opacity-[0.018] [background-image:radial-gradient(circle_at_center,hsl(var(--foreground))_1px,transparent_1px)] [background-size:28px_28px]" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_15%,hsl(var(--background)/0.85)_100%)]" />
    </div>
  );
}

function IntroScene({ onContinue }) {
  return (
    <section className="flex h-full flex-col items-center justify-center px-6 text-center">
      <div className="relative flex h-24 w-24 items-center justify-center">
        <div className="absolute h-20 w-20 rounded-[1.75rem] border border-primary/20 animate-[ring-out_2s_ease-out_infinite]" />

        <div className="absolute h-16 w-16 rounded-[1.4rem] border border-primary/10 animate-[ring-out_2s_ease-out_700ms_infinite]" />

        <div className="relative flex h-14 w-14 animate-[logo-in_1.2s_cubic-bezier(0.22,1,0.36,1)_both] items-center justify-center rounded-[1.1rem] bg-primary text-lg font-bold text-primary-foreground shadow-2xl shadow-primary/25">
          P
        </div>
      </div>

      <p className="mt-8 animate-[fade-up_800ms_500ms_both] text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
        Welcome to PennyPlot
      </p>

      <h1 className="mt-4 max-w-xl animate-[fade-up_800ms_700ms_both] text-4xl font-semibold tracking-[-0.055em] sm:text-6xl">
        Money, without
        <br />
        the <span className="text-primary">noise.</span>
      </h1>

      <p className="mt-5 max-w-sm animate-[fade-up_800ms_900ms_both] text-sm leading-6 text-muted-foreground">
        Let's see what happens when your money starts making sense.
      </p>

      <ContinueButton onClick={onContinue} label="Let's see it" />
    </section>
  );
}

function MovementScene({ onContinue }) {
  const transactions = [
    {
      label: "Lunch",
      amount: "− ₦2,500",
      x: "15%",
      y: "17%",
      delay: "100ms",
    },
    {
      label: "Freelance",
      amount: "+ ₦35,000",
      x: "72%",
      y: "24%",
      positive: true,
      delay: "400ms",
    },
    {
      label: "Transport",
      amount: "− ₦1,500",
      x: "23%",
      y: "70%",
      delay: "700ms",
    },
    {
      label: "Data",
      amount: "− ₦3,000",
      x: "69%",
      y: "72%",
      delay: "1000ms",
    },
  ];

  return (
    <section className="flex h-full flex-col items-center justify-center px-6">
      <div className="w-full max-w-4xl">
        <div className="text-center">
          <p className="animate-[fade-up_700ms_both] text-[10px] font-bold uppercase tracking-[0.28em] text-primary">
            First, it moves
          </p>

          <h2 className="mt-4 animate-[fade-up_700ms_150ms_both] text-3xl font-semibold tracking-[-0.05em] sm:text-5xl">
            Money is always moving.
          </h2>
        </div>

        <div className="relative mx-auto mt-8 h-72 max-w-3xl sm:mt-10 sm:h-80">
          <div className="absolute left-1/2 top-1/2 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-primary/15 animate-[ring_2.8s_ease-out_infinite]" />

            <div className="h-20 w-20 rounded-full bg-primary/[0.07] shadow-[0_0_80px_hsl(var(--primary)/0.15)] animate-[breathe_3s_ease-in-out_infinite]" />

            <div className="absolute h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_30px_hsl(var(--primary)/0.9)]" />
          </div>

          {transactions.map((transaction) => (
            <div
              key={transaction.label}
              className="absolute animate-[float-in_800ms_cubic-bezier(0.22,1,0.36,1)_both]"
              style={{
                left: transaction.x,
                top: transaction.y,
                animationDelay: transaction.delay,
              }}
            >
              <div
                className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card/80 px-4 py-3 shadow-xl shadow-black/5 backdrop-blur-md"
                style={{
                  animation: "float 4s ease-in-out infinite",
                }}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    transaction.positive
                      ? "bg-primary"
                      : "bg-muted-foreground/40"
                  }`}
                />

                <div>
                  <p className="text-xs font-medium">{transaction.label}</p>

                  <p
                    className={`mt-0.5 text-[11px] font-semibold ${
                      transaction.positive
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    {transaction.amount}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <ContinueButton onClick={onContinue} label="Keep going" />
      </div>
    </section>
  );
}

function OrganizeScene({ onContinue }) {
  const categories = [
    ["Food", 78],
    ["Bills", 57],
    ["Transport", 43],
    ["Shopping", 31],
  ];

  return (
    <section className="flex h-full flex-col items-center justify-center px-6">
      <div className="w-full max-w-2xl">
        <div className="text-center">
          <p className="animate-[fade-up_700ms_both] text-[10px] font-bold uppercase tracking-[0.28em] text-primary">
            Then, it settles
          </p>

          <h2 className="mt-4 animate-[fade-up_700ms_150ms_both] text-3xl font-semibold tracking-[-0.05em] sm:text-5xl">
            Everything finds its place.
          </h2>
        </div>

        <div className="mt-12 space-y-5">
          {categories.map(([name, width], index) => (
            <div
              key={name}
              className="animate-[fade-up_700ms_cubic-bezier(0.22,1,0.36,1)_both]"
              style={{
                animationDelay: `${300 + index * 130}ms`,
              }}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium">{name}</span>
                <span className="text-[11px] text-muted-foreground">
                  {width}%
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full origin-left rounded-full bg-primary"
                  style={{
                    width: `${width}%`,
                    animation: `grow-x 1000ms cubic-bezier(0.22,1,0.36,1) ${
                      500 + index * 140
                    }ms both`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <ContinueButton onClick={onContinue} label="See what emerges" />
      </div>
    </section>
  );
}

function PatternScene({ onContinue }) {
  const values = [32, 45, 38, 57, 49, 73, 61, 88, 67, 94];

  return (
    <section className="flex h-full flex-col items-center justify-center px-6">
      <div className="w-full max-w-3xl text-center">
        <p className="animate-[fade-up_700ms_both] text-[10px] font-bold uppercase tracking-[0.28em] text-primary">
          And then
        </p>

        <h2 className="mt-4 animate-[fade-up_700ms_150ms_both] text-3xl font-semibold tracking-[-0.05em] sm:text-5xl">
          Patterns appear.
        </h2>

        <div className="relative mt-12 h-60 sm:mt-14 sm:h-64">
          <div className="absolute inset-x-0 bottom-0 h-px bg-border" />

          <div className="flex h-full items-end gap-2 px-2 sm:gap-4 sm:px-8">
            {values.map((value, index) => (
              <div key={index} className="flex h-full flex-1 items-end">
                <div
                  className={`w-full origin-bottom rounded-t-md ${
                    index === 7
                      ? "bg-primary shadow-[0_0_30px_hsl(var(--primary)/0.25)]"
                      : "bg-primary/20"
                  }`}
                  style={{
                    height: `${value}%`,
                    animation: `grow-y 850ms cubic-bezier(0.22,1,0.36,1) ${
                      180 + index * 70
                    }ms both`,
                  }}
                />
              </div>
            ))}
          </div>

          <div className="absolute right-[17%] top-[3%] animate-[fade-up_600ms_1050ms_both]">
            <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.08] px-3 py-1.5 text-[10px] font-medium text-primary backdrop-blur-md">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              Your rhythm
            </div>
          </div>
        </div>

        <ContinueButton onClick={onContinue} label="One last thing" />
      </div>
    </section>
  );
}

function ClarityScene({ onEnter }) {
  return (
    <section className="flex h-full flex-col items-center justify-center px-6 text-center">
      <div className="relative flex h-28 w-28 items-center justify-center">
        <div className="absolute inset-0 rounded-full border border-primary/20 animate-[ring_2.5s_ease-out_infinite]" />

        <div className="absolute inset-4 rounded-full bg-primary/[0.08] animate-[reveal_900ms_cubic-bezier(0.22,1,0.36,1)_both]" />

        <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/25">
          <Check size={22} strokeWidth={2.5} />
        </div>
      </div>

      <p className="mt-9 animate-[fade-up_700ms_both] text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
        Now you can see it
      </p>

      <h2 className="mt-4 animate-[fade-up_700ms_150ms_both] text-4xl font-semibold tracking-[-0.055em] sm:text-6xl">
        That's PennyPlot.
      </h2>

      <p className="mx-auto mt-5 max-w-md animate-[fade-up_700ms_300ms_both] text-sm leading-6 text-muted-foreground">
        Your money doesn't need to be complicated to be understood.
      </p>

      <button
        type="button"
        onClick={onEnter}
        className="group mt-9 flex animate-[fade-up_700ms_500ms_both] items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-xl shadow-primary/15 transition-all duration-300 hover:-translate-y-1 hover:bg-primary/90 hover:shadow-2xl hover:shadow-primary/20 active:translate-y-0"
      >
        Enter PennyPlot

        <ArrowRight
          size={17}
          className="transition-transform duration-300 group-hover:translate-x-1"
        />
      </button>

      <p className="mt-4 animate-[fade-up_700ms_650ms_both] text-[11px] text-muted-foreground/50">
        No account required.
      </p>
    </section>
  );
}

function ContinueButton({ onClick, label }) {
  return (
    <div className="mt-9 flex justify-center">
      <button
        type="button"
        onClick={onClick}
        className="group flex items-center gap-2 rounded-full border border-border bg-card/70 px-5 py-3 text-xs font-semibold text-foreground shadow-lg shadow-black/5 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-card active:translate-y-0"
      >
        {label}

        <ArrowRight
          size={15}
          className="text-primary transition-transform duration-300 group-hover:translate-x-1"
        />
      </button>
    </div>
  );
}

function SceneProgress({ sceneIndex }) {
  return (
    <div className="flex items-center gap-1.5">
      {scenes.slice(1).map((_, index) => (
        <div
          key={index}
          className={`h-1 rounded-full transition-all duration-500 ${
            index + 1 === sceneIndex
              ? "w-7 bg-primary"
              : index + 1 < sceneIndex
                ? "w-1.5 bg-primary/40"
                : "w-1.5 bg-muted-foreground/20"
          }`}
        />
      ))}
    </div>
  );
}

export default FirstLaunch;