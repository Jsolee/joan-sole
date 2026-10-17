import Clock from "@/components/Clock";
import CopyEmail from "@/components/CopyEmail";
import Hero from "@/components/Hero";
import Motion from "@/components/Motion";
import Work, { Arrow } from "@/components/Work";
import WorkIndex from "@/components/WorkIndex";
import { contact, disciplines, experience, marquee } from "@/content";

export default function Home() {
  return (
    <>
      <Preloader />
      <Nav />
      <main>
        <Hero />
        <About />
        <Work />
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
    <div
      aria-hidden
      className="preloader gutter fixed inset-0 z-[70] flex flex-col justify-between bg-ink-2 py-5"
      style={{ clipPath: "inset(0 0 0 0)" }}
    >
      <div className="flex justify-between font-mono text-xs text-mute">
        <span>Joan Solé</span>
        <span>Portfolio 2026</span>
      </div>
      <div className="flex items-end justify-between gap-6">
        <div className="mb-[0.6em] flex gap-1.5 sm:gap-2">
          {Array.from({ length: 12 }, (_, i) => (
            <span key={i} data-dot className="size-1.5 rounded-full bg-signal opacity-15 sm:size-2" />
          ))}
        </div>
        <span data-count className="font-display text-[clamp(5rem,17vw,15rem)] leading-[0.8] tracking-[-0.05em] tabular-nums">
          000
        </span>
      </div>
    </div>
  );
}

function Nav() {
  const links = [
    ["Work", "#work"],
    ["About", "#about"],
    ["Contact", "#contact"],
  ];
  return (
    <header data-nav className="fixed inset-x-0 top-0 z-50 text-bone transition-colors duration-500">
      <nav aria-label="Main" className="gutter flex items-center justify-between py-5 font-mono text-xs">
        <a href="#top" className="roll">
          <span>Joan Solé</span>
        </a>
        <span className="hidden gap-2 opacity-60 md:flex">
          Barcelona <Clock />
        </span>
        <ul className="flex gap-5 sm:gap-7">
          {links.map(([label, href]) => (
            <li key={href}>
              <a href={href} className="roll">
                <span>{label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

function About() {
  return (
    <section id="about" aria-label="About" className="gutter relative bg-ink pb-28 pt-32 md:pb-40 md:pt-48">
      <div className="grid gap-10 md:grid-cols-12">
        <p className="font-mono text-xs text-mute md:col-span-3">(About)</p>
        <p
          data-scrub-words
          className="font-display text-[clamp(1.75rem,3.7vw,3.75rem)] leading-[1.08] tracking-[-0.03em] md:col-span-9"
        >
          I&rsquo;m Joan, a developer in Barcelona building generative AI products at TheEtailers. I like the parts
          nobody screenshots: row-level security, request budgets, a page that comes back in 64 milliseconds. And the
          parts everybody notices: type, motion, and how a button feels under your thumb.
        </p>
      </div>

      <dl className="mt-20 grid gap-8 text-[0.95rem] leading-relaxed md:mt-28 md:grid-cols-12">
        {[
          ["Education", "Computer Engineering at FIB, Universitat Politècnica de Catalunya."],
          ["Languages", "Catalan and Spanish, native. English, C1."],
          [
            "Workflow",
            "Claude Code as my main tool, backed by a knowledge base of decisions, incidents and lessons that every project feeds.",
          ],
        ].map(([k, v], i) => (
          <div key={k} data-fade className={`border-t border-line/70 pt-4 md:col-span-3 ${i === 0 ? "md:col-start-4" : ""}`}>
            <dt className="font-mono text-xs text-mute">{k}</dt>
            <dd className="mt-2 text-bone/80">{v}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function Marquee() {
  const row = [...marquee, ...marquee];
  return (
    <div aria-hidden className="overflow-hidden border-y border-line/70 bg-ink py-6 md:py-10">
      {(["ltr", "rtl"] as const).map((dir) => (
        <div key={dir} data-marquee={dir} className="flex w-max items-center">
          {row.map((w, i) => (
            <span key={i} className="flex items-center">
              <span
                className={`font-display px-5 text-[clamp(2.75rem,7.5vw,7rem)] leading-[1.05] tracking-[-0.04em] md:px-8 ${
                  dir === "rtl" ? "text-transparent [-webkit-text-stroke:1px_var(--color-mute)]" : "text-bone"
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
    <section id="capabilities" aria-labelledby="cap-title" className="gutter bg-ink pb-24 pt-28 md:pb-36 md:pt-44">
      <div className="grid gap-10 md:grid-cols-12">
        <div className="self-start md:sticky md:top-28 md:col-span-4">
          <h2 id="cap-title" data-reveal className="font-display text-[clamp(2.5rem,6vw,6rem)] leading-[0.9] tracking-[-0.04em]">
            What I do
          </h2>
          <p data-fade className="mt-6 max-w-[34ch] text-bone/70">
            Product engineering across the whole stack. I&rsquo;m at my best where interface craft and solid systems
            have to meet.
          </p>
        </div>
        <ol className="md:col-span-7 md:col-start-6">
          {disciplines.map((d, i) => (
            <li key={d.title} data-fade className="grid grid-cols-[2.5rem_1fr] border-t border-line/70 py-8 md:grid-cols-[4rem_1fr] md:py-11">
              <span className="font-mono text-xs leading-9 text-mute">0{i + 1}</span>
              <div>
                <h3 className="font-display text-[clamp(1.75rem,3vw,2.75rem)] leading-tight tracking-[-0.03em]">{d.title}</h3>
                <p className="mt-3 max-w-[52ch] text-bone/70">{d.body}</p>
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
    <section id="experience" aria-labelledby="exp-title" className="gutter bg-ink pb-32 md:pb-48">
      <h2 id="exp-title" data-reveal className="font-display mb-10 text-[clamp(2.5rem,6vw,6rem)] leading-[0.9] tracking-[-0.04em] md:mb-16">
        Experience
      </h2>
      <ul className="border-b border-line/70">
        {rows.map((r) => (
          <li key={r.org} data-fade className="grid gap-x-6 gap-y-1 border-t border-line/70 py-6 md:grid-cols-12 md:items-baseline md:py-8">
            <span className="font-mono text-xs text-mute md:col-span-2">{r.years}</span>
            <span className="font-display text-[clamp(1.6rem,2.8vw,2.6rem)] leading-tight tracking-[-0.03em] md:col-span-4">
              {r.org}
            </span>
            <span className="text-bone/90 md:col-span-3">{r.role}</span>
            <span className="text-[0.95rem] text-bone/60 md:col-span-3">{r.note}</span>
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
  ];
  return (
    <section id="contact" aria-labelledby="contact-title" className="relative overflow-hidden bg-signal text-ink">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-[18vw] top-[6vh] size-[80vw] rounded-full opacity-25 md:-right-[6vw] md:size-[46vw]"
        style={{
          backgroundImage: "radial-gradient(var(--color-ink) 1.6px, transparent 2px)",
          backgroundSize: "13px 13px",
          maskImage: "radial-gradient(circle at 38% 36%, black 0%, transparent 68%)",
        }}
      />
      <div className="gutter relative flex min-h-[100dvh] flex-col pb-6 pt-28 md:pt-40">
        <p className="font-mono text-xs">(Contact)</p>
        <h2
          id="contact-title"
          data-reveal
          className="font-display mt-6 text-[clamp(4.5rem,16vw,17rem)] font-medium leading-[0.84] tracking-[-0.055em]"
        >
          Let&rsquo;s talk.
        </h2>

        <div className="mt-16 grid items-end gap-10 md:mt-auto md:grid-cols-12 md:pt-20">
          <div className="md:col-span-8">
            <p className="max-w-[38ch] text-lg leading-snug md:text-xl">
              Hiring, building something, or curious how the dithering on this page works? My inbox is open.
            </p>
            <a
              href={`mailto:${contact.email}`}
              className="link-line font-display mt-6 inline-block break-all text-[clamp(1.5rem,4.4vw,4.25rem)] leading-tight tracking-[-0.035em]"
            >
              {contact.email}
            </a>
            <div className="mt-6">
              <CopyEmail email={contact.email} />
            </div>
          </div>
          <ul className="space-y-1 font-mono text-sm md:col-span-3 md:col-start-10">
            {links.map(([label, href]) => (
              <li key={label}>
                <a href={href} target="_blank" rel="noreferrer" className="group flex items-center justify-between border-t border-ink/25 py-3">
                  {label}
                  <Arrow />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <footer className="mt-20 flex flex-wrap justify-between gap-3 border-t border-ink/25 pt-5 font-mono text-xs md:mt-24">
          <span>© 2026 Joan Solé</span>
          <span className="flex gap-2">
            Barcelona <Clock />
          </span>
          <span>Next.js, GSAP and three.js. Set in Archivo and Geist.</span>
        </footer>
      </div>
    </section>
  );
}
