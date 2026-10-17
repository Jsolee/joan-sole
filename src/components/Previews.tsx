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

// Documents go in on the left, a narrated, captioned lesson comes out on the right.
export function Traingenio() {
  return (
    <div aria-hidden className="relative h-full w-full overflow-hidden bg-[#e6e0d2] [container-type:inline-size]">
      <div className="absolute inset-0 opacity-60" style={dots("#17150f22", 12)} />
      <div className="relative flex h-full items-center justify-center gap-[3cqw] px-[5cqw]">
        <div className="relative aspect-[3/4] w-[22cqw] shrink-0">
          {[2, 1, 0].map((i) => (
            <div
              key={i}
              className="absolute inset-0 rounded-[0.6cqw] bg-paper p-[1.8cqw] shadow-[0_1.5cqw_3cqw_-1.5cqw_#17150f40]"
              style={{
                transform: `translate(${i * -1.6}cqw, ${i * 1.4}cqw) rotate(${i * -3}deg)`,
                animation: i === 0 ? "feed 4.8s var(--ease-in-out-quint) infinite" : undefined,
              }}
            >
              <div className="h-[1.3cqw] w-3/4 rounded-full bg-ink/80" />
              <div className="mt-[1.4cqw] space-y-[0.9cqw]">
                {[90, 70, 84, 60].map((w) => (
                  <div key={w} className="h-[0.8cqw] rounded-full bg-ink/15" style={{ width: `${w}%` }} />
                ))}
              </div>
              <div className="mt-[1.8cqw] h-[8cqw] rounded-[0.4cqw] bg-[#c99a2e]/70" />
              <p className="absolute bottom-[1.4cqw] left-[1.8cqw] font-mono text-[1.4cqw] text-ink/50">PDF · p.{3 - i}</p>
            </div>
          ))}
        </div>

        <div className="flex shrink-0 gap-[0.9cqw]">
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className="size-[1cqw] rounded-full bg-signal"
              style={{ animation: `twinkle 1.2s ease-in-out ${i * 0.16}s infinite` }}
            />
          ))}
        </div>

        <div className="w-[48cqw] shrink-0">
          <div className="relative aspect-video overflow-hidden rounded-[1cqw] bg-ink p-[3cqw] text-paper shadow-[0_3cqw_5cqw_-2.5cqw_#17150f80]">
            <p className="font-mono text-[1.5cqw] text-paper/50">Motiongenio · module 3</p>
            <p className="font-display mt-[1.6cqw] text-[5cqw] leading-none tracking-[-0.03em]">Safety basics</p>
            <div className="mt-[1.6cqw] h-[0.6cqw] w-[38%] origin-left rounded-full bg-signal" style={{ animation: "grow 4.8s var(--ease-out-quart) infinite" }} />
            <div className="absolute inset-x-[3cqw] bottom-[4.2cqw] flex items-center gap-[1.4cqw] rounded-[0.6cqw] bg-paper/10 px-[1.6cqw] py-[1cqw]">
              <span className="relative h-[2cqw] w-[3.6cqw] shrink-0 font-mono text-[1.4cqw] text-signal">
                {["CA", "ES", "EN"].map((l, i) => (
                  <span key={l} className="absolute inset-0 opacity-0" style={{ animation: `lang 7.2s ${i * 2.4}s infinite` }}>
                    {l}
                  </span>
                ))}
              </span>
              <span className="truncate text-[1.7cqw]">Wear gloves before handling the press.</span>
            </div>
            <div className="absolute inset-x-[3cqw] bottom-[2cqw] h-[0.4cqw] rounded-full bg-paper/20">
              <div className="h-full origin-left rounded-full bg-paper" style={{ animation: "grow 4.8s linear infinite" }} />
            </div>
          </div>
          <div className="mt-[2cqw] flex items-center justify-between rounded-[0.8cqw] bg-paper px-[2cqw] py-[1.4cqw] font-mono text-[1.5cqw] text-ink">
            <span>Daily quiz</span>
            <span className="flex items-center gap-[0.8cqw] text-[#2f8a55]">
              <svg viewBox="0 0 12 12" className="size-[1.6cqw]" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 6.5 5 9l5-6" />
              </svg>
              4 / 5
            </span>
          </div>
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
