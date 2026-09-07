import { useEffect, useRef } from "react";

function FeatureVisual() {
  const containerRef = useRef(null);
  const visualRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const visual = visualRef.current;

    if (!container || !visual) return;

    const handleMouseMove = (event) => {
      const rect = container.getBoundingClientRect();

      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;

      visual.style.transform = `
        perspective(900px)
        rotateX(${(0.5 - y) * 5}deg)
        rotateY(${(x - 0.5) * 7}deg)
        translateZ(0)
      `;
    };

    const handleMouseLeave = () => {
      visual.style.transform = `
        perspective(900px)
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
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div
        ref={visualRef}
        className="absolute left-1/2 top-1/2 h-[460px] w-[760px] -translate-x-1/2 -translate-y-1/2 transition-transform duration-700 ease-out"
      >
        {/* Large circular rings */}
        <div className="absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/[0.09]" />

        <div className="absolute left-1/2 top-1/2 h-[270px] w-[270px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/[0.07]" />

        <div className="absolute left-1/2 top-1/2 h-[180px] w-[180px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/[0.08]" />

        {/* Horizontal line */}
        <div className="absolute left-0 right-0 top-1/2 h-px bg-primary/[0.07]" />

        {/* Vertical line */}
        <div className="absolute bottom-0 left-1/2 top-0 w-px bg-primary/[0.07]" />

        {/* Floating points */}
        <span className="absolute left-[20%] top-[35%] h-2 w-2 rounded-full bg-primary/25" />
        <span className="absolute left-[72%] top-[27%] h-1.5 w-1.5 rounded-full bg-primary/20" />
        <span className="absolute left-[62%] top-[72%] h-2 w-2 rounded-full bg-primary/25" />
        <span className="absolute left-[32%] top-[68%] h-1.5 w-1.5 rounded-full bg-primary/20" />

        {/* Center glow */}
        <div className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.08] blur-[60px]" />
      </div>
    </div>
  );
}

export default FeatureVisual;