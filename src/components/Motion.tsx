"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

const q = <T extends Element = HTMLElement>(s: string) => gsap.utils.toArray<T>(s);

const markIntroDone = () => {
  (window as Window & { __introDone?: boolean }).__introDone = true;
  dispatchEvent(new Event("portfolio:intro"));
};

// ponytail: one page, one orchestrator. Sections stay server-rendered and opt in through data attributes.
export default function Motion() {
  useGSAP(() => {
    const mm = gsap.matchMedia();

    ScrollTrigger.create({
      trigger: "#contact",
      start: "top 32px",
      end: "bottom 32px",
      toggleClass: { targets: "[data-nav]", className: "on-signal" },
    });

    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set(".preloader", { display: "none" });
      markIntroDone();
    });

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const lenis = new Lenis({ autoRaf: false, anchors: { offset: 0 }, lerp: 0.11 });
      lenis.on("scroll", ScrollTrigger.update);
      const tick = (t: number) => lenis.raf(t * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      intro(lenis);
      reveals();
      scrubWords();
      stackCards();
      parallax();
      marquee();
      const offs = [kineticName(), magnetic()];

      return () => {
        offs.forEach((off) => off?.());
        gsap.ticker.remove(tick);
        lenis.destroy();
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

function intro(lenis: Lenis) {
  const pre = document.querySelector<HTMLElement>(".preloader");
  const chars = SplitText.create("[data-kinetic]", {
    type: "lines,chars",
    mask: "lines",
    linesClass: "line",
    charsClass: "char",
  }).chars;

  const seen = seenIntro();
  const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

  if (pre && !seen) {
    lenis.stop();
    const count = pre.querySelector("[data-count]");
    const dots = pre.querySelectorAll("[data-dot]");
    const n = { v: 0 };
    tl.to(n, {
      v: 100,
      duration: 1.3,
      ease: "power2.inOut",
      onUpdate: () => {
        if (count) count.textContent = String(Math.round(n.v)).padStart(3, "0");
      },
    })
      .to(dots, { opacity: 1, duration: 0.01, stagger: 1.2 / dots.length }, 0)
      .to(pre, { clipPath: "inset(0 0 100% 0)", duration: 0.9, ease: "expo.inOut" }, "+=0.1")
      .add(() => lenis.start(), "-=0.4");
  } else {
    if (pre) gsap.set(pre, { display: "none" });
    lenis.start();
  }

  tl.add(markIntroDone, pre && !seen ? "-=0.5" : 0)
    .from(chars, { yPercent: 115, duration: 1.4, stagger: 0.045 }, "<")
    .from("[data-intro]", { y: 24, opacity: 0, duration: 1.2, stagger: 0.08 }, "<0.3")
    .from("[data-intro-line]", { scaleX: 0, transformOrigin: "left", duration: 1.6 }, "<")
    .add(() => {
      if (pre) gsap.set(pre, { display: "none" });
    });
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
      { clipPath: "inset(18% 12% 18% 12% round 1.5rem)" },
      {
        clipPath: "inset(0% 0% 0% 0% round 0.75rem)",
        ease: "none",
        scrollTrigger: { trigger: el, start: "top 95%", end: "top 35%", scrub: true },
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

// Marquee rows speed up and flip direction with scroll velocity.
function marquee() {
  q("[data-marquee]").forEach((row) => {
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
        const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 250, 6);
        gsap.to(loop, { timeScale: boost * self.direction, duration: 0.2, overwrite: true });
        gsap.to(loop, { timeScale: self.direction, duration: 1.2, delay: 0.2, ease: "power2.out" });
      },
    });
  });
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
