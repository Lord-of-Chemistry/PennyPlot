import { useEffect, useRef } from "react";

function HeroGraph() {
  const containerRef = useRef(null);
  const graphRef = useRef(null);
  const glowRef = useRef(null);
  const pointsRef = useRef([]);

  const graphPoints = [
    [3, 68],
    [9, 60],
    [15, 65],
    [21, 48],
    [27, 55],
    [33, 40],
    [39, 46],
    [45, 32],
    [51, 38],
    [57, 25],
    [63, 31],
    [69, 19],
    [75, 26],
    [81, 13],
    [88, 19],
    [97, 7],
  ];

  const path = graphPoints
    .map(([x, y], index) => `${index === 0 ? "M" : "L"} ${x} ${y}`)
    .join(" ");

  useEffect(() => {
    const container = containerRef.current;
    const graph = graphRef.current;
    const glow = glowRef.current;

    if (!container || !graph || !glow) return;

    const handleMouseMove = (event) => {
      const rect = container.getBoundingClientRect();

      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      const x = mouseX / rect.width;
      const y = mouseY / rect.height;

      graph.style.transform = `
        translate(${(x - 0.5) * 16}px, ${(y - 0.5) * 10}px
      `;

      glow.style.transform = `
        translate(${(x - 0.5) * 35}px, ${(y - 0.5) * 25}px)
      `;

      pointsRef.current.forEach((point, index) => {
        if (!point) return;

        const pointX = graphPoints[index][0] / 100;
        const distance = Math.abs(pointX - x);

        if (distance < 0.13) {
          point.style.opacity = "1";
          point.style.transform =
            "translate(-50%, -50%) scale(1.8)";
        } else {
          point.style.opacity = "0.45";
          point.style.transform =
            "translate(-50%, -50%) scale(1)";
        }
      });
    };

    const handleMouseLeave = () => {
      graph.style.transform = "translate(0, 0)";
      glow.style.transform = "translate(0, 0)";

      pointsRef.current.forEach((point) => {
        if (!point) return;

        point.style.opacity = "0.45";
        point.style.transform =
          "translate(-50%, -50%) scale(1)";
      });
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      container.removeEventListener(
        "mousemove",
        handleMouseMove,
      );
      container.removeEventListener(
        "mouseleave",
        handleMouseLeave,
      );
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="pointer-events-auto absolute inset-x-0 top-0 z-0 h-[620px] overflow-hidden"
    >
      {/* Ambient glow */}
      <div
        ref={glowRef}
        className="absolute left-1/2 top-16 h-80 w-80 -translate-x-1/2 rounded-full bg-primary/10 blur-[100px] transition-transform duration-700 ease-out"
      />

      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
          backgroundSize: "70px 70px",
        }}
      />

      {/* Graph */}
      <div
        ref={graphRef}
        className="absolute left-[3%] right-[3%] top-20 h-[360px] transition-transform duration-700 ease-out sm:top-24 sm:h-[390px]"
      >
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="h-full w-full overflow-visible"
        >
          <path
            d={path}
            fill="none"
            stroke="currentColor"
            strokeWidth="0.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary opacity-40"
          />

          <path
            d={path}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary opacity-10 blur-[3px]"
          />
        </svg>

        {graphPoints.map(([x, y], index) => (
          <span
            key={index}
            ref={(element) => {
              pointsRef.current[index] = element;
            }}
            className="absolute h-2 w-2 rounded-full bg-primary opacity-45 transition-all duration-300"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              transform: "translate(-50%, -50%)",
            }}
          />
        ))}
      </div>

      {/* Bottom fade */}
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-background via-background/70 to-transparent" />

      {/* Top fade */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background to-transparent" />
    </div>
  );
}

export default HeroGraph;