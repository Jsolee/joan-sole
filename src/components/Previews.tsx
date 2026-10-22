import type { IndexItem } from "@/content";

// Decorative stand-ins for work that has no public screenshot. All aria-hidden.

const dots = (color: string, size = 10) => ({
  backgroundImage: `radial-gradient(${color} 1.2px, transparent 1.6px)`,
  backgroundSize: `${size}px ${size}px`,
});

export function Ticket() {
  // Deterministic fake QR: a seeded pattern plus the three finder squares.
  const n = 21;
  let seed = 7;
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  const cells: [number, number][] = [];
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      const finder = (x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9);
      if (!finder && rnd() > 0.52) cells.push([x, y]);
    }
  const finder = (x: number, y: number) => (
    <g key={`${x}-${y}`}>
      <rect x={x} y={y} width={7} height={7} fill="currentColor" />
      <rect x={x + 1} y={y + 1} width={5} height={5} fill="var(--color-paper)" />
      <rect x={x + 2} y={y + 2} width={3} height={3} fill="currentColor" />
    </g>
  );

  return (
    <div aria-hidden className="relative grid h-full w-full place-items-center overflow-hidden bg-ink-2">
      <div className="absolute inset-0 opacity-40" style={dots("#c23b1c80", 14)} />
      <div className="relative w-[min(72%,20rem,36dvh)] rotate-[-4deg] rounded-[1.25rem] bg-paper p-5 text-ink shadow-[0_40px_80px_-30px_#c23b1c99] sm:p-7">
        <div className="flex items-baseline justify-between font-mono text-[0.7rem] text-ink/60">
          <span>Saturday · 23:30</span>
          <span>No. 0418</span>
        </div>
        <p className="font-display mt-3 text-3xl leading-none tracking-tight sm:text-4xl">General entry</p>
        <div className="relative my-5 border-t border-dashed border-ink/30">
          <span className="absolute -left-8 -top-3 size-6 rounded-full bg-ink-2 sm:-left-10" />
          <span className="absolute -right-8 -top-3 size-6 rounded-full bg-ink-2 sm:-right-10" />
        </div>
        <div className="relative mx-auto aspect-square w-[62%] overflow-hidden">
          <svg viewBox={`-1 -1 ${n + 2} ${n + 2}`} className="h-full w-full" shapeRendering="crispEdges">
            {cells.map(([x, y]) => (
              <rect key={`${x}.${y}`} x={x} y={y} width={1} height={1} fill="currentColor" />
            ))}
            {finder(0, 0)}
            {finder(n - 7, 0)}
            {finder(0, n - 7)}
          </svg>
          <span className="absolute inset-0" style={{ animation: "scan 2.6s var(--ease-in-out-quint) infinite" }}>
            <span className="absolute inset-x-0 top-0 h-[2px] bg-signal shadow-[0_0_12px_2px_var(--color-signal)]" />
          </span>
        </div>
        <div className="mt-5 flex items-center justify-between font-mono text-[0.7rem]">
          <span className="text-ink/60">HMAC verified</span>
          <span className="flex items-center gap-1.5 text-[#2f8a55]">
            <span className="size-1.5 rounded-full bg-current" />
            checked in
          </span>
        </div>
      </div>
    </div>
  );
}

export function Preview({ kind }: { kind: IndexItem["preview"] }) {
  switch (kind) {
    case "voice":
      return (
        <div aria-hidden className="relative flex h-full items-center justify-center gap-[3px] bg-ink-2 px-8">
          {Array.from({ length: 28 }, (_, i) => (
            <span
              key={i}
              className="block h-[46%] w-[4px] origin-center rounded-full bg-signal"
              style={{ animation: `bars ${0.7 + ((i * 7) % 5) * 0.12}s ease-in-out ${(i % 6) * -0.13}s infinite` }}
            />
          ))}
          <span className="absolute bottom-3 left-4 font-mono text-[0.65rem] text-paper/60">call in progress · CA</span>
        </div>
      );
    case "talaia":
      return (
        <div aria-hidden className="relative h-full overflow-hidden bg-[linear-gradient(180deg,#141729,#262c4a)]">
          {Array.from({ length: 34 }, (_, i) => (
            <span
              key={i}
              className="absolute size-[2px] rounded-full bg-paper"
              style={{
                left: `${(i * 37) % 100}%`,
                top: `${(i * 23) % 62}%`,
                animation: `twinkle ${2 + (i % 5) * 0.6}s ease-in-out ${(i % 7) * 0.3}s infinite`,
              }}
            />
          ))}
          <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-[34%] w-full">
            <path d="M0 30 L0 18 L12 12 L22 16 L34 8 L46 14 L58 6 L70 13 L82 9 L100 15 L100 30 Z" fill="#0c0d16" />
          </svg>
          <span className="absolute right-4 top-3 font-mono text-[0.65rem] text-paper/70">visibility 87</span>
        </div>
      );
    case "rumi":
      return (
        <div aria-hidden className="relative grid h-full place-items-center bg-[#2a2433]">
          <div className="absolute inset-0 opacity-60" style={dots("#d8c8e640", 9)} />
          <div className="relative grid size-[42%] place-items-center rounded-[46%] bg-[#e7c9de] shadow-[inset_0_-12px_0_#d3aecb]">
            <div className="flex gap-[18%]" style={{ width: "50%" }}>
              {[0, 1].map((i) => (
                <span key={i} className="block aspect-[2/3] w-[34%] rounded-full bg-ink" style={{ animation: "blink 4s infinite" }} />
              ))}
            </div>
          </div>
          <span className="absolute bottom-3 left-4 font-mono text-[0.65rem] text-paper/60">dreaming…</span>
        </div>
      );
  }
}
