import HeroCanvas from "./HeroCanvas";

export default function Hero() {
  return (
    <section id="top" className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-ink">
      <HeroCanvas />
      <div data-hero-content className="gutter pointer-events-none relative z-10 mt-auto pb-5 pt-32 md:pb-7">
        <div className="mb-8 grid items-end gap-6 md:mb-12 md:grid-cols-12">
          <p data-intro className="max-w-[30ch] text-xl leading-snug text-bone md:col-span-5 md:text-2xl">
            I design and build web products end to end: the database policy, the API, and the last easing curve on
            the button.
          </p>
        </div>

        <h1
          data-kinetic
          className="font-display pointer-events-auto -ml-[0.04em] whitespace-nowrap text-[clamp(4.25rem,17.2vw,20rem)] font-medium leading-[0.86] tracking-[-0.045em] max-sm:whitespace-normal max-sm:text-[27vw]"
        >
          Joan Solé
        </h1>

        <div data-intro-line className="mt-5 h-px bg-line md:mt-7" />
        <div className="mt-4 flex justify-between gap-4 font-mono text-xs text-mute">
          <span data-intro>Fullstack developer at TheEtailers</span>
          <span data-intro className="hidden md:block">
            Computer Engineering, FIB · UPC
          </span>
          <span data-intro>Scroll</span>
        </div>
      </div>
    </section>
  );
}
