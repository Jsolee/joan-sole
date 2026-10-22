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

function Stat({ value, label, from, decimals, tag }: { value: string; label: ReactNode; from?: number; decimals?: number; tag?: string }) {
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
        {/* 01 · ship */}
        <Habit n="01" title="Put it in front of real people, early" className="md:col-span-7">
          <Body>
            I&rsquo;d rather ship something small that people use this week than something big that sits on my laptop.
            Real use finds the problems that matter.
          </Body>
          <div className="mt-8 flex flex-wrap items-end gap-x-6 gap-y-2">
            <p className="font-display text-[clamp(4rem,8vw,7.5rem)] leading-[0.82] tracking-[-0.05em]">
              <span data-count-to="1">1</span>&nbsp;day
            </p>
            <p className="max-w-[24ch] pb-2 text-[0.95rem] leading-snug text-ink/70">
              from the first commit to a TestFlight build <Tag>FROST</Tag>
            </p>
          </div>
          <ol className="mt-auto space-y-4 pt-8">
            {[
              ["Club ticketing", "66 commits and 19 migrations, from zero", "Day one"],
              ["QusAP", "In weekly classroom use, 132 students", "Since Sep 2026"],
              ["Picgenio", "Video generator, used by paying customers", "In production"],
            ].map(([p, what, when]) => (
              <li key={p} className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2">
                <span className="flex items-center gap-3 text-[0.95rem]">
                  <Tag>{p}</Tag>
                  <span className="text-ink/80">{what}</span>
                </span>
                <span className="font-mono text-xs text-ink">{when}</span>
                <span className="col-span-2 h-0.5 overflow-hidden rounded-full bg-ink/10">
                  <span data-bar data-bar-from="0" data-bar-to="1" className="block h-full origin-left rounded-full bg-ink" />
                </span>
              </li>
            ))}
          </ol>
        </Habit>

        {/* 02 · measure */}
        <Habit n="02" title="Measure before you fix" className="md:col-span-5">
          <Body>
            When a live class froze, everyone blamed the database. It was answering in under a millisecond. Counting
            requests found the real cause: a polling loop.
          </Body>
          <svg viewBox="0 0 300 110" className="mt-6 w-full overflow-visible" aria-hidden>
            <line x1="0" y1="100" x2="300" y2="100" stroke="currentColor" strokeOpacity="0.15" />
            <path data-draw pathLength={1} d="M0 96 L30 92 L52 62 L64 80 L80 24 L92 54 L104 8 L118 44 L130 6 L150 36" fill="none" stroke="#c23b1c" strokeWidth="2" strokeLinejoin="round" />
            <path data-draw pathLength={1} d="M150 36 L162 96 L300 98" fill="none" stroke="currentColor" strokeWidth="2" />
            <text x="104" y="-2" className="fill-current font-mono text-[9px]" opacity="0.55">282 req/s</text>
            <text x="214" y="90" className="fill-current font-mono text-[9px]" opacity="0.55">after</text>
          </svg>
          <div className="mt-auto grid grid-cols-2 gap-4 pt-6">
            <Stat value="282" label="requests a second, from a polling loop" />
            <Stat value="0" from={282} label="errors after, with 80 students on 4% of a core" />
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
