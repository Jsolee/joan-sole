import type { ReactNode } from "react";

// Every number here is real and measured. Counters start from the final value in the HTML,
// so without JavaScript the page still tells the truth.

function Tile({
  project,
  tint,
  className = "",
  children,
}: {
  project: string;
  tint: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <article
      data-fade
      className={`relative flex flex-col overflow-hidden rounded-[1.25rem] border border-ink/10 bg-paper-2 p-6 shadow-[inset_0_1px_0_0_rgb(255_255_255/0.6),0_1px_2px_0_rgb(23_21_15/0.06)] md:p-8 ${className}`}
    >
      <p className="flex items-center gap-2 font-mono text-xs text-mute">
        <span className="size-1.5 rounded-full" style={{ background: tint }} />
        <span translate="no">{project}</span>
      </p>
      {children}
    </article>
  );
}

const Big = ({ children }: { children: ReactNode }) => (
  <p className="font-display mt-6 text-[clamp(3.25rem,6vw,5.5rem)] leading-[0.9] tracking-[-0.045em] tabular-nums">{children}</p>
);
const Label = ({ children }: { children: ReactNode }) => (
  <p className="mt-3 max-w-[34ch] text-pretty text-[0.95rem] leading-relaxed text-ink/70">{children}</p>
);

export default function Receipts() {
  return (
    <section id="receipts" aria-labelledby="receipts-title" className="gutter relative z-10 bg-paper pb-8 pt-28 md:pt-40">
      <header className="mb-10 grid gap-6 md:mb-14 md:grid-cols-12 md:items-end">
        <h2 id="receipts-title" data-reveal className="font-display text-[clamp(3rem,9vw,9rem)] leading-[0.9] tracking-[-0.04em] md:col-span-7">
          Receipts
        </h2>
        <p data-fade className="max-w-[36ch] text-pretty text-ink/70 md:col-span-4 md:col-start-9">
          Every number below was measured, most of them in production.
        </p>
      </header>

      <div className="grid gap-3 md:grid-flow-dense md:grid-cols-12 md:gap-4">
        <Tile project="QusAP" tint="#2f9e62" className="md:col-span-5 md:row-span-2">
          <Big>
            <span data-count-to="132">132</span>
          </Big>
          <Label>students use it every week, in the same course, since September&nbsp;2026.</Label>
          <div data-fill className="mt-8 grid grid-cols-[repeat(22,minmax(0,1fr))] gap-[4px] md:mt-auto md:pt-10" aria-hidden>
            {Array.from({ length: 132 }, (_, i) => (
              <span key={i} data-cell className="aspect-square rounded-full bg-ink" />
            ))}
          </div>
        </Tile>

        <Tile project="QusAP" tint="#2f9e62" className="md:col-span-7">
          <div className="grid gap-6 sm:grid-cols-[1fr_1.1fr] sm:items-end">
            <div>
              <Big>
                282 <span className="text-mute">→</span> <span data-count-from="282" data-count-to="0">0</span>
              </Big>
              <Label>
                A live class froze at 282 requests a second. After the rewrite: 0 errors with 80 students, on 4% of
                one core.
              </Label>
            </div>
            <svg viewBox="0 0 300 120" className="w-full overflow-visible" aria-hidden>
              <line x1="0" y1="110" x2="300" y2="110" stroke="currentColor" strokeOpacity="0.15" />
              <path
                data-draw
                pathLength={1}
                d="M0 104 L30 100 L52 70 L64 88 L80 30 L92 62 L104 12 L118 50 L130 8 L150 40"
                fill="none"
                stroke="#c23b1c"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path data-draw pathLength={1} d="M150 40 L162 104 L300 106" fill="none" stroke="currentColor" strokeWidth="2" />
              <text x="104" y="2" className="fill-current font-mono text-[9px]" opacity="0.55">
                282 req/s
              </text>
              <text x="212" y="98" className="fill-current font-mono text-[9px]" opacity="0.55">
                after
              </text>
            </svg>
          </div>
        </Tile>

        <Tile project="QusAP" tint="#2f9e62" className="md:col-span-4">
          <Big>
            <span data-count-from="3.5" data-count-to="0.41" data-decimals="2">
              0.41
            </span>
            <span className="text-[0.45em] tracking-normal">&nbsp;MB</span>
          </Big>
          <Label>course page weight, down from 3.5&nbsp;MB.</Label>
          <div className="mt-auto pt-8" aria-hidden>
            <div className="h-2 rounded-full bg-ink/10">
              <div data-bar data-bar-from="1" data-bar-to="0.117" className="h-full origin-left scale-x-[0.117] rounded-full bg-ink" />
            </div>
          </div>
        </Tile>

        <Tile project="QusAP" tint="#2f9e62" className="md:col-span-3">
          <Big>
            <span data-count-from="400" data-count-to="64">64</span>
            <span className="text-[0.45em] tracking-normal">&nbsp;ms</span>
          </Big>
          <Label>to come back to a course, down from 400&nbsp;ms.</Label>
          <div className="mt-auto space-y-2 pt-8 font-mono text-[0.65rem] text-mute" aria-hidden>
            <div className="h-1.5 rounded-full bg-ink/15" />
            <div className="h-1.5 rounded-full bg-ink/10">
              <div data-bar data-bar-from="1" data-bar-to="0.16" className="h-full origin-left scale-x-[0.16] rounded-full bg-signal" />
            </div>
          </div>
        </Tile>

        <Tile project="Club ticketing" tint="#c23b1c" className="md:col-span-6">
          <Big>
            <span data-count-to="605">605</span>
          </Big>
          <Label>tests, including integration tests against a real database. Each square below is 5.</Label>
          <div data-fill className="mt-8 grid grid-cols-[repeat(22,minmax(0,1fr))] gap-[3px]" aria-hidden>
            {Array.from({ length: 121 }, (_, i) => (
              <span key={i} data-cell className="aspect-square rounded-[2px] bg-[#2f8a55]" />
            ))}
          </div>
        </Tile>

        <Tile project="QusAP" tint="#2f9e62" className="md:col-span-6">
          <Big>
            <span data-count-to="35">35</span>
            <span className="text-mute">/35</span>
          </Big>
          <Label>tables locked down with row-level security. The grading engine runs inside Postgres too.</Label>
          <div data-fill className="mt-8 grid grid-cols-[repeat(12,minmax(0,1fr))] gap-[6px] sm:grid-cols-[repeat(18,minmax(0,1fr))]" aria-hidden>
            {Array.from({ length: 35 }, (_, i) => (
              <span key={i} data-cell className="grid aspect-square place-items-center rounded-[4px] bg-ink">
                <span className="size-1 rounded-full bg-paper-2" />
              </span>
            ))}
          </div>
        </Tile>
      </div>
    </section>
  );
}
