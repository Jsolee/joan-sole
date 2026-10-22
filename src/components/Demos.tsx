"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Image from "next/image";
import { useRef, type ReactNode } from "react";

gsap.registerPlugin(useGSAP);

/*
 * Product demos for the work cards. Each one is a small app recreated with the product's own
 * colours, copy and assets, playing its core flow on a loop. Everything is sized in cqw of a
 * 16:10 stage, so the scene scales as one piece. Loops only run while on screen.
 */

type Sel = (s: string) => HTMLElement[];
type Build = (tl: gsap.core.Timeline, $: Sel, at: (el: HTMLElement, ox?: number, oy?: number) => gsap.TweenVars) => void;

function useLoop(build: Build) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const root = ref.current!;
      const stage = root.querySelector<HTMLElement>("[data-stage]")!;
      const $ = gsap.utils.selector(root) as Sel;
      // Cursor targets as % of the stage: everything is in cqw, so they hold at any size.
      const at = (el: HTMLElement, ox = 0.5, oy = 0.5) => {
        const s = stage.getBoundingClientRect();
        const r = el.getBoundingClientRect();
        return {
          left: `${((r.left + r.width * ox - s.left) / s.width) * 100}%`,
          top: `${((r.top + r.height * oy - s.top) / s.height) * 100}%`,
        };
      };
      // lazy: false so counters and the typed text read fresh values even when the playhead jumps.
      const tl = gsap.timeline({ repeat: -1, paused: true, defaults: { ease: "power3.out", duration: 0.6, lazy: false } });
      build(tl, $, at);
      tl.seek(0.01, false); // a paused timeline never renders its time-0 sets on its own

      if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
        tl.seek("poster", false);
        return;
      }
      let visible = false;
      const sync = () => (visible && document.documentElement.dataset.motion !== "off" ? tl.play() : tl.pause());
      const io = new IntersectionObserver(([e]) => {
        visible = e.isIntersecting;
        sync();
      });
      io.observe(root);
      addEventListener("motion:change", sync);
      return () => {
        io.disconnect();
        removeEventListener("motion:change", sync);
      };
    },
    { scope: ref },
  );
  return ref;
}

function Stage({ bg, children, loop }: { bg: string; children: ReactNode; loop: ReturnType<typeof useLoop> }) {
  return (
    <div ref={loop} aria-hidden className="relative grid h-full w-full place-items-center overflow-hidden [container-type:size]" style={{ background: bg }}>
      <div data-stage className="relative aspect-[16/10] w-[min(94cqw,150cqh)] select-none [container-type:inline-size]">
        {children}
      </div>
    </div>
  );
}

function Cursor({ fill = "#17150f" }: { fill?: string }) {
  return (
    <svg data-cursor viewBox="0 0 24 24" className="absolute z-30 w-[2.6cqw] drop-shadow-[0_0.3cqw_0.4cqw_rgb(0_0_0/0.25)]" style={{ left: "70%", top: "70%", opacity: 0 }}>
      <path d="M4 2l16 9.5-7 1.5-3.6 6.5z" fill={fill} stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

const press = (tl: gsap.core.Timeline, el: HTMLElement | undefined, t: number | string) =>
  tl.to(el ?? [], { scale: 0.94, duration: 0.1, ease: "power2.out" }, t).to(el ?? [], { scale: 1, duration: 0.25, ease: "power2.out" });

// ---------------------------------------------------------------- Picgenio

function PicgenioMark({ className = "" }: { className?: string }) {
  const big = [
    [1, 0],
    [0, 1],
    [1, 1],
    [2, 1],
    [1, 2],
  ];
  const small = [
    [0, 0],
    [2, 0],
    [0, 2],
    [2, 2],
  ];
  return (
    <svg viewBox="0 0 30 30" className={className}>
      {big.map(([x, y]) => (
        <rect key={`b${x}${y}`} x={x * 10 + 1} y={y * 10 + 1} width="8" height="8" rx="2.4" fill="#F55636" />
      ))}
      {small.map(([x, y]) => (
        <rect key={`s${x}${y}`} x={x * 10 + 3} y={y * 10 + 3} width="4" height="4" rx="1.3" fill="#F55636" />
      ))}
    </svg>
  );
}

export function PicgenioDemo() {
  const words = ["Diseño", "nórdico", "para", "tu", "salón"];
  const loop = useLoop((tl, $, at) => {
    const [body] = $("[data-body]");
    const [cursor] = $("[data-cursor]");
    const [typed] = $("[data-typed]");
    const [caret] = $("[data-caret]");
    const typing = { p: 0 };
    // The caret follows the text as it types, measured live so it survives resizes.
    const type = () => {
      typed.style.clipPath = `inset(0 ${(1 - typing.p) * 100}% 0 0)`;
      caret.style.left = `${typed.offsetLeft + typed.offsetWidth * typing.p}px`;
    };
    const [gen] = $("[data-generate]");
    const [tabVideo] = $("[data-tab-video]");
    const cards = $("[data-result]");
    const scans = $("[data-scan]");
    const [panel] = $("[data-video]");
    const [kb] = $("[data-kenburns]");
    const subs = $("[data-word]");
    const thumbs = $("[data-thumb]");

    tl.set(cards, { clipPath: "inset(0 0 100% 0)" })
      .set(scans, { top: "0%", opacity: 0 })
      .set(typing, { p: 0, onComplete: type })
      .set($("[data-gen-idle]"), { opacity: 1 })
      .set($("[data-gen-busy]"), { opacity: 0 })
      .set($("[data-count]"), { opacity: 0, scale: 0.6 })
      .set($("[data-pill]"), { xPercent: 0 })
      .set(panel, { opacity: 0, y: "3%" })
      .set(kb, { scale: 1 })
      .set($("[data-playhead]"), { left: "0%" })
      .set(subs, { backgroundColor: "rgba(255,86,54,0)", color: "#ffffff" })
      .set(thumbs, { outlineColor: "rgba(255,86,54,0)" })
      .set(cursor, { opacity: 0, left: "58%", top: "62%" })
      .fromTo(body, { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0)
      // describe the scene
      .to(cursor, { opacity: 1, ...at($("[data-input]")[0], 0.85, 0.5), duration: 0.6 }, 0.2)
      .to(typing, { p: 1, duration: 1.3, ease: "steps(30)", onUpdate: type }, 0.5)
      // generate
      .to(cursor, { ...at(gen, 0.6, 0.55), duration: 0.6, ease: "power2.inOut" }, 1.9);
    press(tl, gen, 2.5);
    tl.to($("[data-gen-idle]"), { opacity: 0, duration: 0.2 }, 2.6)
      .to($("[data-gen-busy]"), { opacity: 1, duration: 0.2 }, 2.6)
      .to(scans, { opacity: 1, duration: 0.1, stagger: 0.25 }, 3.0)
      .to(cards, { clipPath: "inset(0 0 0% 0)", duration: 0.9, ease: "power2.inOut", stagger: 0.25 }, 3.0)
      .to(scans, { top: "100%", duration: 0.9, ease: "power2.inOut", stagger: 0.25 }, 3.0)
      .to(scans, { opacity: 0, duration: 0.2, stagger: 0.25 }, 3.9)
      .to($("[data-gen-busy]"), { opacity: 0, duration: 0.2 }, 4.1)
      .to($("[data-gen-idle]"), { opacity: 1, duration: 0.2 }, 4.1)
      .to($("[data-count]"), { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2)" }, 4.15)
      .addLabel("poster", 4.6)
      // turn the scene into a video
      .to(cursor, { ...at(tabVideo, 0.5, 0.6), duration: 0.6, ease: "power2.inOut" }, 4.7);
    press(tl, tabVideo, 5.3);
    tl.to($("[data-pill]"), { xPercent: 100, duration: 0.45, ease: "power3.inOut" }, 5.35)
      .to(cursor, { opacity: 0, duration: 0.3 }, 5.6)
      .to(panel, { opacity: 1, y: "0%", duration: 0.6 }, 5.5)
      .to(kb, { scale: 1.14, duration: 3.4, ease: "none" }, 5.6)
      .to($("[data-playhead]"), { left: "100%", duration: 3.4, ease: "none" }, 5.6);
    thumbs.forEach((th, i) =>
      tl.to(th, { outlineColor: "rgba(255,86,54,1)", duration: 0.15 }, 5.6 + i * 1.13).to(th, { outlineColor: "rgba(255,86,54,0)", duration: 0.15 }, 5.6 + (i + 1) * 1.13),
    );
    subs.forEach((w, i) =>
      tl.to(w, { backgroundColor: "rgba(255,86,54,1)", duration: 0.12 }, 5.9 + i * 0.5).to(w, { backgroundColor: "rgba(255,86,54,0)", duration: 0.12 }, 5.9 + (i + 1) * 0.5),
    );
    tl.to(body, { opacity: 0, duration: 0.4 }, 9.4);
  });

  return (
    <Stage bg="#efeaf7" loop={loop}>
      <div data-body className="absolute inset-0 flex flex-col overflow-hidden rounded-[1.6cqw] border border-[#ece9f5] bg-[#fbf9ff] font-sans text-[#0E0E0E] shadow-[0_2cqw_5cqw_-2cqw_rgb(79_53_255/0.25)]">
        <div className="flex h-[7cqw] shrink-0 items-center justify-between border-b border-[#ece9f5] px-[2.6cqw]">
          <span className="flex items-center gap-[0.8cqw] text-[1.8cqw] font-bold tracking-[-0.03em]">
            <PicgenioMark className="w-[2.4cqw]" />
            Picgenio
          </span>
          <span className="relative flex rounded-full bg-[#f1eefb] p-[0.4cqw] text-[1.25cqw] font-medium">
            <span data-pill className="absolute inset-y-[0.4cqw] left-[0.4cqw] w-[9cqw] rounded-full bg-white shadow-[0_0.2cqw_0.6cqw_rgb(79_53_255/0.15)]" />
            {["Imagen", "Vídeo", "Storyboard"].map((t, i) => (
              <span key={t} data-tab-video={i === 1 ? "" : undefined} className="relative z-10 w-[9cqw] py-[0.6cqw] text-center">
                {t}
              </span>
            ))}
          </span>
          <span className="rounded-[0.8cqw] bg-[#4F35FF] px-[1.4cqw] py-[0.7cqw] text-[1.2cqw] font-semibold text-white">Mi cuenta</span>
        </div>

        <div className="relative flex flex-1 gap-[2.4cqw] p-[2.6cqw]">
          {/* inputs */}
          <div className="flex w-[28cqw] shrink-0 flex-col gap-[1.2cqw]">
            <p className="text-[1.2cqw] font-semibold text-[#7c7589]">Tu foto actual</p>
            <div className="relative aspect-square overflow-hidden rounded-[1.2cqw] border border-[#ece9f5] bg-white">
              <Image src="/work/picgenio/original.webp" alt="" fill sizes="30vw" className="object-cover" />
            </div>
            <p className="mt-[0.4cqw] text-[1.2cqw] font-semibold text-[#7c7589]">Describe el escenario</p>
            <div data-input className="relative flex h-[4.6cqw] items-center rounded-[0.9cqw] border border-[#ece9f5] bg-white px-[1.2cqw] text-[1.25cqw]">
              <span data-typed className="whitespace-nowrap">
                Salón nórdico, luz cálida de tarde
              </span>
              <span data-caret className="absolute top-1/2 h-[1.8cqw] w-[0.18cqw] -translate-y-1/2 animate-pulse bg-[#FF5636]" />
            </div>
            <div data-generate className="relative grid h-[4.6cqw] place-items-center rounded-[0.9cqw] bg-[#FF5636] text-[1.35cqw] font-semibold text-white">
              <span data-gen-idle className="col-start-1 row-start-1">
                Generar imagen
              </span>
              <span data-gen-busy className="col-start-1 row-start-1">
                Generando…
              </span>
            </div>
          </div>

          {/* results */}
          <div className="relative flex min-w-0 flex-1 flex-col gap-[1.2cqw]">
            <p className="flex items-center gap-[0.8cqw] text-[1.2cqw] font-semibold text-[#7c7589]">
              Tus imágenes
              <span data-count className="rounded-full bg-[#FF5636] px-[0.8cqw] text-[1.1cqw] leading-[1.9cqw] text-white">
                2
              </span>
            </p>
            <div className="grid flex-1 grid-cols-2 gap-[1.6cqw]">
              {[
                ["/work/picgenio/sillon-editorial.webp", "Ficha de producto"],
                ["/work/picgenio/escena-lifestyle.webp", "Imagen de situación"],
              ].map(([src, label]) => (
                <div key={src} className="flex flex-col gap-[0.8cqw]">
                  <div className="relative flex-1 overflow-hidden rounded-[1.2cqw] bg-[#ece9f5]">
                    <div className="absolute inset-0 animate-pulse bg-[linear-gradient(110deg,#ece9f5_30%,#f7f5fd_50%,#ece9f5_70%)]" />
                    <div data-result className="absolute inset-0">
                      <Image src={src} alt="" fill sizes="25vw" className="object-cover" />
                    </div>
                    <span data-scan className="absolute inset-x-0 h-[0.3cqw] bg-[#FF5636] shadow-[0_0_1.2cqw_0.3cqw_rgb(255_86_54/0.6)]" />
                  </div>
                  <span className="text-[1.15cqw] font-medium">{label}</span>
                </div>
              ))}
            </div>

            {/* video generator */}
            <div data-video className="absolute inset-0 flex flex-col gap-[1cqw] bg-[#fbf9ff]">
              <p className="text-[1.2cqw] font-semibold text-[#7c7589]">Generador de vídeos · Fotograma inicial</p>
              <div className="relative flex-1 overflow-hidden rounded-[1.2cqw] bg-black">
                <div data-kenburns className="absolute inset-0 origin-[60%_55%]">
                  <Image src="/work/picgenio/escena-lifestyle.webp" alt="" fill sizes="40vw" className="object-cover object-[50%_60%]" />
                </div>
                <div className="absolute inset-x-0 bottom-[2.2cqw] flex justify-center gap-[0.5cqw] text-[1.9cqw] font-extrabold uppercase tracking-tight">
                  {words.map((w) => (
                    <span key={w} data-word className="rounded-[0.4cqw] px-[0.5cqw] [text-shadow:0_0.15cqw_0.5cqw_rgb(0_0_0/0.5)]">
                      {w}
                    </span>
                  ))}
                </div>
                <span className="absolute left-[1.2cqw] top-[1.2cqw] rounded-full bg-black/55 px-[1cqw] py-[0.3cqw] text-[1cqw] font-medium text-white">
                  Kling · 5 s
                </span>
              </div>
              <div className="flex items-center gap-[1cqw]">
                <span className="shrink-0 text-[1.1cqw] font-semibold">Storyboard IA · 3 escenas</span>
                <div className="relative grid flex-1 grid-cols-3 gap-[0.6cqw]">
                  {["original", "sillon-editorial", "escena-lifestyle"].map((n) => (
                    <div key={n} data-thumb className="relative h-[5cqw] overflow-hidden rounded-[0.6cqw] outline outline-[0.25cqw] outline-offset-[0.15cqw]">
                      <Image src={`/work/picgenio/${n}.webp`} alt="" fill sizes="10vw" className="object-cover" />
                    </div>
                  ))}
                  <span data-playhead className="absolute -bottom-[0.6cqw] -top-[0.6cqw] w-[0.2cqw] bg-[#4F35FF]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Cursor />
    </Stage>
  );
}

// ---------------------------------------------------------------- QusAP

function Brot({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="8 4 80 90" className={className}>
      <defs>
        <linearGradient id="brot-pot" x1="48" y1="50" x2="48" y2="92" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#e59767" />
          <stop offset="1" stopColor="#d98352" />
        </linearGradient>
      </defs>
      <path d="M48 40 C 46 28 38 22 27 21 C 29 32 37 39 48 40 Z" fill="#1f9d55" />
      <path d="M48 40 C 51 26 60 19 71 20 C 69 33 60 39 48 40 Z" fill="#3ec277" />
      <ellipse cx="48" cy="43" rx="20" ry="4" fill="#6b4a32" />
      <rect x="19" y="40" width="58" height="11" rx="5.5" fill="#b96a3f" />
      <path d="M24 51 L 72 51 L 67 88 Q 48 92 29 88 Z" fill="url(#brot-pot)" />
      <ellipse cx="30" cy="73" rx="6" ry="4.2" fill="#ffd9c2" opacity="0.95" />
      <ellipse cx="66" cy="73" rx="6" ry="4.2" fill="#ffd9c2" opacity="0.95" />
      <rect x="31" y="57" width="9.4" height="14" rx="4.7" fill="#14281c" />
      <rect x="55.6" y="57" width="9.4" height="14" rx="4.7" fill="#14281c" />
      <circle cx="36.7" cy="60.4" r="1.6" fill="#fff" opacity="0.7" />
      <circle cx="61.3" cy="60.4" r="1.6" fill="#fff" opacity="0.7" />
      <path d="M42 77 Q 48 83 54 77" stroke="#14281c" strokeWidth="2.9" strokeLinecap="round" fill="none" />
    </svg>
  );
}

const Chip = ({ children }: { children: ReactNode }) => (
  <span className="rounded-[0.5cqw] bg-[#dcf9e4] px-[0.5cqw] font-bold text-[#00622d]">{children}</span>
);

export function QusapDemo() {
  // 132 students: who answers right, wrong, or not yet. Fixed so every loop tells the same story.
  const seats = Array.from({ length: 132 }, (_, i) => {
    const h = (i * 2654435761) % 1000;
    return h < 760 ? "ok" : h < 920 ? "ko" : "wait";
  });
  const loop = useLoop((tl, $, at) => {
    const [body] = $("[data-body]");
    const [cursor] = $("[data-cursor]");
    const [finger] = $("[data-finger]");
    const [opt] = $("[data-opt-right]");
    const [check] = $("[data-check]");
    const [reveal] = $("[data-reveal-btn]");
    const ok = $("[data-seat='ok']");
    const ko = $("[data-seat='ko']");
    const answered = { n: 0, pct: 0 };
    const [nEl] = $("[data-answered]");
    const [pEl] = $("[data-pct]");
    const show = () => {
      nEl.textContent = String(Math.round(answered.n));
      pEl.textContent = `${Math.round(answered.pct)} %`;
    };

    tl.set([...ok, ...ko], { backgroundColor: "#dbe1dd", scale: 1 })
      .set(answered, { n: 0, pct: 0, onComplete: show })
      .set($("[data-opt]"), { backgroundColor: "#fefffe", borderColor: "#dbe1dd" })
      .set($("[data-feedback]"), { yPercent: 120, opacity: 0 })
      .set($("[data-mascot]"), { scale: 0.4, opacity: 0, rotate: -12 })
      .set($("[data-solution]"), { opacity: 0, y: "20%" })
      .set(finger, { opacity: 0, scale: 1.4 })
      .set(cursor, { opacity: 0, left: "40%", top: "92%" })
      .fromTo(body, { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0)
      // the class answers on their phones
      .to(ok, { backgroundColor: "#00853d", duration: 0.2, stagger: { amount: 3.2, from: "random" } }, 0.4)
      .to(ko, { backgroundColor: "#d03833", duration: 0.2, stagger: { amount: 3.0, from: "random" } }, 0.6)
      .to(answered, { n: ok.length + ko.length, pct: (ok.length / (ok.length + ko.length)) * 100, duration: 3.4, ease: "power1.inOut", onUpdate: show }, 0.4)
      // one of them, up close
      .to(finger, { ...at(opt), opacity: 0.85, scale: 1, duration: 0.5 }, 0.8)
      .to(opt, { backgroundColor: "#dcf9e4", borderColor: "#00853d", duration: 0.2 }, 1.3)
      .to(finger, { ...at(check), duration: 0.45, ease: "power2.inOut" }, 1.6);
    press(tl, check, 2.05);
    tl.to(finger, { opacity: 0, duration: 0.3 }, 2.2)
      .to($("[data-feedback]"), { yPercent: 0, opacity: 1, duration: 0.5 }, 2.25)
      .to($("[data-mascot]"), { scale: 1, opacity: 1, rotate: 0, duration: 0.7, ease: "back.out(2.4)" }, 2.35)
      // the teacher closes the question
      .to(cursor, { opacity: 1, ...at(reveal, 0.4, 0.6), duration: 0.8, ease: "power2.inOut" }, 3.9);
    press(tl, reveal, 4.75);
    tl.to($("[data-solution]"), { opacity: 1, y: "0%", duration: 0.5 }, 4.85)
      .to(cursor, { opacity: 0, duration: 0.3 }, 5.2)
      .addLabel("poster", 5.6)
      .to(body, { opacity: 0, duration: 0.4 }, 8.2);
  });

  return (
    <Stage bg="#eaf3ed" loop={loop}>
      <div data-body className="absolute inset-0 font-sans text-[#1b2720]">
        <div className="absolute inset-0 opacity-70" style={{ backgroundImage: "radial-gradient(#b9cbbf 0.12cqw, transparent 0.16cqw)", backgroundSize: "2.2cqw 2.2cqw" }} />

        {/* teacher console */}
        <div className="absolute bottom-0 left-0 top-0 flex w-[66cqw] flex-col gap-[1.4cqw] rounded-[1.6cqw] border border-[#dbe1dd] bg-[#fefffe] p-[2.4cqw] shadow-[0_2cqw_4cqw_-2cqw_rgb(0_98_45/0.3)]">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-[0.6cqw] text-[1.9cqw] font-extrabold tracking-[-0.03em]">
              <Brot className="w-[2.6cqw]" />
              QusAP
            </span>
            <span className="flex items-center gap-[1.2cqw] text-[1.15cqw] font-semibold">
              <span className="flex items-center gap-[0.5cqw] rounded-full bg-[#fde8e7] px-[1cqw] py-[0.4cqw] text-[#d03833]">
                <span className="size-[0.8cqw] animate-pulse rounded-full bg-current" />
                En directe
              </span>
              <span className="text-[#505b54]">Apartat 2 de 4</span>
            </span>
          </div>

          <div className="rounded-[1.2cqw] bg-[#f7fcf9] p-[1.6cqw] text-[1.65cqw] font-medium leading-[1.55]">
            Un cotxe surt d&rsquo;aturat i accelera a <Chip>2</Chip> m/s² durant <Chip>3</Chip> s. A quina velocitat arriba?
          </div>

          <div className="grid grid-cols-3 gap-[1cqw]">
            {[
              [<span key="n" data-answered>0</span>, "han respost"],
              [<span key="p" data-pct>0 %</span>, "d'encerts"],
              ["132", "connectats"],
            ].map(([v, l], i) => (
              <div key={i} className="rounded-[1cqw] border border-[#dbe1dd] px-[1.2cqw] py-[0.9cqw]">
                <p className="text-[2.4cqw] font-extrabold leading-none tabular-nums tracking-[-0.03em]">{v}</p>
                <p className="mt-[0.4cqw] text-[1.05cqw] text-[#505b54]">{l}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-[repeat(18,minmax(0,1fr))] gap-[0.5cqw]">
            {seats.map((s, i) => (
              <span key={i} data-seat={s} className="aspect-square rounded-full bg-[#dbe1dd]" />
            ))}
          </div>
          <div className="flex gap-[1.6cqw] text-[1.05cqw] text-[#505b54]">
            {[
              ["#00853d", "L'ha encertada"],
              ["#d03833", "No l'ha encertada"],
              ["#dbe1dd", "Encara no ha contestat"],
            ].map(([c, l]) => (
              <span key={l} className="flex items-center gap-[0.5cqw]">
                <span className="size-[0.9cqw] rounded-full" style={{ background: c }} />
                {l}
              </span>
            ))}
          </div>

          <div className="mt-auto flex items-center gap-[1cqw] text-[1.2cqw] font-semibold">
            <span className="rounded-[0.9cqw] border border-[#dbe1dd] px-[1.3cqw] py-[0.8cqw]">+ Qüestió ràpida</span>
            <span data-reveal-btn className="rounded-[0.9cqw] bg-[#00853d] px-[1.3cqw] py-[0.8cqw] text-white shadow-[0_0.35cqw_0_#00622d]">
              Mostra la solució i tanca
            </span>
            <span data-solution className="ml-auto flex items-center gap-[0.6cqw] text-[1.3cqw] text-[#00622d]">
              <svg viewBox="0 0 12 12" className="w-[1.4cqw]" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 6.5 5 9l5-6" />
              </svg>
              v = a·t = 2·3 = 6 m/s
            </span>
          </div>
        </div>

        {/* a student's phone */}
        <div className="absolute bottom-[1cqw] right-[1.5cqw] top-[1cqw] w-[28cqw] rounded-[3.2cqw] bg-[#1b2720] p-[0.9cqw] shadow-[0_2cqw_4cqw_-1.5cqw_rgb(0_0_0/0.4)]">
          <div className="relative flex h-full flex-col gap-[1cqw] overflow-hidden rounded-[2.4cqw] bg-[#fefffe] p-[1.8cqw] pt-[2.6cqw]">
            <span className="absolute left-1/2 top-[0.8cqw] h-[1cqw] w-[7cqw] -translate-x-1/2 rounded-full bg-[#1b2720]" />
            <p className="text-[1.05cqw] font-semibold text-[#505b54]">Apartat 2 de 4</p>
            <div className="h-[0.6cqw] rounded-full bg-[#dcf9e4]">
              <div className="h-full w-1/2 rounded-full bg-[#29c271]" />
            </div>
            <p className="text-[1.35cqw] font-semibold leading-snug">
              <Chip>2</Chip> m/s² durant <Chip>3</Chip> s. A quina velocitat arriba?
            </p>
            <div className="grid grid-cols-2 gap-[0.8cqw] text-[1.4cqw] font-bold">
              {["8 m/s", "6 m/s", "5 m/s", "12 m/s"].map((o) => (
                <span
                  key={o}
                  data-opt
                  data-opt-right={o === "6 m/s" ? "" : undefined}
                  className="rounded-[0.9cqw] border-[0.18cqw] px-[0.8cqw] py-[1cqw] text-center shadow-[0_0.35cqw_0_#dbe1dd]"
                >
                  {o}
                </span>
              ))}
            </div>
            <span data-check className="rounded-[0.9cqw] bg-[#00853d] py-[0.9cqw] text-center text-[1.3cqw] font-bold text-white shadow-[0_0.35cqw_0_#00622d]">
              Comprova
            </span>
            <div data-feedback className="absolute inset-x-0 bottom-0 flex items-center gap-[1cqw] bg-[#dcf9e4] px-[1.6cqw] pb-[1.8cqw] pt-[1.4cqw]">
              <div>
                <p className="text-[1.5cqw] font-extrabold text-[#00622d]">Correcte!</p>
                <p className="text-[1.15cqw] font-semibold text-[#00853d]">+10 punts</p>
              </div>
              <span data-mascot className="ml-auto w-[5.2cqw]">
                <Brot className="w-full" />
              </span>
            </div>
          </div>
          <span data-finger className="absolute z-20 size-[3cqw] -translate-x-1/2 -translate-y-1/2 rounded-full border-[0.25cqw] border-white bg-[#1b2720]/35" style={{ left: "50%", top: "80%" }} />
        </div>
      </div>
      <Cursor />
    </Stage>
  );
}

// ---------------------------------------------------------------- Traingenio

function Presenter() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="xMidYMax meet">
      <path d="M12 100 C 14 77 29 69 50 69 C 71 69 86 77 88 100 Z" fill="#2c3a28" />
      <path d="M41 69 L 50 86 L 59 69 Z" fill="#F7F9F5" />
      <path d="M41 69 L 46 74 L 50 86 Z M59 69 L 54 74 L 50 86 Z" fill="#dfe6d8" />
      <path d="M33 76 L 41 69 L 46 90 Z M67 76 L 59 69 L 54 90 Z" fill="#22301f" />
      <rect x="44" y="55" width="12" height="16" rx="5" fill="#d29d7c" />
      <ellipse cx="34.5" cy="42" rx="3" ry="4.5" fill="#dcaa88" />
      <ellipse cx="65.5" cy="42" rx="3" ry="4.5" fill="#dcaa88" />
      <ellipse cx="50" cy="40" rx="15" ry="18" fill="#e8b998" />
      <path d="M34.5 39 C 33 21 43 16 52 17 C 63 17 68 26 65.6 39 C 64 31 59 26 51 27 C 44 27 38 30 34.5 39 Z" fill="#3a2a1e" />
      <path d="M40.5 34.5 Q 44 33 47 34.5 M53 34.5 Q 56 33 59.5 34.5" stroke="#3a2a1e" strokeWidth="1.3" strokeLinecap="round" fill="none" />
      <g data-eyes style={{ transformBox: "fill-box", transformOrigin: "center" }}>
        <ellipse cx="44" cy="39.5" rx="1.6" ry="2" fill="#091504" />
        <ellipse cx="56" cy="39.5" rx="1.6" ry="2" fill="#091504" />
      </g>
      <path d="M50 41 Q 48.6 45.5 50.8 46" stroke="#c78f70" strokeWidth="1.1" strokeLinecap="round" fill="none" />
      <g data-mouth style={{ transformBox: "fill-box", transformOrigin: "center" }}>
        <ellipse cx="50" cy="50.5" rx="3.6" ry="1.6" fill="#8a3b2e" />
      </g>
    </svg>
  );
}

export function TraingenioDemo() {
  const docs = [
    ["manual", "manual-usuario.pdf"],
    ["ficha", "ficha-tecnica.pdf"],
    ["catalogo", "catalogo-2026.pptx"],
  ];
  const progress = ["Leyendo tus fuentes", "Escribiendo el guión", "Analizando imágenes y vídeos", "Creando la formación"];
  const loop = useLoop((tl, $, at) => {
    const [body] = $("[data-body]");
    const [cursor] = $("[data-cursor]");
    const [gen] = $("[data-generate]");
    const screens = $("[data-screen]");
    const steps = $("[data-step]");
    const paper = $("[data-doc]");
    const files = $("[data-file]");
    const formats = $("[data-format='on']");
    const ticks = $("[data-tick]");
    const scenes = $("[data-scene]");
    const [answer] = $("[data-answer]");

    tl.set(screens, { opacity: 0, y: "2%" })
      .set(screens[0], { opacity: 1, y: "0%" })
      .set(steps, { backgroundColor: "#D6DDCE", color: "#56604F" })
      .set(steps[0], { backgroundColor: "#337418", color: "#ffffff" })
      .set(steps[1], { backgroundColor: "#091504", color: "#ffffff" })
      .set(paper, { y: "-120%", x: "30%", rotate: 14, opacity: 0 })
      .set(files, { opacity: 0, x: "-6%" })
      .set(formats, { backgroundColor: "#ffffff", color: "#091504", borderColor: "#D6DDCE" })
      .set(ticks, { scale: 0, opacity: 0 })
      .set($("[data-spin]"), { opacity: 1 })
      .set($("[data-progress]"), { scaleX: 0 })
      .set(scenes, { outlineColor: "rgba(93,214,44,0)" })
      .set($("[data-playhead]"), { scaleX: 0 })
      .set($("[data-quiz]"), { opacity: 0, x: "6%" })
      .set(answer, { backgroundColor: "#ffffff", borderColor: "#D6DDCE" })
      .set($("[data-verdict]"), { opacity: 0 })
      .set($("[data-pass]"), { opacity: 0, y: "30%" })
      .set(cursor, { opacity: 0, left: "62%", top: "40%" })
      .fromTo(body, { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0)
      // 02 · Sube la información
      .to(paper, { y: "0%", x: "0%", rotate: (i) => [-4, 2, 5][i], opacity: 1, duration: 0.8, ease: "back.out(1.4)", stagger: 0.22 }, 0.3)
      .to(files, { opacity: 1, x: "0%", duration: 0.4, stagger: 0.22 }, 0.8)
      .to(formats, { backgroundColor: "#EAF6E2", color: "#2E7D14", borderColor: "#5DD62C", duration: 0.25, stagger: 0.25 }, 1.8)
      .to(cursor, { opacity: 1, ...at(gen, 0.5, 0.6), duration: 0.8, ease: "power2.inOut" }, 1.8);
    press(tl, gen, 2.7);
    tl.to(cursor, { opacity: 0, duration: 0.3 }, 2.95)
      .to(steps[1], { backgroundColor: "#337418", duration: 0.3 }, 2.9)
      .to(steps[2], { backgroundColor: "#091504", color: "#ffffff", duration: 0.3 }, 2.9)
      // 03 · Genera la formación
      .to(screens[0], { opacity: 0, y: "-2%", duration: 0.35 }, 2.95)
      .to(screens[1], { opacity: 1, y: "0%", duration: 0.45 }, 3.1)
      .to($("[data-progress]"), { scaleX: 1, duration: 2.0, ease: "power1.inOut" }, 3.3);
    ticks.forEach((t, i) => tl.to($("[data-spin]")[i], { opacity: 0, duration: 0.15 }, 3.7 + i * 0.5).to(t, { scale: 1, opacity: 1, duration: 0.35, ease: "back.out(3)" }, 3.7 + i * 0.5));
    tl.to(screens[1], { opacity: 0, y: "-2%", duration: 0.35 }, 5.6)
      .to(steps[2], { backgroundColor: "#337418", duration: 0.3 }, 5.6)
      // the result: an avatar video with scenes, then the quiz
      .to(screens[2], { opacity: 1, y: "0%", duration: 0.5 }, 5.75)
      .to($("[data-playhead]"), { scaleX: 1, duration: 4.2, ease: "none" }, 5.9)
      .fromTo($("[data-mouth]"), { scaleY: 0.5 }, { scaleY: 1.6, duration: 0.12, repeat: 33, yoyo: true, ease: "sine.inOut" }, 5.9)
      .to($("[data-eyes]"), { scaleY: 0.1, duration: 0.07, repeat: 1, yoyo: true }, 7.1)
      .to($("[data-eyes]"), { scaleY: 0.1, duration: 0.07, repeat: 1, yoyo: true }, 9.2);
    scenes.forEach((s, i) =>
      tl.to(s, { outlineColor: "rgba(93,214,44,1)", duration: 0.15 }, 5.9 + i * 1.05).to(s, { outlineColor: "rgba(93,214,44,0)", duration: 0.15 }, 5.9 + (i + 1) * 1.05),
    );
    tl.to($("[data-quiz]"), { opacity: 1, x: "0%", duration: 0.6 }, 6.6)
      .to(answer, { backgroundColor: "#EAF6E2", borderColor: "#5DD62C", duration: 0.25 }, 7.6)
      .to($("[data-verdict]"), { opacity: 1, duration: 0.25 }, 7.75)
      .to($("[data-pass]"), { opacity: 1, y: "0%", duration: 0.5 }, 8.3)
      .addLabel("poster", 8.9)
      .to(body, { opacity: 0, duration: 0.4 }, 10.6);
  });

  return (
    <Stage bg="#e6ece1" loop={loop}>
      <div data-body className="absolute inset-0 flex flex-col overflow-hidden rounded-[1.6cqw] border border-[#D6DDCE] bg-[#F7F9F5] font-sans text-[#091504] shadow-[0_2cqw_5cqw_-2cqw_rgb(51_116_24/0.3)]">
        <div className="flex h-[7cqw] shrink-0 items-center justify-between border-b border-[#D6DDCE] px-[2.6cqw]">
          <span className="flex items-center gap-[0.9cqw] font-serif text-[2cqw] font-semibold tracking-[-0.02em]">
            <Image src="/work/traingenio/icon.svg" alt="" width={210} height={133} className="w-[3.2cqw]" />
            Traingenio
          </span>
          <ol className="flex items-center gap-[0.6cqw] font-mono text-[1cqw]">
            {["Configura la formación", "Sube la información", "Genera la formación"].map((s, i) => (
              <li key={s} className="flex items-center gap-[0.6cqw]">
                {i > 0 && <span className="h-px w-[1.6cqw] bg-[#D6DDCE]" />}
                <span data-step className="grid size-[2.2cqw] place-items-center rounded-full">
                  {i + 1}
                </span>
                <span className="text-[#56604F]">{s}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="relative flex-1">
          {/* 02 · Sube la información */}
          <div data-screen className="absolute inset-0 flex flex-col gap-[1.6cqw] p-[2.6cqw]">
            <p className="font-serif text-[2.4cqw] font-semibold tracking-[-0.02em]">Sube la información</p>
            <div className="grid flex-1 grid-cols-[1.25fr_1fr] gap-[2cqw]">
              <div className="flex flex-col rounded-[1.4cqw] border-[0.18cqw] border-dashed border-[#B9C6AE] bg-white/60 p-[1.6cqw]">
                <div className="flex flex-1 items-center justify-center gap-[1.8cqw]">
                  {docs.map(([src]) => (
                    <div key={src} data-doc className="relative aspect-[4/5] w-[11cqw] overflow-hidden rounded-[0.7cqw] bg-white shadow-[0_1.2cqw_2.4cqw_-1cqw_rgb(9_21_4/0.35)]">
                      <Image src={`/work/traingenio/${src}.webp`} alt="" fill sizes="10vw" className="object-cover object-top" />
                    </div>
                  ))}
                </div>
                <p className="text-center text-[1.1cqw] text-[#56604F]">Sube archivos (PDF, PowerPoint…), imágenes, vídeos o audios</p>
              </div>
              <div className="flex flex-col gap-[0.8cqw]">
                {docs.map(([, name]) => (
                  <div key={name} data-file className="flex items-center gap-[0.8cqw] rounded-[0.9cqw] border border-[#D6DDCE] bg-white px-[1.1cqw] py-[0.8cqw] font-mono text-[1.05cqw]">
                    <span className="grid size-[1.6cqw] place-items-center rounded-full bg-[#5DD62C] text-white">
                      <svg viewBox="0 0 12 12" className="w-[1cqw]" fill="none" stroke="currentColor" strokeWidth="2.4">
                        <path d="M2 6.5 5 9l5-6" />
                      </svg>
                    </span>
                    {name}
                  </div>
                ))}
                <p className="mt-[0.8cqw] text-[1.15cqw] font-semibold">¿Qué formatos necesitas?</p>
                <div className="flex flex-wrap gap-[0.6cqw] text-[1.1cqw]">
                  {["Vídeo", "Quiz", "Podcast", "Infografía", "Role play"].map((f, i) => (
                    <span key={f} data-format={i < 2 ? "on" : "off"} className="rounded-full border border-[#D6DDCE] bg-white px-[1cqw] py-[0.4cqw]">
                      {f}
                    </span>
                  ))}
                </div>
                <span data-generate className="mt-auto flex items-center justify-between rounded-full bg-[#091504] py-[0.6cqw] pl-[1.6cqw] pr-[0.6cqw] text-[1.25cqw] font-semibold text-white">
                  Generar formación
                  <span className="grid size-[2.6cqw] place-items-center rounded-full bg-[#5DD62C] text-[#091504]">
                    <svg viewBox="0 0 16 16" className="w-[1.3cqw]" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 8h10M9 4l4 4-4 4" />
                    </svg>
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* 03 · Generando */}
          <div data-screen className="absolute inset-0 grid place-items-center">
            <div className="w-[42cqw] rounded-[1.6cqw] border border-[#D6DDCE] bg-white p-[2.4cqw] shadow-[0_2cqw_4cqw_-2cqw_rgb(9_21_4/0.3)]">
              <p className="font-serif text-[2.2cqw] font-semibold tracking-[-0.02em]">Generando la formación</p>
              <ul className="mt-[1.6cqw] space-y-[1cqw] text-[1.3cqw]">
                {progress.map((p) => (
                  <li key={p} className="flex items-center gap-[1cqw]">
                    <span className="relative grid size-[2cqw] place-items-center">
                      <span data-spin className="absolute inset-0 animate-spin rounded-full border-[0.2cqw] border-[#D6DDCE] border-t-[#337418]" />
                      <span data-tick className="grid size-full place-items-center rounded-full bg-[#5DD62C] text-white">
                        <svg viewBox="0 0 12 12" className="w-[1.1cqw]" fill="none" stroke="currentColor" strokeWidth="2.4">
                          <path d="M2 6.5 5 9l5-6" />
                        </svg>
                      </span>
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
              <div className="mt-[1.8cqw] h-[0.6cqw] overflow-hidden rounded-full bg-[#EAF6E2]">
                <div data-progress className="h-full origin-left rounded-full bg-[#337418]" />
              </div>
            </div>
          </div>

          {/* resultado */}
          <div data-screen className="absolute inset-0 flex items-center gap-[2cqw] p-[2.6cqw]">
            <div className="flex w-[58cqw] shrink-0 flex-col gap-[1cqw]">
              <div className="relative aspect-video overflow-hidden rounded-[1.2cqw] bg-[#091504]">
                <div className="absolute inset-y-0 right-0 w-[56%] bg-white">
                  <Image src="/work/traingenio/ficha.webp" alt="" fill sizes="30vw" className="object-cover object-top" />
                </div>
                <div className="absolute bottom-0 left-[2%] h-[86%] w-[46%]">
                  <Presenter />
                </div>
                <div className="absolute inset-x-[6%] bottom-[9%] rounded-[0.5cqw] bg-[#091504]/80 px-[1cqw] py-[0.5cqw] text-center text-[1.25cqw] text-white">
                  Antes de arrancar, revisa siempre la presión del circuito.
                </div>
                <div className="absolute inset-x-0 bottom-0 h-[0.5cqw] bg-white/20">
                  <div data-playhead className="h-full origin-left bg-[#5DD62C]" />
                </div>
              </div>
              <div className="flex items-center gap-[0.8cqw]">
                <span className="shrink-0 text-[1.1cqw] font-semibold">Escenas del vídeo</span>
                {[1, 2, 3, 4].map((n) => (
                  <span key={n} data-scene className="flex-1 rounded-[0.6cqw] bg-white py-[0.6cqw] text-center font-mono text-[0.95cqw] text-[#56604F] outline outline-[0.22cqw] outline-offset-[0.1cqw]">
                    Escena {n}
                  </span>
                ))}
              </div>
            </div>

            <div data-quiz className="flex flex-1 flex-col gap-[0.9cqw] rounded-[1.4cqw] border border-[#D6DDCE] bg-white p-[1.8cqw]">
              <div className="flex items-center justify-between">
                <p className="font-mono text-[1cqw] text-[#56604F]">Pregunta 2 de 5</p>
                <span className="flex gap-[0.4cqw]">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <span key={i} className={`h-[0.5cqw] w-[1.6cqw] rounded-full ${i < 2 ? "bg-[#5DD62C]" : "bg-[#D6DDCE]"}`} />
                  ))}
                </span>
              </div>
              <p className="font-serif text-[1.6cqw] font-semibold leading-snug tracking-[-0.01em]">¿Qué hay que revisar antes de arrancar?</p>
              {["La presión del circuito", "El color del chasis", "La fecha de la garantía"].map((o, i) => (
                <span
                  key={o}
                  data-answer={i === 0 ? "" : undefined}
                  className="flex items-center justify-between rounded-[0.9cqw] border border-[#D6DDCE] px-[1cqw] py-[0.8cqw] text-[1.15cqw]"
                >
                  {o}
                  {i === 0 && (
                    <span data-verdict className="font-mono text-[0.95cqw] font-semibold text-[#2E7D14]">
                      Correcta
                    </span>
                  )}
                </span>
              ))}
              <div data-pass className="mt-[0.6cqw] rounded-[0.9cqw] bg-[#EAF6E2] px-[1cqw] py-[0.8cqw] text-[1.05cqw] text-[#2E7D14]">
                <p className="font-semibold">Test terminado: 4 de 5 a la primera.</p>
                <p>Aprobado: hacía falta un 70&nbsp;%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Cursor />
    </Stage>
  );
}
