import { useEffect, useRef } from "react";

function ClarityVisual() {
  const containerRef = useRef(null);
  const cardRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const card = cardRef.current;

    if (!container || !card) return;

    const handleMouseMove = (event) => {
      const rect = container.getBoundingClientRect();

      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;

      card.style.transform = `
        perspective(1000px)
        rotateX(${(0.5 - y) * 7}deg)
        rotateY(${(x - 0.5) * 9}deg)
      `;
    };

    const handleMouseLeave = () => {
      card.style.transform = `
        perspective(1000px)
        rotateX(0deg)
        rotateY(0deg)
      `;
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative mx-auto mt-12 h-52 w-full max-w-md"
    >
      {/* Glow */}
      <div className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[70px]" />

      {/* Main visual */}
      <div
        ref={cardRef}
        className="absolute left-1/2 top-1/2 h-40 w-64 -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border/80 bg-card/80 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl transition-transform duration-500 ease-out"
      >
        <div className="flex items-center justify-between">
          <div className="h-2 w-16 rounded-full bg-muted" />
          <div className="h-2 w-2 rounded-full bg-primary/70" />
        </div>

        {/* Abstract plotted line */}
        <div className="relative mt-6 h-16">
          <svg
            viewBox="0 0 240 64"
            preserveAspectRatio="none"
            className="h-full w-full"
          >
            <path
              d="M4 50 L38 43 L68 47 L98 30 L126 35 L155 21 L184 27 L214 12 L236 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary/70"
            />

            <path
              d="M4 50 L38 43 L68 47 L98 30 L126 35 L155 21 L184 27 L214 12 L236 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary/10 blur-[4px]"
            />
          </svg>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="h-2 w-20 rounded-full bg-muted" />
          <div className="h-2 w-10 rounded-full bg-primary/20" />
        </div>
      </div>

      {/* Small floating elements */}
      <div className="absolute left-1/2 top-2 h-8 w-8 -translate-x-1/2 rounded-lg border border-primary/20 bg-card shadow-lg shadow-black/20">
        <div className="mx-auto mt-3 h-1.5 w-1.5 rounded-full bg-primary" />
      </div>

      <div className="absolute bottom-5 left-[12%] h-6 w-16 rounded-full border border-border bg-card/80 shadow-lg shadow-black/20" />

      <div className="absolute bottom-9 right-[10%] h-6 w-12 rounded-full border border-border bg-card/80 shadow-lg shadow-black/20" />
    </div>
  );
}

export default ClarityVisual;
