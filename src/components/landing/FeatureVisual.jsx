function FeatureVisual() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="absolute left-1/2 top-1/2 h-[460px] w-[760px] -translate-x-1/2 -translate-y-1/2">
        {/* Outer rings */}
        <div className="absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/[0.08]" />
        <div className="absolute left-1/2 top-1/2 h-[270px] w-[270px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/[0.06]" />
        <div className="absolute left-1/2 top-1/2 h-[180px] w-[180px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/[0.08]" />

        {/* Crosshair */}
        <div className="absolute left-0 right-0 top-1/2 h-px bg-primary/[0.05]" />
        <div className="absolute bottom-0 left-1/2 top-0 w-px bg-primary/[0.05]" />

        {/* Data points */}
        <span className="absolute left-[20%] top-[35%] h-2 w-2 rounded-full bg-primary/20" />
        <span className="absolute left-[72%] top-[27%] h-1.5 w-1.5 rounded-full bg-primary/15" />
        <span className="absolute left-[62%] top-[72%] h-2 w-2 rounded-full bg-primary/20" />
        <span className="absolute left-[32%] top-[68%] h-1.5 w-1.5 rounded-full bg-primary/15" />

        {/* Center glow */}
        <div className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.06] blur-[60px]" />
      </div>
    </div>
  );
}

export default FeatureVisual;
