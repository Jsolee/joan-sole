import { featured, type Project } from "@/content";
import { PicgenioDemo, QusapDemo, TraingenioDemo } from "./Demos";
import { Ticket } from "./Previews";

const demos = { picgenio: PicgenioDemo, qusap: QusapDemo, traingenio: TraingenioDemo, ticket: Ticket };

export default function Work() {
  return (
    <section id="work" aria-labelledby="work-title" className="relative">
      <header className="gutter flex items-end justify-between pb-10 pt-24 md:pb-16 md:pt-32">
        <h2 id="work-title" data-reveal className="font-display text-[clamp(3rem,9vw,9rem)] leading-[0.9] tracking-[-0.04em]">
          Selected work
        </h2>
        <span data-fade className="font-mono text-sm text-mute">
          (0{featured.length})
        </span>
      </header>

      <div>
        {featured.map((p, i) => (
          <Card key={p.slug} p={p} i={i} />
        ))}
      </div>
    </section>
  );
}

function Card({ p, i }: { p: Project; i: number }) {
  return (
    <article data-stack-card className="relative md:sticky md:top-0 md:h-[100dvh]" style={{ zIndex: i + 1 }}>
      <div
        data-stack-inner
        className="relative flex h-full origin-top flex-col overflow-hidden rounded-t-[1.75rem] border-t border-line/70 bg-paper-2 md:rounded-t-[2.5rem]"
      >
        <div data-stack-shade className="pointer-events-none absolute inset-0 z-20 bg-paper opacity-0" />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-[20%] -top-[30%] size-[70vmax] rounded-full opacity-[0.13] blur-3xl"
          style={{ background: `radial-gradient(circle, ${p.tint}, transparent 62%)` }}
        />

        <div className="gutter relative grid flex-1 grid-rows-[auto_1fr] gap-8 pb-8 pt-8 md:grid-rows-[auto_minmax(0,1fr)] md:gap-8 md:pb-14 md:pt-20">
          <div className="grid items-end gap-5 md:grid-cols-12">
            <div className="md:col-span-7">
              <p className="flex gap-4 font-mono text-xs text-mute">
                <span style={{ color: p.tint }}>0{i + 1}</span>
                <span>{p.kind}</span>
                <span>{p.year}</span>
              </p>
              <h3 translate="no" className="font-display mt-3 text-[clamp(3rem,min(8.5vw,14dvh),8.5rem)] font-medium leading-[0.88] tracking-[-0.045em]">
                {p.title}
              </h3>
            </div>
            <div className="space-y-4 md:col-span-4 md:col-start-9">
              <p className="max-w-[34ch] text-lg leading-snug text-ink/90 md:text-xl">{p.summary}</p>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                {p.url && (
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noreferrer"
                    className="press group inline-flex items-center gap-3 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper"
                  >
                    Visit {new URL(p.url).hostname.replace("www.", "")}
                    <Arrow />
                  </a>
                )}
                <span className="font-mono text-xs text-ink/80">{p.role}</span>
              </div>
            </div>
          </div>

          <div className="grid min-h-0 gap-8 md:grid-cols-12 md:gap-10">
            <div className="flex min-h-0 flex-col justify-between gap-6 md:col-span-4 md:max-lg:col-span-5">
              <ol className="space-y-4 text-[0.95rem] leading-relaxed text-ink/75 md:[@media(max-height:820px)]:space-y-3 md:[@media(max-height:820px)]:text-[0.85rem]">
                {p.notes.map((n, j) => (
                  <li
                    key={j}
                    className={`grid grid-cols-[2rem_1fr] border-t border-line/70 pt-3 ${j > 2 ? "md:[@media(max-height:740px)]:hidden" : ""}`}
                  >
                    <span className="font-mono text-xs leading-6 text-mute">{String(j + 1).padStart(2, "0")}</span>
                    <span>{n}</span>
                  </li>
                ))}
              </ol>
              <p className="font-mono text-xs leading-relaxed text-mute">{p.stack.join(" · ")}</p>
            </div>

            <div className="relative max-md:order-first md:col-span-8 md:min-h-0 md:max-lg:col-span-7">
              <Media p={p} />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function Media({ p }: { p: Project }) {
  const Demo = demos[p.visual];
  return (
    <div
      data-clip
      className="absolute inset-0 overflow-hidden rounded-xl border border-ink/10 shadow-[0_1px_2px_0_rgb(23_21_15/0.06),0_24px_48px_-24px_rgb(23_21_15/0.25)] max-md:relative max-md:aspect-[16/11]"
    >
      <Demo />
    </div>
  );
}

export function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      className={`size-3.5 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M4.5 11.5 11.5 4.5M5.5 4.5h6v6" />
    </svg>
  );
}
