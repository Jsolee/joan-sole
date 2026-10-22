import Image from "next/image";
import Clock from "@/components/Clock";
import Composer from "@/components/Composer";
import Hero from "@/components/Hero";
import Motion from "@/components/Motion";
import MotionToggle from "@/components/MotionToggle";
import Nav from "@/components/Nav";
import Receipts from "@/components/Receipts";
import Scene from "@/components/Scene";
import Work, { Arrow } from "@/components/Work";
import WorkIndex from "@/components/WorkIndex";
import { contact, disciplines, experience, marquee } from "@/content";

export default function Home() {
  return (
    <>
      <a
        href="#about"
        className="fixed left-3 top-3 z-[80] -translate-y-16 rounded-full bg-ink px-4 py-2 text-sm text-paper focus-visible:translate-y-0"
      >
        Skip to content
      </a>
      <Preloader />
      <Scene />
      <Nav />
      <main>
        <Hero />
        <About />
        <Work />
        <Receipts />
        <WorkIndex />
        <Marquee />
        <Capabilities />
        <Experience />
        <Contact />
      </main>
      <Motion />
    </>
  );
}

function Preloader() {
  return (
    <div aria-hidden className="preloader gutter fixed inset-0 z-[70] flex flex-col justify-between bg-ink py-5 font-mono text-xs text-paper/55">
      <div className="flex justify-between">
        <span>Joan Solé</span>
        <span>Portfolio 2026</span>
      </div>
      <span className="seed absolute left-1/2 top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-signal" />
      <div className="flex items-end justify-between gap-6">
        <span>Fullstack developer, Barcelona</span>
        <span className="flex items-center gap-4">
          <span className="hidden gap-[5px] sm:flex">
            {Array.from({ length: 24 }, (_, i) => (
              <span key={i} data-dot className="size-1 rounded-full bg-paper/15 transition-colors duration-150 [&.on]:bg-paper" />
            ))}
          </span>
          <span data-count className="tabular-nums text-paper">
            000
          </span>
        </span>
      </div>
    </div>
  );
}

function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="gutter relative pb-28 pt-32 md:min-h-[115dvh] md:pb-40 md:pt-48">
      <h2 id="about-title" className="sr-only">
        About
      </h2>
      <div className="grid gap-10 md:grid-cols-12">
        <figure data-fade className="md:hidden">
          <div className="relative aspect-[4/5] w-28 overflow-hidden sm:w-36">
            <Image src="/portrait-dots.webp" alt="Portrait of Joan Solé" fill sizes="144px" className="object-cover" />
          </div>
        </figure>
        <div className="md:col-span-7">
          <p className="font-mono text-xs text-mute">(About)</p>
          <p
            data-scrub-words
            className="font-display mt-6 text-[clamp(1.75rem,3.3vw,3.4rem)] leading-[1.08] tracking-[-0.03em]"
          >
            I&rsquo;m Joan. I build generative AI products at <span translate="no">TheEtailers</span> and study
            Computer Engineering at FIB. A lot of my favorite work never shows up in a screenshot, like a security
            policy on every table or a polling loop that stopped flooding the database. The rest is type and motion,
            which I fuss over more than I probably should.
          </p>
          <dl className="mt-16 grid gap-8 text-[0.95rem] leading-relaxed sm:grid-cols-3 md:mt-24">
            {[
              ["Education", "Computer Engineering at FIB, Universitat Politècnica de Catalunya."],
              ["Languages", "Catalan and Spanish, native. English, C1."],
              [
                "Workflow",
                "I build with Claude Code and keep a knowledge base of decisions, incidents and lessons that every project adds to.",
              ],
            ].map(([k, v]) => (
              <div key={k} data-fade className="border-t border-line/70 pt-4">
                <dt className="font-mono text-xs text-mute">{k}</dt>
                <dd className="mt-2 text-pretty text-ink/80">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

function Marquee() {
  const row = [...marquee, ...marquee];
  return (
    <div aria-hidden className="overflow-hidden border-y border-line/70 py-6 md:py-10">
      {(["ltr", "rtl"] as const).map((dir) => (
        <div key={dir} data-marquee={dir} className="flex w-max items-center">
          {row.map((w, i) => (
            <span key={i} className="flex items-center">
              <span
                className={`font-display px-5 text-[clamp(2.75rem,7.5vw,7rem)] leading-[1.05] tracking-[-0.04em] md:px-8 ${
                  dir === "rtl" ? "text-transparent [-webkit-text-stroke:1px_var(--color-mute)]" : "text-ink"
                }`}
                style={dir === "rtl" ? undefined : { ["--wdth" as string]: 112 }}
              >
                {w}
              </span>
              <span className="size-2 rounded-full bg-signal md:size-3" />
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

function Capabilities() {
  return (
    <section id="capabilities" aria-labelledby="cap-title" className="gutter pb-24 pt-28 md:pb-36 md:pt-44">
      <div className="grid gap-10 md:grid-cols-12">
        <div className="self-start md:sticky md:top-28 md:col-span-4">
          <h2 id="cap-title" data-reveal className="font-display text-balance text-[clamp(2.5rem,6vw,6rem)] leading-[0.9] tracking-[-0.04em]">
            What I do
          </h2>
          <p data-fade className="mt-6 max-w-[34ch] text-ink/70">
            I work across the stack. The projects I enjoy most need a careful interface and a database that
            won&rsquo;t fall over.
          </p>
        </div>
        <ol className="md:col-span-7 md:col-start-6">
          {disciplines.map((d, i) => (
            <li key={d.title} data-fade className="grid grid-cols-[2.5rem_1fr] border-t border-line/70 py-8 md:grid-cols-[4rem_1fr] md:py-11">
              <span className="font-mono text-xs leading-9 text-mute">0{i + 1}</span>
              <div>
                <h3 className="font-display text-[clamp(1.75rem,3vw,2.75rem)] leading-tight tracking-[-0.03em]">{d.title}</h3>
                <p className="mt-3 max-w-[52ch] text-pretty text-ink/70">{d.body}</p>
                <p className="mt-5 font-mono text-xs text-mute">{d.tools.join(" · ")}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Experience() {
  const rows = [
    ...experience,
    {
      years: "2021 – now",
      org: "FIB · UPC",
      role: "B.Sc. Computer Engineering",
      note: "Universitat Politècnica de Catalunya, in progress.",
    },
  ];
  return (
    <section id="experience" aria-labelledby="exp-title" className="gutter pb-32 md:pb-48">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6 md:mb-16">
        <h2 id="exp-title" data-reveal className="font-display text-[clamp(2.5rem,6vw,6rem)] leading-[0.9] tracking-[-0.04em]">
          Experience
        </h2>
        <a
          data-fade
          href={contact.cv}
          target="_blank"
          rel="noopener"
          className="press group inline-flex items-center gap-3 rounded-full bg-ink py-2 pl-5 pr-2 text-sm font-medium text-paper"
        >
          Full CV
          <span className="font-mono text-xs text-paper/60">PDF · 76&nbsp;KB</span>
          <span className="grid size-8 place-items-center rounded-full bg-paper/10 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-y-0.5">
            <svg aria-hidden viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M8 2.5v8M4.5 7 8 10.5 11.5 7M3 13.5h10" />
            </svg>
          </span>
        </a>
      </div>
      <ul className="border-b border-line/70">
        {rows.map((r) => (
          <li key={r.org} data-fade className="grid gap-x-6 gap-y-1 border-t border-line/70 py-6 md:grid-cols-12 md:items-baseline md:py-8">
            <span className="font-mono text-xs text-mute md:col-span-2">{r.years}</span>
            <span translate="no" className="font-display text-[clamp(1.6rem,2.8vw,2.6rem)] leading-tight tracking-[-0.03em] md:col-span-4">
              {r.org}
            </span>
            <span className="text-ink/90 md:col-span-3">{r.role}</span>
            <span className="text-[0.95rem] text-ink/60 md:col-span-3">{r.note}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Contact() {
  const links = [
    ["LinkedIn", contact.linkedin],
    ["GitHub", contact.github],
    ["CV (PDF)", contact.cv],
  ];
  return (
    <section id="contact" aria-labelledby="contact-title" className="relative overflow-hidden bg-signal text-paper">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-[18vw] top-[6vh] size-[80vw] rounded-full opacity-25 md:-right-[6vw] md:size-[46vw]"
        style={{
          backgroundImage: "radial-gradient(var(--color-paper) 1.6px, transparent 2px)",
          backgroundSize: "13px 13px",
          maskImage: "radial-gradient(circle at 38% 36%, black 0%, transparent 68%)",
        }}
      />
      <div className="gutter relative flex min-h-[100dvh] flex-col pb-6 pt-28 md:pt-36">
        <p className="font-mono text-xs">(Contact)</p>
        <h2
          id="contact-title"
          data-reveal
          className="font-display mt-6 text-[clamp(4.5rem,16vw,17rem)] font-medium leading-[0.84] tracking-[-0.055em]"
        >
          Let&rsquo;s talk.
        </h2>

        <div className="mt-12 grid items-start gap-12 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-5">
            <p className="max-w-[34ch] text-pretty text-lg leading-snug md:text-xl">
              Hiring, building something, or curious how the dots on this page work? Write to me. I answer every
              email.
            </p>
            <a
              href={`mailto:${contact.email}`}
              className="link-line font-display mt-6 inline-block break-all text-[clamp(1.5rem,2.6vw,2.5rem)] leading-tight tracking-[-0.03em]"
            >
              {contact.email}
            </a>
            <ul className="mt-10 max-w-sm space-y-1 font-mono text-sm">
              {links.map(([label, href]) => (
                <li key={label}>
                  <a href={href} target="_blank" rel="noreferrer" className="group flex items-center justify-between border-t border-paper/30 py-3">
                    {label}
                    <Arrow />
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div data-fade className="md:col-span-6 md:col-start-7 md:-mt-[5vw]">
            <Composer email={contact.email} />
          </div>
        </div>

        <footer className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-paper/30 pt-5 font-mono text-xs max-md:mt-20">
          <span>© 2026 Joan Solé</span>
          <span className="flex gap-2">
            Barcelona <Clock />
          </span>
          <MotionToggle />
          <span>Next.js, GSAP and three.js. Set in Archivo and Geist.</span>
        </footer>
      </div>
    </section>
  );
}
