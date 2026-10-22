import type { ReactNode } from "react";

// Five habits, each with the proof from a real project. Every number comes from the projects
// or the knowledge base and is in the HTML as-is; the counters only animate towards it.

function Habit({ n, title, className = "", children }: { n: string; title: string; className?: string; children: ReactNode }) {
  return (
    <article
      data-fade
      className={`relative flex flex-col overflow-hidden rounded-[1.25rem] border border-ink/10 bg-paper-2 p-6 shadow-[inset_0_1px_0_0_rgb(255_255_255/0.6),0_1px_2px_0_rgb(23_21_15/0.06)] md:p-8 ${className}`}
    >
      <p className="font-mono text-xs text-mute">{n}</p>
      <h3 className="font-display mt-3 text-balance text-[clamp(1.75rem,2.6vw,2.5rem)] leading-[1.02] tracking-[-0.035em]">{title}</h3>
      {children}
    </article>
  );
}

const Body = ({ children }: { children: ReactNode }) => (
  <p className="mt-4 max-w-[52ch] text-pretty text-[0.95rem] leading-relaxed text-ink/75">{children}</p>
);

function Stat({
  value,
  label,
  from,
  decimals,
  tag,
  suffix,
}: {
  value: string;
  label: ReactNode;
  from?: number;
  decimals?: number;
  tag?: string;
  suffix?: string;
}) {
  const num = Number(value);
  return (
    <div className="border-t border-ink/10 pt-3">
      <p className="font-display text-[clamp(2rem,3vw,2.75rem)] leading-none tracking-[-0.04em] tabular-nums">
        {Number.isNaN(num) ? (
          value
        ) : (
          <span data-count-to={value} data-count-from={from} data-decimals={decimals}>
            {value}
          </span>
        )}
        {suffix}
      </p>
      <p className="mt-2 text-[0.85rem] leading-snug text-ink/65">{label}</p>
      {tag && (
        <p className="mt-2">
          <Tag>{tag}</Tag>
        </p>
      )}
    </div>
  );
}

const Tag = ({ children }: { children: ReactNode }) => (
  <span translate="no" className="rounded-full border border-ink/12 px-2 py-0.5 font-mono text-[0.7rem] text-mute">
    {children}
  </span>
);

const decisions = [
  ["045", "The QR secret never leaves the database"],
  ["035", "A polling loop that only re-arms after the reply"],
  ["042", "PaymentIntents, not Checkout Sessions"],
  ["038", "If the screen doesn’t show it, don’t validate it"],
  ["029", "Lock down function grants in production"],
  ["207", "The vault is the brain"],
  ["214", "Skia for the welcome intro"],
  ["047", "A door that works offline"],
];

const reviews = [
  ["#66", "Visibility index: clamp every factor to [0, 1]", "Approved"],
  ["#57", "GET /recomanacions: a slot after midnight lands on the wrong night", "Changes requested"],
  ["#56", "Sign in with Apple, PKCE and session restore", "Approved"],
  ["#69", "Integrate snapshot, drop the auth lock from tests", "Approved"],
];

const prs = [
  ["#113", "feat/promoter-one-night", "feat", "a promoter can be brought in for one night only"],
  ["#109", "fix/customer-stats-invoker", "fix", "v_customer_stats runs as whoever asks"],
  ["#108", "revert/bank-page-methods", "revert", "the bank’s page needs every method"],
];

function GitGraph() {
  const row = 34;
  const rows = prs.length * 2;
  const y = (i: number) => i * row + row / 2;
  return (
    <div aria-label="Recent pull requests on the club ticketing repo" className="mt-7 overflow-hidden rounded-xl border border-ink/10 bg-paper">
      <div className="flex items-center justify-between border-b border-ink/8 px-4 py-2 font-mono text-[0.7rem] text-mute">
        <span>git log --graph main</span>
        <span>CI · GitHub Actions</span>
      </div>
      <div className="relative" style={{ height: rows * row }}>
        <svg aria-hidden viewBox={`0 0 44 ${rows * row}`} className="absolute inset-y-0 left-2 h-full w-11">
          <line x1="12" y1="0" x2="12" y2={rows * row} stroke="currentColor" strokeOpacity="0.35" strokeWidth="1.5" />
          {prs.map((_, i) => {
            const merge = y(i * 2);
            const commit = y(i * 2 + 1);
            return (
              <path
                key={i}
                data-draw
                pathLength={1}
                d={`M12 ${commit + row * 0.85} C30 ${commit + row * 0.6} 30 ${commit + 8} 30 ${commit} C30 ${merge + 14} 30 ${merge + 6} 12 ${merge}`}
                fill="none"
                stroke="#c23b1c"
                strokeWidth="1.5"
              />
            );
          })}
          {prs.map((_, i) => (
            <g key={i}>
              <circle cx="12" cy={y(i * 2)} r="4" className="fill-ink" />
              <circle cx="30" cy={y(i * 2 + 1)} r="3.5" fill="#f3f0e8" stroke="#c23b1c" strokeWidth="1.5" />
            </g>
          ))}
        </svg>
        <ol className="absolute inset-y-0 left-14 right-3 font-mono text-[0.72rem]">
          {prs.flatMap(([n, branch, type, msg]) => [
            <li key={`${n}m`} className="flex items-center gap-2" style={{ height: row }}>
              <span className="text-ink">Merge {n}</span>
              <span className="truncate rounded-full border border-ink/12 px-2 py-px text-mute">{branch}</span>
              <span className="ml-auto shrink-0 rounded-full bg-[#2f9e62]/12 px-2 py-px text-[#1f7a48]">✓ CI</span>
            </li>,
            <li key={`${n}c`} className="flex items-center gap-1.5 pl-4" style={{ height: row }}>
              <span className="font-semibold text-signal">{type}:</span>
              <span className="truncate text-ink/75">{msg}</span>
            </li>,
          ])}
        </ol>
      </div>
    </div>
  );
}

export default function HowIWork() {
  return (
    <section id="how" aria-labelledby="how-title" className="gutter relative z-10 pb-28 pt-28 md:pb-40 md:pt-40">
      <header className="mb-10 grid gap-6 md:mb-14 md:grid-cols-12 md:items-end">
        <h2 id="how-title" data-reveal className="font-display text-[clamp(3rem,9vw,9rem)] leading-[0.9] tracking-[-0.04em] md:col-span-7">
          How I work
        </h2>
        <p data-fade className="max-w-[38ch] text-pretty text-ink/70 md:col-span-4 md:col-start-9">
          Five habits I keep on every project, each with the proof from one of them.
        </p>
      </header>

      <div className="grid gap-3 md:grid-cols-12 md:gap-4">
        {/* 01 · git workflow */}
        <Habit n="01" title="One branch per change, a history you can read" className="md:col-span-7">
          <Body>
            Every change gets its own branch, lands through a pull request once CI is green, and is written as a
            Conventional Commit that explains why, not just what. On team projects a hook enforces it and every commit
            links its ticket.
          </Body>
          <GitGraph />
          <div className="mt-auto grid grid-cols-3 gap-4 pt-7">
            <Stat value="150" label="of my pull requests merged" tag="Club ticketing · Talaia" />
            <Stat value="98" suffix="%" label="Conventional Commits, 396 of 403" />
            <Stat value="3" label="environments: snapshot, stable, prod" tag="Talaia" />
          </div>
        </Habit>

        {/* 02 · measure */}
        <Habit n="02" title="Measure before you fix" className="md:col-span-5">
          <Body>
            When a live class froze, everyone blamed the database. It was answering in under a millisecond. Counting
            requests found the real cause: a polling loop.
          </Body>
          <div className="flex flex-1 items-center py-6">
            <svg viewBox="0 0 300 110" className="w-full overflow-visible" aria-hidden>
            <line x1="0" y1="100" x2="300" y2="100" stroke="currentColor" strokeOpacity="0.15" />
            <path data-draw pathLength={1} d="M0 96 L30 92 L52 62 L64 80 L80 24 L92 54 L104 8 L118 44 L130 6 L150 36" fill="none" stroke="#c23b1c" strokeWidth="2" strokeLinejoin="round" />
            <path data-draw pathLength={1} d="M150 36 L162 96 L300 98" fill="none" stroke="currentColor" strokeWidth="2" />
            <text x="104" y="-2" className="fill-current font-mono text-[9px]" opacity="0.55">282 req/s</text>
            <text x="214" y="90" className="fill-current font-mono text-[9px]" opacity="0.55">after</text>
          </svg>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Stat value="282" label="requests a second, from a polling loop" />
            <Stat value="0.7" decimals={1} suffix=" ms" label="per query in the database, at most" />
            <Stat value="0" from={282} label="errors after the fix, 80 students, 4% of a core" />
          </div>
        </Habit>

        {/* 03 · database */}
        <Habit n="03" title="Let the database guard the data" className="md:col-span-5">
          <Body>
            Permissions live in Postgres, in row-level security and SQL functions, so a bug in the UI can&rsquo;t leak
            anything. Every role gets a test, the obvious ones too. One of them caught this before release:
          </Body>
          <pre aria-label="A permission check fixed with coalesce" className="mt-6 whitespace-pre-wrap break-words rounded-xl bg-ink px-4 py-4 font-mono text-[0.7rem] leading-relaxed text-paper/85">
            <span className="block text-paper/45">-- NULL for anyone who isn&rsquo;t a promoter, so it never raised</span>
            <span className="block text-[#ff9b85]">- if not (promoter_id = fn_current_promoter_id()) then</span>
            <span className="block text-[#9be5a8]">+ if not coalesce(promoter_id = fn_current_promoter_id(), false) then</span>
            <span className="block">{"    raise exception 'not allowed';"}</span>
          </pre>
          <div className="mt-auto grid grid-cols-2 gap-4 pt-6">
            <Stat value="35/35" label="tables behind row-level security" tag="QusAP" />
            <Stat value="605" label="tests, against a real database" tag="Club ticketing" />
          </div>
        </Habit>

        {/* 04 · write it down */}
        <Habit n="04" title="Write it down" className="md:col-span-7">
          <Body>
            Every project feeds one knowledge base: each decision with the options I turned down, each incident with
            its root cause, each trap so nobody falls in twice. Claude Code reads it before it touches any code.
          </Body>
          <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_1.1fr]">
            <div className="grid grid-cols-2 gap-x-4 gap-y-5">
              <Stat value="108" label="decisions on record" />
              <Stat value="15" label="incidents, with root cause" />
              <Stat value="86" label="traps documented" />
              <Stat value="8" label="projects feeding it" />
            </div>
            <div aria-hidden className="relative h-56 overflow-hidden rounded-xl border border-ink/10 bg-paper sm:h-auto">
              <div className="absolute inset-x-0 top-0 animate-[ticker_22s_linear_infinite] px-4">
                {[...decisions, ...decisions].map(([n, t], i) => (
                  <p key={i} className="flex gap-3 border-b border-ink/8 py-2.5 text-[0.8rem] leading-snug">
                    <span className="font-mono text-mute">{n}</span>
                    <span className="text-ink/80">{t}</span>
                  </p>
                ))}
              </div>
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(var(--color-paper),transparent_22%,transparent_78%,var(--color-paper))]" />
            </div>
          </div>
        </Habit>

        {/* 05 · team */}
        <Habit n="05" title="Review like it’s yours" className="md:col-span-12">
          <div className="grid gap-8 md:grid-cols-12 md:gap-10">
            <div className="md:col-span-5">
              <Body>
                On Talaia, a university project with a team of six, I set up the repo and CI, ran the first sprint as
                Scrum master and read every pull request as if I had to maintain it. Kind about the people, strict about
                the code.
              </Body>
              <div className="mt-7 grid grid-cols-3 gap-4">
                <Stat value="48" label="pull requests reviewed" />
                <Stat value="40" label="of mine merged" />
                <Stat value="6" label="people on the team" />
              </div>
            </div>
            <ul aria-label="Some of the reviews" className="self-end divide-y divide-ink/8 rounded-xl border border-ink/10 bg-paper md:col-span-7">
              {reviews.map(([n, title, verdict]) => (
                <li key={n} className="flex items-center gap-4 px-4 py-3.5 text-[0.85rem]">
                  <span className="font-mono text-mute">{n}</span>
                  <span className="min-w-0 flex-1 truncate text-ink/80">{title}</span>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 font-mono text-[0.7rem] ${
                      verdict === "Approved" ? "bg-[#2f9e62]/12 text-[#1f7a48]" : "bg-signal/10 text-signal"
                    }`}
                  >
                    {verdict}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Habit>
      </div>
    </section>
  );
}
