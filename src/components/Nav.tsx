"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { contact } from "@/content";
import Clock from "./Clock";

const links = [
  { label: "Work", href: "#work", sections: ["work", "receipts", "index"] },
  { label: "About", href: "#about", sections: ["about", "capabilities"] },
  { label: "Experience", href: "#experience", sections: ["experience"] },
];

const subscribeScroll = (cb: () => void) => {
  addEventListener("scroll", cb, { passive: true });
  addEventListener("resize", cb);
  return () => {
    removeEventListener("scroll", cb);
    removeEventListener("resize", cb);
  };
};
const pastHero = () => scrollY > innerHeight * 0.55;

type LenisLike = { stop(): void; start(): void };
const lenis = () => (window as Window & { __lenis?: LenisLike }).__lenis;

export default function Nav() {
  const scrolled = useSyncExternalStore(subscribeScroll, pastHero, () => false);
  const [active, setActive] = useState(-1);
  const [open, setOpen] = useState(false);
  const list = useRef<HTMLUListElement>(null);
  const highlight = useRef<HTMLUListElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const menuBtn = useRef<HTMLButtonElement>(null);

  // The section crossing the middle of the viewport decides the active link.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          setActive(links.findIndex((l) => l.sections.includes(e.target.id)));
        }
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    document.querySelectorAll("main > section[id]").forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  // A dark copy of the links, clipped down to the active one, slides between items.
  useEffect(() => {
    const ul = list.current;
    const hl = highlight.current;
    if (!ul || !hl) return;
    const li = ul.children[active] as HTMLElement | undefined;
    if (!li) {
      hl.style.clipPath = "inset(0 50% 0 50% round 999px)";
      return;
    }
    const right = ul.offsetWidth - li.offsetLeft - li.offsetWidth;
    hl.style.clipPath = `inset(0 ${right}px 0 ${li.offsetLeft}px round 999px)`;
  }, [active, scrolled]);

  useEffect(() => {
    if (!open) return;
    const trigger = menuBtn.current;
    lenis()?.stop();
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    addEventListener("keydown", onKey);
    return () => {
      removeEventListener("keydown", onKey);
      lenis()?.start();
      trigger?.focus();
    };
  }, [open]);

  return (
    <>
      {/* At the top of the page: a quiet row that inverts over whatever is behind it */}
      <div
        data-nav
        inert={scrolled}
        className="fixed inset-x-0 top-0 z-50 text-paper mix-blend-difference transition-[opacity,transform] duration-500 ease-[var(--ease-out-expo)]"
        style={{ opacity: scrolled ? 0 : 1, transform: scrolled ? "translateY(-100%)" : "none" }}
      >
        <div className="gutter flex items-center justify-between py-4 font-mono text-xs">
          <a href="#top" className="py-1.5" translate="no">
            <span className="roll">
              <span>Joan Solé</span>
            </span>
          </a>
          <span className="hidden gap-2 opacity-60 md:flex">
            Barcelona <Clock />
          </span>
          <ul className="flex gap-5 sm:gap-7">
            {[...links, { label: "Contact", href: "#contact" }].map((l) => (
              <li key={l.href}>
                <a href={l.href} className="group block py-1.5">
                  <span className="roll">
                    <span>{l.label}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Past the hero: a floating capsule */}
      <div className="pointer-events-none fixed inset-x-0 top-3 z-50 flex justify-center px-3">
        <nav
          aria-label="Main"
          inert={!scrolled}
          className="pointer-events-auto flex w-full items-center justify-between gap-1 rounded-full border border-ink/10 bg-paper/80 p-1.5 shadow-[inset_0_1px_0_0_rgb(255_255_255/0.7),0_12px_32px_-12px_rgb(23_21_15/0.28),0_2px_6px_-2px_rgb(23_21_15/0.12)] backdrop-blur-xl transition-[opacity,transform] duration-700 ease-[var(--ease-drawer)] sm:w-auto"
          style={{
            opacity: scrolled ? 1 : 0,
            transform: scrolled ? "none" : "translateY(-140%) scale(0.96)",
          }}
        >
          <a href="#top" className="flex items-center gap-2.5 rounded-full py-0.5 pl-0.5 pr-3">
            <span className="relative size-8 overflow-hidden rounded-full bg-paper-2 ring-1 ring-ink/10">
              <Image src="/portrait-dots.webp" alt="" fill sizes="32px" className="origin-top scale-[1.6] object-cover object-top" />
            </span>
            <span className="text-sm font-medium" translate="no">
              Joan Solé
            </span>
          </a>

          <div className="relative hidden sm:block">
            <ul ref={list} className="flex">
              {links.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="block rounded-full px-4 py-2 text-sm text-ink/65 transition-colors duration-200 hover:text-ink">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
            <ul
              ref={highlight}
              aria-hidden
              className="pointer-events-none absolute inset-0 flex transition-[clip-path] duration-500 ease-[var(--ease-out-expo)]"
              style={{ clipPath: "inset(0 50% 0 50% round 999px)" }}
            >
              {links.map((l) => (
                <li key={l.href} className="rounded-full bg-ink px-4 py-2 text-sm text-paper">
                  {l.label}
                </li>
              ))}
            </ul>
          </div>

          <a
            href="#contact"
            className="press hidden rounded-full bg-signal px-4 py-2 text-sm text-paper transition-colors duration-200 hover:bg-[#a8321a] sm:inline-flex"
          >
            Let’s talk
          </a>
          <button
            ref={menuBtn}
            type="button"
            aria-expanded={open}
            aria-controls="menu"
            onClick={() => setOpen(true)}
            className="press rounded-full bg-ink px-4 py-2 text-sm text-paper sm:hidden"
          >
            Menu
          </button>
        </nav>
      </div>

      {/* Mobile menu */}
      <div
        id="menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        inert={!open}
        className="gutter fixed inset-0 z-[65] flex flex-col bg-ink pb-8 pt-4 text-paper transition-[clip-path] duration-700 ease-[var(--ease-drawer)] sm:hidden"
        style={{ clipPath: open ? "inset(0 0 0 0)" : "inset(0 0 100% 0)" }}
      >
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-paper/60" translate="no">
            Joan Solé
          </span>
          <button ref={closeBtn} type="button" onClick={() => setOpen(false)} className="press rounded-full border border-paper/25 px-4 py-2 text-sm">
            Close
          </button>
        </div>
        <ul className="mt-auto space-y-1">
          {[...links, { label: "Contact", href: "#contact" }].map((l, i) => (
            <li key={l.href} className="overflow-hidden">
              <a
                href={l.href}
                onClick={() => setOpen(false)}
                className="font-display block py-1 text-[17vw] leading-[0.95] tracking-[-0.04em] transition-transform duration-700 ease-[var(--ease-out-expo)]"
                style={{ transform: open ? "none" : "translateY(105%)", transitionDelay: open ? `${120 + i * 60}ms` : "0ms" }}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <a href={`mailto:${contact.email}`} className="mt-10 font-mono text-sm text-paper/70">
          {contact.email}
        </a>
      </div>
    </>
  );
}
