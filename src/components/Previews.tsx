import Image from "next/image";
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
      <rect x={x + 1} y={y + 1} width={5} height={5} fill="var(--color-bone)" />
      <rect x={x + 2} y={y + 2} width={3} height={3} fill="currentColor" />
    </g>
  );

  return (
    <div aria-hidden className="relative grid h-full w-full place-items-center overflow-hidden bg-ink-2">
      <div className="absolute inset-0 opacity-40" style={dots("oklch(0.62 0.2 25 / 0.5)", 14)} />
      <div className="relative w-[min(72%,20rem,36dvh)] rotate-[-4deg] rounded-[1.25rem] bg-bone p-5 text-ink shadow-[0_40px_80px_-30px_oklch(0.62_0.2_25/0.6)] sm:p-7">
        <div className="flex items-baseline justify-between font-mono text-[0.7rem] text-ink/60">
          <span>Saturday · 23:30</span>
          <span>No. 0418</span>
        </div>
        <p className="mt-3 font-display text-3xl leading-none tracking-tight sm:text-4xl">General entry</p>
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
          <span className="flex items-center gap-1.5 text-[oklch(0.5_0.14_155)]">
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
    case "eclipse":
      return (
        <div aria-hidden className="relative grid h-full place-items-center bg-[oklch(0.12_0.01_60)]">
          <div
            className="absolute size-[58%] rounded-full bg-[radial-gradient(circle,oklch(0.85_0.12_70)_0%,oklch(0.65_0.2_40/0.6)_45%,transparent_70%)] blur-md"
            style={{ animation: "beat 0.4839s var(--ease-out-quart) infinite" }}
          />
          <div className="relative size-[38%] rounded-full bg-[oklch(0.1_0.01_60)] shadow-[0_0_0_1px_oklch(0.9_0.08_80/0.35)]" />
          <span className="absolute bottom-3 left-4 font-mono text-[0.65rem] text-bone/60">124 bpm</span>
        </div>
      );
    case "frost":
      return (
        <div aria-hidden className="relative grid h-full place-items-center bg-[linear-gradient(160deg,oklch(0.42_0.06_235),oklch(0.18_0.03_250))]">
          <div className="absolute inset-0 opacity-50" style={dots("oklch(0.95 0.02 230 / 0.35)", 12)} />
          <Image src="/work/frost-icon.webp" alt="" width={140} height={140} className="relative w-[36%] rounded-[22%] shadow-2xl" />
          <span className="absolute bottom-3 left-4 font-mono text-[0.65rem] text-bone/70">day 23 / 92</span>
        </div>
      );
    case "xinxeta":
      return (
        <div aria-hidden className="relative h-full overflow-hidden bg-[oklch(0.17_0.02_10)]">
          <Image
            src="/work/pinned.webp"
            alt=""
            width={430}
            height={900}
            className="absolute left-1/2 top-[8%] w-[52%] -translate-x-1/2 rounded-[1.4rem] border border-bone/10 shadow-2xl"
          />
        </div>
      );
    case "talaia":
      return (
        <div aria-hidden className="relative h-full overflow-hidden bg-[linear-gradient(180deg,oklch(0.14_0.03_265),oklch(0.24_0.05_260))]">
          {Array.from({ length: 34 }, (_, i) => (
            <span
              key={i}
              className="absolute size-[2px] rounded-full bg-bone"
              style={{
                left: `${(i * 37) % 100}%`,
                top: `${(i * 23) % 62}%`,
                animation: `twinkle ${2 + (i % 5) * 0.6}s ease-in-out ${(i % 7) * 0.3}s infinite`,
              }}
            />
          ))}
          <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-[34%] w-full">
            <path d="M0 30 L0 18 L12 12 L22 16 L34 8 L46 14 L58 6 L70 13 L82 9 L100 15 L100 30 Z" fill="oklch(0.1 0.01 260)" />
          </svg>
          <span className="absolute right-4 top-3 font-mono text-[0.65rem] text-bone/70">visibility 87</span>
        </div>
      );
    case "motion":
      return (
        <div aria-hidden className="relative grid h-full place-items-center bg-[oklch(0.93_0.02_85)]">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="absolute aspect-video w-[58%] rounded-lg border border-ink/10 bg-bone p-3 shadow-xl"
              style={{
                transform: `translate(${(i - 1) * 6}%, ${(i - 1) * 7}%)`,
                animation: i === 2 ? "slide-stack 3.2s var(--ease-in-out-quint) infinite" : undefined,
              }}
            >
              <div className="h-2 w-1/2 rounded-full bg-ink/80" />
              <div className="mt-2 h-1.5 w-3/4 rounded-full bg-ink/20" />
              <div className="mt-1 h-1.5 w-2/3 rounded-full bg-ink/20" />
              <div className="mt-3 h-1/3 w-1/3 rounded bg-signal/80" />
            </div>
          ))}
        </div>
      );
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
          <span className="absolute bottom-3 left-4 font-mono text-[0.65rem] text-bone/60">call in progress</span>
        </div>
      );
    case "rumi":
      return (
        <div aria-hidden className="relative grid h-full place-items-center bg-[oklch(0.2_0.02_300)]">
          <div className="absolute inset-0 opacity-60" style={dots("oklch(0.8 0.05 300 / 0.25)", 9)} />
          <div className="relative grid size-[42%] place-items-center rounded-[46%] bg-[oklch(0.86_0.06_320)] shadow-[inset_0_-12px_0_oklch(0.76_0.07_320)]">
            <div className="flex gap-[18%]" style={{ width: "50%" }}>
              {[0, 1].map((i) => (
                <span key={i} className="block aspect-[2/3] w-[34%] rounded-full bg-ink" style={{ animation: "blink 4s infinite" }} />
              ))}
            </div>
          </div>
          <span className="absolute bottom-3 left-4 font-mono text-[0.65rem] text-bone/60">dreaming…</span>
        </div>
      );
  }
}
