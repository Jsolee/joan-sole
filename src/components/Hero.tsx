const proof = [
  ["Now", "TheEtailers"],
  ["Before", "Bjarke Ingels Group"],
  ["Studying", "FIB · UPC"],
  ["Based in", "Barcelona"],
];

export default function Hero() {
  return (
    <section id="top" className="relative flex min-h-[100dvh] flex-col overflow-hidden">
      <div data-hero-content className="gutter pointer-events-none relative z-10 mt-auto pb-5 pt-32 md:pb-7">
        <div className="mb-8 md:mb-12 md:max-w-[34rem]">
          <p data-intro className="text-pretty text-xl leading-snug text-ink md:text-2xl">
            I build web products from the schema to the last easing curve. Right now that means generative AI tools
            at TheEtailers.
          </p>
          <div data-intro className="pointer-events-auto mt-7 flex flex-wrap gap-3">
            <a
              href="#work"
              className="press group inline-flex items-center gap-2.5 rounded-full bg-ink px-5 py-3 text-sm font-medium text-paper shadow-[0_1px_0_0_rgb(255_255_255/0.12)_inset,0_10px_24px_-10px_rgb(23_21_15/0.5)] transition-colors duration-200 hover:bg-black"
            >
              See selected work
              <svg aria-hidden viewBox="0 0 16 16" className="size-3.5 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-y-0.5" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M8 3v10M3.5 8.5 8 13l4.5-4.5" />
              </svg>
            </a>
            <a
              href="#contact"
              className="press inline-flex items-center rounded-full border border-ink/15 bg-paper/75 px-5 py-3 text-sm font-medium backdrop-blur-sm transition-colors duration-200 hover:border-ink/40"
            >
              Get in touch
            </a>
          </div>
        </div>

        <h1
          data-kinetic
          translate="no"
          className="font-display pointer-events-auto -ml-[0.04em] whitespace-nowrap text-[clamp(4.25rem,17.2vw,20rem)] font-medium leading-[0.86] tracking-[-0.045em] max-sm:whitespace-normal max-sm:text-[27vw]"
        >
          Joan Solé
        </h1>

        <div data-intro-line className="mt-5 h-px bg-line md:mt-7" />
        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 font-mono text-xs md:flex md:justify-between">
          {proof.map(([k, v], i) => (
            <div key={k} data-intro className={`flex gap-2 ${i === 3 ? "max-md:hidden" : ""}`}>
              <dt className="text-mute">{k}</dt>
              <dd translate="no">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
