"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Source_Serif_4 } from "next/font/google";
import Image from "next/image";
import { useRef, type ReactNode } from "react";

gsap.registerPlugin(useGSAP);

const serif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["600"],
  preload: false,
});

/*
 * Product demos for the work cards. Each one is a small app recreated with the product's own
 * colours, copy and assets, playing its core flow on a loop. Everything is sized in cqw of a
 * 16:10 stage, so the scene scales as one piece. Loops only run while on screen.
 */

type Sel = (s: string) => HTMLElement[];
type Build = (
  tl: gsap.core.Timeline,
  $: Sel,
  at: (el: HTMLElement, ox?: number, oy?: number) => gsap.TweenVars,
) => void;

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
      const tl = gsap.timeline({
        repeat: -1,
        paused: true,
        defaults: { ease: "power3.out", duration: 0.6, lazy: false },
      });
      build(tl, $, at);
      tl.seek(0.01, false); // a paused timeline never renders its time-0 sets on its own

      if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
        tl.seek("poster", false);
        return;
      }
      let visible = false;
      const sync = () => {
        const on = visible && document.documentElement.dataset.motion !== "off";
        if (on) tl.play();
        else tl.pause();
        root
          .querySelectorAll<HTMLVideoElement>("video")
          .forEach((v) =>
            on && v.dataset.active ? v.play().catch(() => {}) : v.pause(),
          );
      };
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

function Stage({
  bg,
  children,
  loop,
}: {
  bg: string;
  children: ReactNode;
  loop: ReturnType<typeof useLoop>;
}) {
  return (
    <div
      ref={loop}
      aria-hidden
      className="relative grid h-full w-full place-items-center overflow-hidden [container-type:size]"
      style={{ background: bg }}
    >
      <div
        data-stage
        className="relative aspect-[16/10] w-[min(94cqw,150cqh)] select-none [container-type:inline-size]"
      >
        {children}
      </div>
    </div>
  );
}

function Cursor({ fill = "#17150f" }: { fill?: string }) {
  return (
    <svg
      data-cursor
      viewBox="0 0 24 24"
      className="absolute z-30 w-[2.6cqw] drop-shadow-[0_0.3cqw_0.4cqw_rgb(0_0_0/0.25)]"
      style={{ left: "70%", top: "70%", opacity: 0 }}
    >
      <path
        d="M4 2l16 9.5-7 1.5-3.6 6.5z"
        fill={fill}
        stroke="#fff"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Clips start and stop from the timeline; under reduced motion they stay on their poster frame.
const playClip = (tl: gsap.core.Timeline, v: HTMLVideoElement, t: number) =>
  tl.call(
    () => {
      v.dataset.active = "1";
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      v.currentTime = 0;
      v.play().catch(() => {});
    },
    [],
    t,
  );
const stopClip = (tl: gsap.core.Timeline, v: HTMLVideoElement, t: number) =>
  tl.call(
    () => {
      delete v.dataset.active;
      v.pause();
    },
    [],
    t,
  );

const press = (
  tl: gsap.core.Timeline,
  el: HTMLElement | undefined,
  t: number | string,
) =>
  tl
    .to(el ?? [], { scale: 0.94, duration: 0.1, ease: "power2.out" }, t)
    .to(el ?? [], { scale: 1, duration: 0.25, ease: "power2.out" });

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
        <rect
          key={`b${x}${y}`}
          x={x * 10 + 1}
          y={y * 10 + 1}
          width="8"
          height="8"
          rx="2.4"
          fill="#F55636"
        />
      ))}
      {small.map(([x, y]) => (
        <rect
          key={`s${x}${y}`}
          x={x * 10 + 3}
          y={y * 10 + 3}
          width="4"
          height="4"
          rx="1.3"
          fill="#F55636"
        />
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
      .to(
        cursor,
        { opacity: 1, ...at($("[data-input]")[0], 0.85, 0.5), duration: 0.6 },
        0.2,
      )
      .to(
        typing,
        { p: 1, duration: 1.3, ease: "steps(30)", onUpdate: type },
        0.5,
      )
      // generate
      .to(
        cursor,
        { ...at(gen, 0.6, 0.55), duration: 0.6, ease: "power2.inOut" },
        1.9,
      );
    press(tl, gen, 2.5);
    tl.to($("[data-gen-idle]"), { opacity: 0, duration: 0.2 }, 2.6)
      .to($("[data-gen-busy]"), { opacity: 1, duration: 0.2 }, 2.6)
      .to(scans, { opacity: 1, duration: 0.1, stagger: 0.25 }, 3.0)
      .to(
        cards,
        {
          clipPath: "inset(0 0 0% 0)",
          duration: 0.9,
          ease: "power2.inOut",
          stagger: 0.25,
        },
        3.0,
      )
      .to(
        scans,
        { top: "100%", duration: 0.9, ease: "power2.inOut", stagger: 0.25 },
        3.0,
      )
      .to(scans, { opacity: 0, duration: 0.2, stagger: 0.25 }, 3.9)
      .to($("[data-gen-busy]"), { opacity: 0, duration: 0.2 }, 4.1)
      .to($("[data-gen-idle]"), { opacity: 1, duration: 0.2 }, 4.1)
      .to(
        $("[data-count]"),
        { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2)" },
        4.15,
      )
      .addLabel("poster", 4.6)
      // turn the scene into a video
      .to(
        cursor,
        { ...at(tabVideo, 0.5, 0.6), duration: 0.6, ease: "power2.inOut" },
        4.7,
      );
    press(tl, tabVideo, 5.3);
    tl.to(
      $("[data-pill]"),
      { xPercent: 100, duration: 0.45, ease: "power3.inOut" },
      5.35,
    )
      .to(cursor, { opacity: 0, duration: 0.3 }, 5.6)
      .to(panel, { opacity: 1, y: "0%", duration: 0.6 }, 5.5)
      .to(kb, { scale: 1.14, duration: 3.4, ease: "none" }, 5.6)
      .to(
        $("[data-playhead]"),
        { left: "100%", duration: 3.4, ease: "none" },
        5.6,
      );
    thumbs.forEach((th, i) =>
      tl
        .to(
          th,
          { outlineColor: "rgba(255,86,54,1)", duration: 0.15 },
          5.6 + i * 1.13,
        )
        .to(
          th,
          { outlineColor: "rgba(255,86,54,0)", duration: 0.15 },
          5.6 + (i + 1) * 1.13,
        ),
    );
    subs.forEach((w, i) =>
      tl
        .to(
          w,
          { backgroundColor: "rgba(255,86,54,1)", duration: 0.12 },
          5.9 + i * 0.5,
        )
        .to(
          w,
          { backgroundColor: "rgba(255,86,54,0)", duration: 0.12 },
          5.9 + (i + 1) * 0.5,
        ),
    );
    tl.to(body, { opacity: 0, duration: 0.4 }, 9.4);
  });

  return (
    <Stage bg="#efeaf7" loop={loop}>
      <div
        data-body
        className="absolute inset-0 flex flex-col overflow-hidden rounded-[1.6cqw] border border-[#ece9f5] bg-[#fbf9ff] font-sans text-[#0E0E0E] shadow-[0_2cqw_5cqw_-2cqw_rgb(79_53_255/0.25)]"
      >
        <div className="flex h-[7cqw] shrink-0 items-center justify-between border-b border-[#ece9f5] px-[2.6cqw]">
          <span className="flex items-center gap-[0.8cqw] text-[1.8cqw] font-bold tracking-[-0.03em]">
            <PicgenioMark className="w-[2.4cqw]" />
            Picgenio
          </span>
          <span className="relative flex rounded-full bg-[#f1eefb] p-[0.4cqw] text-[1.25cqw] font-medium">
            <span
              data-pill
              className="absolute inset-y-[0.4cqw] left-[0.4cqw] w-[9cqw] rounded-full bg-white shadow-[0_0.2cqw_0.6cqw_rgb(79_53_255/0.15)]"
            />
            {["Imagen", "Vídeo", "Storyboard"].map((t, i) => (
              <span
                key={t}
                data-tab-video={i === 1 ? "" : undefined}
                className="relative z-10 w-[9cqw] py-[0.6cqw] text-center"
              >
                {t}
              </span>
            ))}
          </span>
          <span className="rounded-[0.8cqw] bg-[#4F35FF] px-[1.4cqw] py-[0.7cqw] text-[1.2cqw] font-semibold text-white">
            Mi cuenta
          </span>
        </div>

        <div className="relative flex flex-1 gap-[2.4cqw] p-[2.6cqw]">
          {/* inputs */}
          <div className="flex w-[28cqw] shrink-0 flex-col gap-[1.2cqw]">
            <p className="text-[1.2cqw] font-semibold text-[#7c7589]">
              Tu foto actual
            </p>
            <div className="relative aspect-square overflow-hidden rounded-[1.2cqw] border border-[#ece9f5] bg-white">
              <Image
                src="/work/picgenio/original.webp"
                alt=""
                fill
                sizes="30vw"
                className="object-cover"
              />
            </div>
            <p className="mt-[0.4cqw] text-[1.2cqw] font-semibold text-[#7c7589]">
              Describe el escenario
            </p>
            <div
              data-input
              className="relative flex h-[4.6cqw] items-center rounded-[0.9cqw] border border-[#ece9f5] bg-white px-[1.2cqw] text-[1.25cqw]"
            >
              <span data-typed className="whitespace-nowrap">
                Salón nórdico, luz cálida de tarde
              </span>
              <span
                data-caret
                className="absolute top-1/2 h-[1.8cqw] w-[0.18cqw] -translate-y-1/2 animate-pulse bg-[#FF5636]"
              />
            </div>
            <div
              data-generate
              className="relative grid h-[4.6cqw] place-items-center rounded-[0.9cqw] bg-[#FF5636] text-[1.35cqw] font-semibold text-white"
            >
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
              <span
                data-count
                className="rounded-full bg-[#FF5636] px-[0.8cqw] text-[1.1cqw] leading-[1.9cqw] text-white"
              >
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
                      <Image
                        src={src}
                        alt=""
                        fill
                        sizes="25vw"
                        className="object-cover"
                      />
                    </div>
                    <span
                      data-scan
                      className="absolute inset-x-0 h-[0.3cqw] bg-[#FF5636] shadow-[0_0_1.2cqw_0.3cqw_rgb(255_86_54/0.6)]"
                    />
                  </div>
                  <span className="text-[1.15cqw] font-medium">{label}</span>
                </div>
              ))}
            </div>

            {/* video generator */}
            <div
              data-video
              className="absolute inset-0 flex flex-col gap-[1cqw] bg-[#fbf9ff]"
            >
              <p className="text-[1.2cqw] font-semibold text-[#7c7589]">
                Generador de vídeos · Fotograma inicial
              </p>
              <div className="relative flex-1 overflow-hidden rounded-[1.2cqw] bg-black">
                <div
                  data-kenburns
                  className="absolute inset-0 origin-[60%_55%]"
                >
                  <Image
                    src="/work/picgenio/escena-lifestyle.webp"
                    alt=""
                    fill
                    sizes="40vw"
                    className="object-cover object-[50%_60%]"
                  />
                </div>
                <div className="absolute inset-x-0 bottom-[2.2cqw] flex justify-center gap-[0.5cqw] text-[1.9cqw] font-extrabold uppercase tracking-tight">
                  {words.map((w) => (
                    <span
                      key={w}
                      data-word
                      className="rounded-[0.4cqw] px-[0.5cqw] [text-shadow:0_0.15cqw_0.5cqw_rgb(0_0_0/0.5)]"
                    >
                      {w}
                    </span>
                  ))}
                </div>
                <span className="absolute left-[1.2cqw] top-[1.2cqw] rounded-full bg-black/55 px-[1cqw] py-[0.3cqw] text-[1cqw] font-medium text-white">
                  Kling · 5 s
                </span>
              </div>
              <div className="flex items-center gap-[1cqw]">
                <span className="shrink-0 text-[1.1cqw] font-semibold">
                  Storyboard IA · 3 escenas
                </span>
                <div className="relative grid flex-1 grid-cols-3 gap-[0.6cqw]">
                  {["original", "sillon-editorial", "escena-lifestyle"].map(
                    (n) => (
                      <div
                        key={n}
                        data-thumb
                        className="relative h-[5cqw] overflow-hidden rounded-[0.6cqw] outline outline-[0.25cqw] outline-offset-[0.15cqw]"
                      >
                        <Image
                          src={`/work/picgenio/${n}.webp`}
                          alt=""
                          fill
                          sizes="10vw"
                          className="object-cover"
                        />
                      </div>
                    ),
                  )}
                  <span
                    data-playhead
                    className="absolute -bottom-[0.6cqw] -top-[0.6cqw] w-[0.2cqw] bg-[#4F35FF]"
                  />
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
        <linearGradient
          id="brot-pot"
          x1="48"
          y1="50"
          x2="48"
          y2="92"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#e59767" />
          <stop offset="1" stopColor="#d98352" />
        </linearGradient>
      </defs>
      <path
        d="M48 40 C 46 28 38 22 27 21 C 29 32 37 39 48 40 Z"
        fill="#1f9d55"
      />
      <path
        d="M48 40 C 51 26 60 19 71 20 C 69 33 60 39 48 40 Z"
        fill="#3ec277"
      />
      <ellipse cx="48" cy="43" rx="20" ry="4" fill="#6b4a32" />
      <rect x="19" y="40" width="58" height="11" rx="5.5" fill="#b96a3f" />
      <path d="M24 51 L 72 51 L 67 88 Q 48 92 29 88 Z" fill="url(#brot-pot)" />
      <ellipse cx="30" cy="73" rx="6" ry="4.2" fill="#ffd9c2" opacity="0.95" />
      <ellipse cx="66" cy="73" rx="6" ry="4.2" fill="#ffd9c2" opacity="0.95" />
      <rect x="31" y="57" width="9.4" height="14" rx="4.7" fill="#14281c" />
      <rect x="55.6" y="57" width="9.4" height="14" rx="4.7" fill="#14281c" />
      <circle cx="36.7" cy="60.4" r="1.6" fill="#fff" opacity="0.7" />
      <circle cx="61.3" cy="60.4" r="1.6" fill="#fff" opacity="0.7" />
      <path
        d="M42 77 Q 48 83 54 77"
        stroke="#14281c"
        strokeWidth="2.9"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

const Chip = ({ children }: { children: ReactNode }) => (
  <span className="rounded-[0.5cqw] bg-[#dcf9e4] px-[0.5cqw] font-bold text-[#00622d]">
    {children}
  </span>
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
      .set($("[data-opt]"), {
        backgroundColor: "#fefffe",
        borderColor: "#dbe1dd",
      })
      .set($("[data-feedback]"), { yPercent: 120, opacity: 0 })
      .set($("[data-mascot]"), { scale: 0.4, opacity: 0, rotate: -12 })
      .set($("[data-solution]"), { opacity: 0, y: "20%" })
      .set(finger, { opacity: 0, scale: 1.4 })
      .set(cursor, { opacity: 0, left: "40%", top: "92%" })
      .fromTo(body, { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0)
      // the class answers on their phones
      .to(
        ok,
        {
          backgroundColor: "#00853d",
          duration: 0.2,
          stagger: { amount: 3.2, from: "random" },
        },
        0.4,
      )
      .to(
        ko,
        {
          backgroundColor: "#d03833",
          duration: 0.2,
          stagger: { amount: 3.0, from: "random" },
        },
        0.6,
      )
      .to(
        answered,
        {
          n: ok.length + ko.length,
          pct: (ok.length / (ok.length + ko.length)) * 100,
          duration: 3.4,
          ease: "power1.inOut",
          onUpdate: show,
        },
        0.4,
      )
      // one of them, up close
      .to(finger, { ...at(opt), opacity: 0.85, scale: 1, duration: 0.5 }, 0.8)
      .to(
        opt,
        { backgroundColor: "#dcf9e4", borderColor: "#00853d", duration: 0.2 },
        1.3,
      )
      .to(finger, { ...at(check), duration: 0.45, ease: "power2.inOut" }, 1.6);
    press(tl, check, 2.05);
    tl.to(finger, { opacity: 0, duration: 0.3 }, 2.2)
      .to(
        $("[data-feedback]"),
        { yPercent: 0, opacity: 1, duration: 0.5 },
        2.25,
      )
      .to(
        $("[data-mascot]"),
        {
          scale: 1,
          opacity: 1,
          rotate: 0,
          duration: 0.7,
          ease: "back.out(2.4)",
        },
        2.35,
      )
      // the teacher closes the question
      .to(
        cursor,
        {
          opacity: 1,
          ...at(reveal, 0.4, 0.6),
          duration: 0.8,
          ease: "power2.inOut",
        },
        3.9,
      );
    press(tl, reveal, 4.75);
    tl.to($("[data-solution]"), { opacity: 1, y: "0%", duration: 0.5 }, 4.85)
      .to(cursor, { opacity: 0, duration: 0.3 }, 5.2)
      .addLabel("poster", 5.6)
      .to(body, { opacity: 0, duration: 0.4 }, 8.2);
  });

  return (
    <Stage bg="#eaf3ed" loop={loop}>
      <div data-body className="absolute inset-0 font-sans text-[#1b2720]">
        <div
          className="absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              "radial-gradient(#b9cbbf 0.12cqw, transparent 0.16cqw)",
            backgroundSize: "2.2cqw 2.2cqw",
          }}
        />

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
            Un cotxe surt d&rsquo;aturat i accelera a <Chip>2</Chip> m/s² durant{" "}
            <Chip>3</Chip> s. A quina velocitat arriba?
          </div>

          <div className="grid grid-cols-3 gap-[1cqw]">
            {[
              [
                <span key="n" data-answered>
                  0
                </span>,
                "han respost",
              ],
              [
                <span key="p" data-pct>
                  0 %
                </span>,
                "d'encerts",
              ],
              ["132", "connectats"],
            ].map(([v, l], i) => (
              <div
                key={i}
                className="rounded-[1cqw] border border-[#dbe1dd] px-[1.2cqw] py-[0.9cqw]"
              >
                <p className="text-[2.4cqw] font-extrabold leading-none tabular-nums tracking-[-0.03em]">
                  {v}
                </p>
                <p className="mt-[0.4cqw] text-[1.05cqw] text-[#505b54]">{l}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-[repeat(18,minmax(0,1fr))] gap-[0.5cqw]">
            {seats.map((s, i) => (
              <span
                key={i}
                data-seat={s}
                className="aspect-square rounded-full bg-[#dbe1dd]"
              />
            ))}
          </div>
          <div className="flex gap-[1.6cqw] text-[1.05cqw] text-[#505b54]">
            {[
              ["#00853d", "L'ha encertada"],
              ["#d03833", "No l'ha encertada"],
              ["#dbe1dd", "Encara no ha contestat"],
            ].map(([c, l]) => (
              <span key={l} className="flex items-center gap-[0.5cqw]">
                <span
                  className="size-[0.9cqw] rounded-full"
                  style={{ background: c }}
                />
                {l}
              </span>
            ))}
          </div>

          <div className="mt-auto flex items-center gap-[1cqw] text-[1.2cqw] font-semibold">
            <span className="rounded-[0.9cqw] border border-[#dbe1dd] px-[1.3cqw] py-[0.8cqw]">
              + Qüestió ràpida
            </span>
            <span
              data-reveal-btn
              className="rounded-[0.9cqw] bg-[#00853d] px-[1.3cqw] py-[0.8cqw] text-white shadow-[0_0.35cqw_0_#00622d]"
            >
              Mostra la solució i tanca
            </span>
            <span
              data-solution
              className="ml-auto flex items-center gap-[0.6cqw] text-[1.3cqw] text-[#00622d]"
            >
              <svg
                viewBox="0 0 12 12"
                className="w-[1.4cqw]"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
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
            <p className="text-[1.05cqw] font-semibold text-[#505b54]">
              Apartat 2 de 4
            </p>
            <div className="h-[0.6cqw] rounded-full bg-[#dcf9e4]">
              <div className="h-full w-1/2 rounded-full bg-[#29c271]" />
            </div>
            <p className="text-[1.35cqw] font-semibold leading-snug">
              <Chip>2</Chip> m/s² durant <Chip>3</Chip> s. A quina velocitat
              arriba?
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
            <span
              data-check
              className="rounded-[0.9cqw] bg-[#00853d] py-[0.9cqw] text-center text-[1.3cqw] font-bold text-white shadow-[0_0.35cqw_0_#00622d]"
            >
              Comprova
            </span>
            <div
              data-feedback
              className="absolute inset-x-0 bottom-0 flex items-center gap-[1cqw] bg-[#dcf9e4] px-[1.6cqw] pb-[1.8cqw] pt-[1.4cqw]"
            >
              <div>
                <p className="text-[1.5cqw] font-extrabold text-[#00622d]">
                  Correcte!
                </p>
                <p className="text-[1.15cqw] font-semibold text-[#00853d]">
                  +10 punts
                </p>
              </div>
              <span data-mascot className="ml-auto w-[5.2cqw]">
                <Brot className="w-full" />
              </span>
            </div>
          </div>
          <span
            data-finger
            className="absolute z-20 size-[3cqw] -translate-x-1/2 -translate-y-1/2 rounded-full border-[0.25cqw] border-white bg-[#1b2720]/35"
            style={{ left: "50%", top: "80%" }}
          />
        </div>
      </div>
      <Cursor />
    </Stage>
  );
}

// ---------------------------------------------------------------- Traingenio

const tgSources = [
  ["manual", "manual-barista-pro.pdf", "PDF · 2,4 MB"],
  ["ficha", "ficha-tecnica.pdf", "PDF · 860 KB"],
  ["catalogo", "catalogo-2026.pptx", "PPTX · 5,1 MB"],
];
const tgSteps = [
  "Leyendo tus fuentes",
  "Escribiendo el guión",
  "Analizando imágenes y vídeos",
  "Creando la formación",
];
const tgQuiz = [
  "Permite grabar un único vídeo de formación para toda la empresa.",
  "Traduce los documentos de producto a más de 50 idiomas.",
  "Genera formaciones distintas para cada equipo a partir de la misma ficha.",
  "Organiza reuniones virtuales entre departamentos.",
];

const Tick = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 12 12"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
  >
    <path d="M2.5 6.5 5 9l4.5-5.5" />
  </svg>
);

export function TraingenioDemo() {
  const loop = useLoop((tl, $, at) => {
    const [body] = $("[data-body]");
    const [cursor] = $("[data-cursor]");
    const rows = $("[data-src]");
    const ups = $("[data-up]");
    const oks = $("[data-ok]");
    const chips = $("[data-chip='on']");
    const tabs = $("[data-tab]");
    const [pill] = $("[data-tabpill]");
    const [overlay] = $("[data-genov]");
    const spins = $("[data-spin]");
    const ticks = $("[data-tick]");
    const chapters = $("[data-ch]");
    const [avatar, motion] = $("video") as HTMLVideoElement[];
    const [quiz] = $("[data-quizpanel]");
    const [pick] = $("[data-pick]");
    const status = (s: "idle" | "busy" | "done") =>
      tl
        .set($("[data-status]"), { display: "none" })
        .set($(`[data-status='${s}']`), { display: "flex" });

    tl.set(rows, { opacity: 0, x: "-6%" })
      .set(ups, { scaleX: 0 })
      .set(oks, { scale: 0, opacity: 0 })
      .set(chips, {
        backgroundColor: "#ffffff",
        color: "#56604F",
        borderColor: "#D6DDCE",
      })
      .set(pill, { x: 0 })
      .set(tabs, { color: "#56604F" })
      .set(tabs[0], { color: "#091504" })
      .set(overlay, { opacity: 0 })
      .set(spins, { opacity: 1 })
      .set(ticks, { scale: 0, opacity: 0 })
      .set($("[data-progress]"), { scaleX: 0 })
      .set($("[data-skeleton]"), { opacity: 1 })
      .set([avatar, motion, quiz], { opacity: 0 })
      .set(chapters, { scaleX: 0 })
      .set(pick, { backgroundColor: "#ffffff", borderColor: "#D6DDCE" })
      .set($("[data-pick-badge]"), {
        backgroundColor: "#F2F4F1",
        color: "#56604F",
      })
      .set($("[data-verdict]"), { opacity: 0, x: "-10%" })
      .set($("[data-result]"), { opacity: 0, y: "20%" })
      .set($("[data-publish]"), { opacity: 0.35 })
      .set(cursor, { opacity: 0, left: "60%", top: "80%" });
    status("idle");
    stopClip(tl, avatar, 0);
    stopClip(tl, motion, 0);
    tl.call(
      () => {
        // Start buffering the clips while the sources "upload".
        for (const v of [avatar, motion])
          if (v.preload !== "auto") v.preload = "auto";
      },
      [],
      0.1,
    );

    // Sube la información
    tl.fromTo(body, { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0)
      .to(rows, { opacity: 1, x: "0%", duration: 0.5, stagger: 0.32 }, 0.3)
      .to(
        ups,
        { scaleX: 1, duration: 0.75, ease: "power2.inOut", stagger: 0.32 },
        0.45,
      )
      .to(
        oks,
        {
          scale: 1,
          opacity: 1,
          duration: 0.35,
          ease: "back.out(3)",
          stagger: 0.32,
        },
        1.2,
      )
      .to(
        chips,
        {
          backgroundColor: "#EAF6E2",
          color: "#2E7D14",
          borderColor: "#8CE85F",
          duration: 0.25,
          stagger: 0.14,
        },
        2.0,
      );

    // Genera la formación
    status("busy");
    tl.to(overlay, { opacity: 1, duration: 0.4 }, 2.55).to(
      $("[data-progress]"),
      { scaleX: 1, duration: 2.3, ease: "power1.inOut" },
      2.7,
    );
    ticks.forEach((t, i) =>
      tl
        .to(spins[i], { opacity: 0, duration: 0.15 }, 3.1 + i * 0.5)
        .to(
          t,
          { scale: 1, opacity: 1, duration: 0.35, ease: "back.out(3)" },
          3.1 + i * 0.5,
        ),
    );

    // Result: the avatar video
    tl.to(overlay, { opacity: 0, duration: 0.45 }, 5.15).to(
      $("[data-skeleton]"),
      { opacity: 0, duration: 0.3 },
      5.15,
    );
    tl.set($("[data-status]"), { display: "none" }, 5.2).set(
      $("[data-status='done']"),
      { display: "flex" },
      5.2,
    );
    tl.to($("[data-publish]"), { opacity: 1, duration: 0.3 }, 5.2).to(
      avatar,
      { opacity: 1, duration: 0.5 },
      5.15,
    );
    playClip(tl, avatar, 5.15);
    tl.to(
      chapters,
      { scaleX: 1, duration: 1.3, ease: "none", stagger: 1.3 },
      5.25,
    )
      .addLabel("poster", 7.4)

      // Motion vídeo
      .to(
        cursor,
        {
          opacity: 1,
          ...at(tabs[1], 0.5, 0.7),
          duration: 0.7,
          ease: "power2.inOut",
        },
        9.7,
      );
    press(tl, tabs[1], 10.45);
    tl.to(
      pill,
      {
        x: () => tabs[1].offsetLeft - tabs[0].offsetLeft,
        duration: 0.45,
        ease: "power3.inOut",
      },
      10.5,
    )
      .to(tabs[0], { color: "#56604F", duration: 0.2 }, 10.5)
      .to(tabs[1], { color: "#091504", duration: 0.2 }, 10.5)
      .to(motion, { opacity: 1, duration: 0.45 }, 10.55)
      .to(avatar, { opacity: 0, duration: 0.3 }, 10.75)
      .set(chapters, { scaleX: 0 }, 10.6)
      .to(
        chapters,
        { scaleX: 1, duration: 1.1, ease: "none", stagger: 1.1 },
        10.65,
      )
      .to(cursor, { opacity: 0, duration: 0.3 }, 10.9);
    stopClip(tl, avatar, 11.1);
    playClip(tl, motion, 10.55);

    // Quiz
    tl.to(
      cursor,
      {
        opacity: 1,
        ...at(tabs[2], 0.5, 0.7),
        duration: 0.6,
        ease: "power2.inOut",
      },
      14.6,
    );
    press(tl, tabs[2], 15.25);
    tl.to(
      pill,
      {
        x: () => tabs[2].offsetLeft - tabs[0].offsetLeft,
        duration: 0.45,
        ease: "power3.inOut",
      },
      15.3,
    )
      .to(tabs[1], { color: "#56604F", duration: 0.2 }, 15.3)
      .to(tabs[2], { color: "#091504", duration: 0.2 }, 15.3)
      .fromTo(
        quiz,
        { opacity: 0, y: "3%" },
        { opacity: 1, y: "0%", duration: 0.5 },
        15.35,
      )
      .to(
        cursor,
        { ...at(pick, 0.82, 0.55), duration: 0.6, ease: "power2.inOut" },
        15.9,
      );
    stopClip(tl, motion, 15.9);
    press(tl, pick, 16.6);
    tl.to(
      pick,
      { backgroundColor: "#EAF6E2", borderColor: "#5DD62C", duration: 0.25 },
      16.65,
    )
      .to(
        $("[data-pick-badge]"),
        { backgroundColor: "#337418", color: "#ffffff", duration: 0.25 },
        16.65,
      )
      .to($("[data-verdict]"), { opacity: 1, x: "0%", duration: 0.35 }, 16.8)
      .to(cursor, { opacity: 0, duration: 0.3 }, 17.0)
      .to($("[data-result]"), { opacity: 1, y: "0%", duration: 0.5 }, 17.3)
      .to(body, { opacity: 0, duration: 0.45 }, 19.6);
  });

  return (
    <Stage bg="#e3e9de" loop={loop}>
      <div
        data-body
        className="absolute inset-0 flex flex-col overflow-hidden rounded-[1.6cqw] border border-[#D6DDCE] bg-[#F7F9F5] font-sans text-[#091504] shadow-[0_0.2cqw_0.4cqw_rgb(9_21_4/0.06),0_2.4cqw_5cqw_-2cqw_rgb(51_116_24/0.35)]"
      >
        {/* top bar */}
        <div className="flex h-[6cqw] shrink-0 items-center justify-between border-b border-[#D6DDCE] bg-white/70 px-[2.2cqw]">
          <span className="flex items-center gap-[2cqw]">
            <span
              className={`flex items-center gap-[0.8cqw] text-[1.75cqw] tracking-[-0.02em] ${serif.className}`}
            >
              <Image
                src="/work/traingenio/icon.svg"
                alt=""
                width={210}
                height={133}
                className="w-[2.8cqw]"
              />
              Traingenio
            </span>
            <span className="font-mono text-[0.95cqw] text-[#56604F]">
              Formaciones <span className="text-[#B9C6AE]">/</span>{" "}
              <span className="text-[#091504]">Everboarding · Barista Pro</span>
            </span>
          </span>
          <span className="flex items-center gap-[1.2cqw]">
            <span className="relative flex h-[2.6cqw] items-center font-mono text-[0.95cqw]">
              <span
                data-status="idle"
                className="items-center gap-[0.6cqw] text-[#56604F]"
              >
                <span className="size-[0.8cqw] rounded-full bg-[#D6DDCE]" />
                Borrador
              </span>
              <span
                data-status="busy"
                className="hidden items-center gap-[0.6cqw] text-[#337418]"
              >
                <span className="size-[1.1cqw] animate-spin rounded-full border-[0.18cqw] border-[#D6DDCE] border-t-[#337418]" />
                Generando…
              </span>
              <span
                data-status="done"
                className="hidden items-center gap-[0.6cqw] text-[#2E7D14]"
              >
                <span className="size-[0.8cqw] rounded-full bg-[#5DD62C] shadow-[0_0_0_0.3cqw_rgb(93_214_44/0.2)]" />
                Lista para publicar
              </span>
            </span>
            <span
              data-publish
              className="flex items-center gap-[0.8cqw] rounded-full bg-[#091504] py-[0.4cqw] pl-[1.3cqw] pr-[0.4cqw] text-[1.1cqw] font-semibold text-white"
            >
              Publicar
              <span className="grid size-[2cqw] place-items-center rounded-full bg-[#5DD62C] text-[#091504]">
                <svg
                  viewBox="0 0 16 16"
                  className="w-[1cqw]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                >
                  <path d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </span>
            </span>
          </span>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-[24cqw_1fr] items-center gap-[2cqw] p-[2.2cqw]">
          {/* left: sources, formats, avatar */}
          <div className="flex min-h-0 flex-col gap-[1.8cqw]">
            <div>
              <p className="mb-[0.9cqw] font-mono text-[0.9cqw] text-[#56604F]">
                01 · Sube la información
              </p>
              <div className="flex flex-col gap-[0.7cqw]">
                {tgSources.map(([img, name, meta]) => (
                  <div
                    key={name}
                    data-src
                    className="flex items-center gap-[0.9cqw] rounded-[0.9cqw] border border-[#D6DDCE] bg-white p-[0.6cqw] pr-[0.9cqw]"
                  >
                    <span className="relative aspect-[4/5] w-[3cqw] shrink-0 overflow-hidden rounded-[0.35cqw] border border-[#D6DDCE] bg-white">
                      <Image
                        src={`/work/traingenio/${img}.webp`}
                        alt=""
                        fill
                        sizes="40px"
                        className="object-cover object-top"
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[1.02cqw] font-semibold">
                        {name}
                      </span>
                      <span className="mt-[0.2cqw] block font-mono text-[0.82cqw] text-[#56604F]">
                        {meta}
                      </span>
                      <span className="mt-[0.45cqw] block h-[0.25cqw] overflow-hidden rounded-full bg-[#EAF6E2]">
                        <span
                          data-up
                          className="block h-full origin-left rounded-full bg-[#337418]"
                        />
                      </span>
                    </span>
                    <span
                      data-ok
                      className="grid size-[1.7cqw] shrink-0 place-items-center rounded-full bg-[#5DD62C] text-[#091504]"
                    >
                      <Tick className="w-[1cqw]" />
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-[0.9cqw] font-mono text-[0.9cqw] text-[#56604F]">
                02 · Formatos
              </p>
              <div className="flex flex-wrap gap-[0.5cqw] text-[1cqw] font-medium">
                {[
                  "Vídeo",
                  "Motion vídeo",
                  "Quiz",
                  "Podcast",
                  "Infografía",
                  "Role play",
                ].map((f, i) => (
                  <span
                    key={f}
                    data-chip={i < 3 ? "on" : "off"}
                    className="rounded-full border border-[#D6DDCE] bg-white px-[0.9cqw] py-[0.35cqw] text-[#56604F]"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-[0.9cqw] font-mono text-[0.9cqw] text-[#56604F]">
                03 · Avatar
              </p>
              <div className="flex items-center gap-[0.9cqw] rounded-[0.9cqw] border border-[#D6DDCE] bg-white p-[0.8cqw]">
                <span className="relative size-[3cqw] shrink-0 overflow-hidden rounded-full">
                  <Image
                    src="/work/traingenio/avatar-face.webp"
                    alt=""
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </span>
                <span className="min-w-0">
                  <span className="block text-[1.02cqw] font-semibold">
                    Avatar · Laura
                  </span>
                  <span className="block font-mono text-[0.82cqw] text-[#56604F]">
                    Español · voz natural
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* right: the generated training */}
          <div className="flex min-w-0 flex-col gap-[1.1cqw]">
            <div className="flex items-center justify-between">
              <div className="relative flex rounded-full bg-[#EBEFE7] p-[0.35cqw] text-[1.05cqw] font-semibold">
                <span
                  data-tabpill
                  className="absolute inset-y-[0.35cqw] left-[0.35cqw] w-[10.5cqw] rounded-full bg-white shadow-[0_0.15cqw_0.5cqw_rgb(9_21_4/0.12)]"
                />
                {["Vídeo", "Motion vídeo", "Quiz"].map((t) => (
                  <span
                    key={t}
                    data-tab
                    className="relative z-10 w-[10.5cqw] py-[0.55cqw] text-center"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <span className="font-mono text-[0.9cqw] text-[#56604F]">
                4 escenas · 1:24
              </span>
            </div>

            <div className="relative aspect-video w-full overflow-hidden rounded-[1.2cqw] bg-[#0f1c0b] shadow-[0_1.4cqw_3cqw_-1.6cqw_rgb(9_21_4/0.6)]">
              <div
                data-skeleton
                className="absolute inset-0 animate-pulse bg-[linear-gradient(110deg,#1a2a14_30%,#24381c_50%,#1a2a14_70%)]"
              />
              <video
                poster="/work/traingenio/avatar-poster.webp"
                muted
                playsInline
                loop
                preload="none"
                className="absolute inset-0 h-full w-full object-cover"
              >
                <source src="/work/traingenio/avatar.webm" type="video/webm" />
                <source src="/work/traingenio/avatar.mp4" type="video/mp4" />
              </video>
              <video
                poster="/work/traingenio/motion-poster.webp"
                muted
                playsInline
                loop
                preload="none"
                className="absolute inset-0 h-full w-full object-cover"
              >
                <source src="/work/traingenio/motion.webm" type="video/webm" />
                <source src="/work/traingenio/motion.mp4" type="video/mp4" />
              </video>

              {/* quiz */}
              <div
                data-quizpanel
                className="absolute inset-0 flex flex-col justify-center bg-[#F7F9F5] px-[4cqw]"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[0.9cqw] uppercase tracking-[0.08em] text-[#56604F]">
                    Pregunta 3 de 5
                  </span>
                  <span className="flex gap-[0.35cqw]">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <span
                        key={i}
                        className={`h-[0.4cqw] w-[2cqw] rounded-full ${i < 2 ? "bg-[#5DD62C]" : i === 2 ? "bg-[#337418]" : "bg-[#D6DDCE]"}`}
                      />
                    ))}
                  </span>
                </div>
                <p
                  className={`mt-[1.2cqw] text-[1.75cqw] leading-[1.25] tracking-[-0.01em] ${serif.className}`}
                >
                  ¿Qué ventaja clave ofrece una herramienta como Traingenio
                  según el contenido?
                </p>
                <div className="mt-[1.4cqw] flex flex-col gap-[0.6cqw]">
                  {tgQuiz.map((o, i) => (
                    <span
                      key={o}
                      data-pick={i === 2 ? "" : undefined}
                      className="flex items-center gap-[1cqw] rounded-[0.8cqw] border border-[#D6DDCE] bg-white px-[1cqw] py-[0.7cqw] text-[1.05cqw]"
                    >
                      <span
                        data-pick-badge={i === 2 ? "" : undefined}
                        className="grid size-[1.9cqw] shrink-0 place-items-center rounded-full bg-[#F2F4F1] font-mono text-[0.85cqw] font-semibold text-[#56604F]"
                      >
                        {"ABCD"[i]}
                      </span>
                      <span className="flex-1">{o}</span>
                      {i === 2 && (
                        <span
                          data-verdict
                          className="flex items-center gap-[0.3cqw] rounded-full bg-white px-[0.7cqw] py-[0.2cqw] font-mono text-[0.85cqw] font-semibold text-[#2E7D14]"
                        >
                          <Tick className="w-[0.9cqw]" />
                          Correcta
                        </span>
                      )}
                    </span>
                  ))}
                </div>
                <div
                  data-result
                  className="mt-[1.2cqw] flex items-center justify-between rounded-[0.8cqw] bg-[#091504] px-[1.2cqw] py-[0.8cqw] text-[1cqw] text-white"
                >
                  <span>Test terminado: 4 de 5 a la primera.</span>
                  <span className="flex items-center gap-[0.4cqw] font-semibold text-[#8CE85F]">
                    <Tick className="w-[1cqw]" />
                    Aprobado
                  </span>
                </div>
              </div>

              {/* generating */}
              <div
                data-genov
                className="absolute inset-0 flex flex-col items-center justify-center bg-[#091504]/92 text-white backdrop-blur-sm"
              >
                <p
                  className={`text-[2cqw] tracking-[-0.02em] ${serif.className}`}
                >
                  Generando la formación
                </p>
                <ul className="mt-[1.6cqw] space-y-[0.9cqw] text-[1.15cqw]">
                  {tgSteps.map((st) => (
                    <li key={st} className="flex items-center gap-[1cqw]">
                      <span className="relative grid size-[1.8cqw] place-items-center">
                        <span
                          data-spin
                          className="absolute inset-0 animate-spin rounded-full border-[0.18cqw] border-white/15 border-t-[#8CE85F]"
                        />
                        <span
                          data-tick
                          className="grid size-full place-items-center rounded-full bg-[#5DD62C] text-[#091504]"
                        >
                          <Tick className="w-[1cqw]" />
                        </span>
                      </span>
                      {st}
                    </li>
                  ))}
                </ul>
                <span className="absolute inset-x-0 bottom-0 h-[0.35cqw] bg-white/10">
                  <span
                    data-progress
                    className="block h-full origin-left bg-[#5DD62C]"
                  />
                </span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-[0.6cqw]">
              {[1, 2, 3, 4].map((n) => (
                <div key={n}>
                  <span className="block h-[0.35cqw] overflow-hidden rounded-full bg-[#D6DDCE]">
                    <span
                      data-ch
                      className="block h-full origin-left rounded-full bg-[#337418]"
                    />
                  </span>
                  <span className="mt-[0.4cqw] block font-mono text-[0.8cqw] text-[#56604F]">
                    Escena {n}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Cursor />
    </Stage>
  );
}
