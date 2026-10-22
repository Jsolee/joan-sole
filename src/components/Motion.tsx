"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

const q = <T extends Element = HTMLElement>(s: string) => gsap.utils.toArray<T>(s);

// ponytail: one page, one orchestrator. Sections stay server-rendered and opt in through data attributes.
export default function Motion() {
  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set(".preloader", { display: "none" });
    });

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const lenis = new Lenis({ autoRaf: false, anchors: { offset: 0 }, lerp: 0.11 });
      lenis.on("scroll", ScrollTrigger.update);
      const tick = (t: number) => lenis.raf(t * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      const w = window as Window & { __lenis?: Lenis };
      w.__lenis = lenis;

      const offs = [intro(lenis), kineticName(), magnetic(), marquee()];
      reveals();
      scrubWords();
      stackCards();
      parallax();
      receipts();

      return () => {
        offs.forEach((off) => off?.());
        gsap.ticker.remove(tick);
        lenis.destroy();
        delete w.__lenis;
      };
    });
  });

  return null;
}

// Read once per page load, so StrictMode's double effect doesn't count as a second visit.
let seenCache: boolean | undefined;
function seenIntro() {
  if (seenCache === undefined) {
    try {
      seenCache = sessionStorage.getItem("intro") === "1";
      sessionStorage.setItem("intro", "1");
    } catch {
      seenCache = false;
    }
  }
  return seenCache;
}

// The ink sheet waits for WebGL, then hands over to it. The scene starts as the same black,
// with the particles scattered like stars; they gather into the knot while the counter climbs,
// the name prints itself in dots, and the sheet clears from the centre with a vermilion edge.
function intro(lenis: Lenis) {
  const pre = document.querySelector<HTMLElement>(".preloader");
  const count = pre?.querySelector("[data-count]");
  const dots = pre ? gsap.utils.toArray<HTMLElement>("[data-dot]", pre) : [];
  const chars = SplitText.create("[data-kinetic]", {
    type: "lines,words,chars",
    mask: "lines",
    linesClass: "line",
    charsClass: "char",
  }).chars;

  const seen = seenIntro();
  const skip = scrollY > innerHeight * 0.5; // reloaded mid-page: no show
  lenis.stop();
  gsap.set(chars, { yPercent: 115 });
  gsap.set("[data-intro]", { y: 24, opacity: 0 });
  gsap.set("[data-intro-line]", { scaleX: 0, transformOrigin: "left" });
  gsap.set("[data-nav]", { opacity: 0 });

  const n = { v: 0 };
  let lit = -1;
  const showCount = () => {
    if (count) count.textContent = String(Math.round(n.v)).padStart(3, "0");
    const next = Math.round((n.v / 100) * dots.length);
    if (next !== lit) {
      lit = next;
      dots.forEach((d, i) => d.classList.toggle("on", i < lit));
    }
  };
  const loading = gsap.to(n, { v: 36, duration: 1.2, ease: "power2.out", onUpdate: showCount });

  let started = false;
  let usedHero = false;
  const go = () => {
    if (started) return;
    started = true;
    loading.kill();
    const hero = window.__hero;
    usedHero = !!hero;
    const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

    if (hero && pre) {
      const gather = seen ? 1.1 : 1.9;
      const wipe = seen ? 1.0 : 1.3;
      tl.to(pre, { backgroundColor: "rgba(23, 21, 15, 0)", duration: 0.6, ease: "power1.out" })
        .to(pre.querySelector(".seed"), { opacity: 0, duration: 0.4 }, "<")
        .to(hero, { assemble: 1, duration: gather, ease: "power3.inOut" }, "<")
        .to(n, { v: 100, duration: gather, ease: "power3.inOut", onUpdate: showCount }, "<")
        .to(hero, { name: 1, duration: gather * 0.45, ease: "power1.in" }, `<${gather * 0.55}`)
        .to(pre, { opacity: 0, duration: 0.35, ease: "power1.out" })
        .set(pre, { display: "none" })
        .to(hero, { curtain: 1, duration: wipe, ease: "power2.inOut" }, "<")
        .to(hero, { scale: 1, duration: wipe, ease: "power2.inOut" }, "<")
        .to(chars, { yPercent: 0, duration: 1.3, stagger: 0.04 }, `<${wipe * 0.6}`)
        .to(hero, { name: 0, duration: 0.8, ease: "power1.inOut" }, "<0.4");
    } else {
      tl.to(n, { v: 100, duration: 0.3, ease: "power1.out", onUpdate: showCount })
        .to(pre, { clipPath: "inset(0 0 100% 0)", duration: 0.9, ease: "expo.inOut" })
        .to(chars, { yPercent: 0, duration: 1.3, stagger: 0.04 }, "<0.4")
        .set(pre, { display: "none" });
    }
    tl.to("[data-intro]", { y: 0, opacity: 1, duration: 1.2, stagger: 0.08 }, "<0.2")
      .to("[data-intro-line]", { scaleX: 1, duration: 1.6 }, "<")
      .to("[data-nav]", { opacity: 1, duration: 0.8, ease: "power1.out" }, "<")
      .add(() => lenis.start(), "<");
    if (skip) tl.progress(1, false);
  };

  // WebGL arrived after the fallback already played: show the finished scene, not the ink sheet.
  const ready = () => {
    if (!started) gsap.delayedCall(seen || skip ? 0.05 : 0.25, go);
    else if (!usedHero && window.__hero) Object.assign(window.__hero, { curtain: 1, scale: 1, name: 0, assemble: 1 });
  };
  if (window.__hero) ready();
  else addEventListener("hero:ready", ready);
  gsap.delayedCall(3.5, go);

  return () => removeEventListener("hero:ready", ready);
}

// Letters near the cursor stretch on the variable width axis.
function kineticName() {
  const name = document.querySelector<HTMLElement>("[data-kinetic]");
  if (!name || !matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  const hero = name.closest("section") ?? document.body;

  const onMove = (e: PointerEvent) => {
    const chars = name.querySelectorAll<HTMLElement>(".char");
    chars.forEach((c) => {
      const r = c.getBoundingClientRect();
      const d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
      const pull = gsap.utils.clamp(0, 1, 1 - d / (innerWidth * 0.32));
      gsap.to(c, { "--wdth": 78 + pull * 47, duration: 0.7, ease: "power3.out", overwrite: "auto" });
    });
  };
  const onLeave = () =>
    gsap.to(name.querySelectorAll(".char"), { "--wdth": 100, duration: 1.1, ease: "expo.out", overwrite: "auto" });

  hero.addEventListener("pointermove", onMove);
  hero.addEventListener("pointerleave", onLeave);
  return () => {
    hero.removeEventListener("pointermove", onMove);
    hero.removeEventListener("pointerleave", onLeave);
  };
}

function reveals() {
  q("[data-reveal]").forEach((el) => {
    SplitText.create(el, {
      type: "lines",
      mask: "lines",
      linesClass: "line",
      autoSplit: true,
      onSplit: (self) =>
        gsap.from(self.lines, {
          yPercent: 105,
          duration: 1.2,
          ease: "expo.out",
          stagger: 0.07,
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        }),
    });
  });

  ScrollTrigger.batch("[data-fade]", {
    start: "top 90%",
    once: true,
    onEnter: (els) =>
      gsap.fromTo(
        els,
        { y: 28, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.1, ease: "expo.out", stagger: 0.06, overwrite: true, clearProps: "opacity,transform" },
      ),
  });
  gsap.set("[data-fade]", { opacity: 0 });

  q("[data-clip]").forEach((el) =>
    gsap.fromTo(
      el,
      { clipPath: "inset(10% 8% 10% 8% round 1.5rem)" },
      {
        // Time-based, not scrubbed: a sticky card can stop before any scroll point, the reveal must still finish.
        clipPath: "inset(0% 0% 0% 0% round 0.75rem)",
        duration: 1.4,
        ease: "expo.out",
        scrollTrigger: { trigger: el, start: "top 90%", toggleActions: "play none none reverse" },
      },
    ),
  );
}

function scrubWords() {
  q("[data-scrub-words]").forEach((el) => {
    SplitText.create(el, {
      type: "words",
      autoSplit: true,
      onSplit: (self) =>
        gsap.fromTo(
          self.words,
          { opacity: 0.14 },
          {
            opacity: 1,
            stagger: 0.1,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 45%", scrub: true },
          },
        ),
    });
  });
}

// Sticky cards: each one sinks back as the next slides over it.
function stackCards() {
  const cards = q("[data-stack-card]");
  cards.forEach((card, i) => {
    const next = cards[i + 1];
    if (!next) return;
    const inner = card.querySelector("[data-stack-inner]");
    const shade = card.querySelector("[data-stack-shade]");
    gsap
      .timeline({
        scrollTrigger: { trigger: next, start: "top bottom", end: "top top", scrub: true },
      })
      .to(inner, { scale: 0.9, yPercent: -4, ease: "none" }, 0)
      .to(shade, { opacity: 0.75, ease: "none" }, 0);
  });
}

function parallax() {
  q("[data-parallax]").forEach((el) => {
    const amount = Number(el.dataset.parallax) || 12;
    gsap.fromTo(
      el,
      { yPercent: -amount },
      {
        yPercent: amount,
        ease: "none",
        scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true },
      },
    );
  });

  const hero = document.querySelector("[data-hero-content]");
  if (hero)
    gsap.to(hero, {
      yPercent: 30,
      opacity: 0,
      ease: "none",
      scrollTrigger: { trigger: hero.closest("section"), start: "top top", end: "bottom top", scrub: true },
    });
}

// Marquee rows speed up and flip direction with scroll velocity, and stop when motion is paused.
function marquee() {
  const loops = q("[data-marquee]").map((row) => {
    const dir = row.dataset.marquee === "rtl" ? 1 : -1;
    const loop = gsap.fromTo(
      row,
      { xPercent: dir < 0 ? 0 : -50 },
      { xPercent: dir < 0 ? -50 : 0, duration: 38, ease: "none", repeat: -1 },
    );
    ScrollTrigger.create({
      trigger: row,
      start: "top bottom",
      end: "bottom top",
      onUpdate: (self) => {
        if (loop.paused()) return;
        const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 250, 6);
        gsap.to(loop, { timeScale: boost * self.direction, duration: 0.2, overwrite: true });
        gsap.to(loop, { timeScale: self.direction, duration: 1.2, delay: 0.2, ease: "power2.out" });
      },
    });
    return loop;
  });
  const sync = () => {
    const off = document.documentElement.dataset.motion === "off";
    loops.forEach((l) => l.paused(off));
  };
  sync();
  addEventListener("motion:change", sync);
  return () => removeEventListener("motion:change", sync);
}

// Receipts: counters run from a starting value, cell grids fill in, bars and lines draw.
function receipts() {
  const once = (trigger: Element) => ({ trigger, start: "top 85%", once: true });

  q("[data-count-to]").forEach((el) => {
    const to = Number(el.dataset.countTo);
    const from = Number(el.dataset.countFrom ?? 0);
    const decimals = Number(el.dataset.decimals ?? 0);
    const fmt = new Intl.NumberFormat("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    const n = { v: from };
    el.textContent = fmt.format(from);
    gsap.to(n, {
      v: to,
      duration: 1.8,
      ease: "power3.out",
      scrollTrigger: once(el),
      onUpdate: () => {
        el.textContent = fmt.format(n.v);
      },
    });
  });

  q("[data-fill]").forEach((grid) =>
    gsap.from(grid.querySelectorAll("[data-cell]"), {
      opacity: 0.1,
      duration: 0.5,
      ease: "power1.out",
      stagger: { amount: 1.2, from: "start" },
      scrollTrigger: once(grid),
    }),
  );

  q("[data-bar]").forEach((bar) =>
    gsap.fromTo(
      bar,
      { scaleX: Number(bar.dataset.barFrom) },
      { scaleX: Number(bar.dataset.barTo), duration: 1.8, ease: "power3.inOut", scrollTrigger: once(bar) },
    ),
  );

  q<SVGPathElement>("[data-draw]").forEach((path, i) =>
    gsap.fromTo(
      path,
      { strokeDasharray: 1, strokeDashoffset: 1 },
      {
        strokeDashoffset: 0,
        duration: 1.4,
        delay: (i % 2) * 1.2,
        ease: i % 2 ? "power2.out" : "power1.in",
        scrollTrigger: once(path),
      },
    ),
  );
}

function magnetic() {
  if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  const offs: (() => void)[] = [];
  q("[data-magnetic]").forEach((el) => {
    const strength = Number(el.dataset.magnetic) || 0.3;
    const x = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3.out" });
    const y = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3.out" });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      x((e.clientX - r.left - r.width / 2) * strength);
      y((e.clientY - r.top - r.height / 2) * strength);
    };
    const leave = () => {
      x(0);
      y(0);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    offs.push(() => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    });
  });
  return () => offs.forEach((f) => f());
}
