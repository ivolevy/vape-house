import * as React from "react";

export function Particles({ count = 40 }: { count?: number }) {
  const dots = React.useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: Math.random() * 100,
        size: Math.random() * 2 + 0.6,
        delay: Math.random() * 12,
        dur: 14 + Math.random() * 16,
        opacity: 0.3 + Math.random() * 0.6,
        key: i,
      })),
    [count],
  );
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {dots.map((d) => (
        <span
          key={d.key}
          className="absolute bottom-[-10px] rounded-full bg-white"
          style={{
            left: `${d.left}%`,
            width: `${d.size}px`,
            height: `${d.size}px`,
            opacity: d.opacity,
            animation: `float-up ${d.dur}s linear ${d.delay}s infinite`,
            boxShadow: "0 0 6px rgba(255,255,255,0.6)",
          }}
        />
      ))}
    </div>
  );
}
