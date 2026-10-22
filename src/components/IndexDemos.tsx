"use client";

import { Atkinson_Hyperlegible_Next, Big_Shoulders } from "next/font/google";
import { useEffect, useId, useRef } from "react";
import { RumiPet, FPS, type PetState } from "./rumi-pet";
import { Stage, useLoop } from "./Demos";

/*
 * The "Also built" previews. Each is a 4:3 scene sized in cqw (100 × 75), built from the
 * project's own material: Talaia's Figma tower and tokens, an ElevenLabs call, Rumi's real pet.
 */

const shoulders = Big_Shoulders({ subsets: ["latin"], weight: ["800"], preload: false });
const atkinson = Atkinson_Hyperlegible_Next({ subsets: ["latin"], weight: ["400", "700", "800"], preload: false });

const seeded = (seed: number) => () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);

// ---------------------------------------------------------------- Talaia

const tal = {
  nit: "#0E1433", card: "#141B42", sheet: "#161D45", vel: "#1E2657", crep: "#28316B", linia: "#26306A",
  vora: "#333D7A", lluna: "#EEF0F7", boira: "#9AA3C7", far: "#FFB547", ras: "#5FD4C4", tap: "#E0708A", jus: "#E3C58F",
};

const talPoints = [
  { nom: "Coll de Pal", lloc: "Bagà · 2.099 m", index: 91, banda: "ras", label: "CEL RAS", nuvols: "4 %", lluna: "12 %" },
  { nom: "Port d’Àger", lloc: "Àger · 904 m", index: 86, banda: "ras", label: "CEL RAS", nuvols: "9 %", lluna: "12 %" },
  { nom: "Prades", lloc: "Prades · 955 m", index: 63, banda: "jus", label: "REGULAR", nuvols: "31 %", lluna: "12 %" },
] as const;
const talHours = [
  ["21", [62, 70]], ["22", [78, 74]], ["23", [91, 86]], ["00", [88, 83]], ["01", [80, 77]], ["02", [71, 69]],
] as const;
const band = (v: number) => (v >= 70 ? tal.ras : v >= 40 ? tal.jus : tal.tap);
// Cassiopeia, the "W" the lighthouse beam draws in the welcome intro.
const cassiopeia = [[8, 15], [14.5, 21], [21, 14], [27.5, 20], [33, 11]];

export function TalaiaDemo() {
  // Unique per instance: a hidden mobile copy with the same id would swallow the gradient.
  const beam = `beam-${useId().replace(/:/g, "")}`;
  const r = seeded(11);
  const stars = Array.from({ length: 46 }, () => [r() * 100, r() * 52, 0.15 + r() * 0.25, r() * 4]);
  const loop = useLoop((tl, $) => {
    const rows = $("[data-row]");
    const nums = $("[data-num]");
    const bars = $("[data-hbar]");
    const [sel] = $("[data-sel]");
    const lines = $("[data-cas]");
    const vals = { a: 0, b: 0, c: 0 };
    const show = () => talPoints.forEach((p, i) => (nums[i].textContent = String(Math.round(vals["abc"[i] as "a"]))));

    tl.set(rows, { opacity: 0, x: "6%" })
      .set(vals, { a: 0, b: 0, c: 0, onComplete: show })
      .set(bars, { scaleY: 0 })
      .set(sel, { y: "0%" })
      .set(lines, { strokeDashoffset: 1 })
      .set($("[data-casstar]"), { opacity: 0.35 })
      .fromTo($("[data-sheet]"), { opacity: 0, y: "3%" }, { opacity: 1, y: "0%", duration: 0.6 }, 0.2)
      .to(rows, { opacity: 1, x: "0%", duration: 0.55, stagger: 0.12 }, 0.45)
      .to(vals, { a: 91, b: 86, c: 63, duration: 1.4, ease: "power2.out", onUpdate: show }, 0.6)
      .to(bars, { scaleY: 1, duration: 0.6, ease: "back.out(1.6)", stagger: 0.05 }, 1.1)
      // the beam lights Cassiopeia, star by star
      .to(lines, { strokeDashoffset: 0, duration: 0.5, ease: "none", stagger: 0.45 }, 1.6)
      .to($("[data-casstar]"), { opacity: 1, duration: 0.2, stagger: 0.45 }, 1.5)
      .addLabel("poster", 3.8)
      // pick the second point: its hourly forecast slides in
      .to(sel, { y: "100%", duration: 0.5, ease: "power3.inOut" }, 5.2)
      .to(bars, { scaleY: 0.2, duration: 0.25, stagger: 0.02 }, 5.2)
      .call(() => bars.forEach((b, i) => ((b.style.height = `${talHours[i][1][1]}%`), (b.style.background = band(talHours[i][1][1])))), [], 5.5)
      .to(bars, { scaleY: 1, duration: 0.5, ease: "back.out(1.6)", stagger: 0.05 }, 5.55)
      .call(() => bars.forEach((b, i) => ((b.style.height = `${talHours[i][1][0]}%`), (b.style.background = band(talHours[i][1][0])))), [], 0.01)
      .to($("[data-sheet]"), { opacity: 0, duration: 0.4 }, 9.4)
      .to(lines, { strokeDashoffset: 1, duration: 0.4 }, 9.4)
      .set({}, {}, 9.9);
  });

  return (
    <Stage bg="#0B1030" loop={loop} wide={false}>
      <div className={`absolute inset-0 overflow-hidden ${atkinson.className}`} style={{ background: "linear-gradient(180deg,#0B1030 0%,#17205A 58%,#2F3680 100%)" }}>
        {/* sky */}
        <div className="absolute left-[-10%] top-[8%] h-[30%] w-[90%] -rotate-[14deg] rounded-full bg-white/10 blur-[3cqw]" />
        {stars.map(([x, y, s, d], i) => (
          <span
            key={i}
            className="absolute rounded-full bg-[#EEF0F7]"
            style={{ left: `${x}%`, top: `${y}%`, width: `${s}cqw`, height: `${s}cqw`, animation: `twinkle ${3 + (i % 4)}s ease-in-out ${d}s infinite` }}
          />
        ))}
        <span className="absolute left-[46%] top-[10%] h-[0.15cqw] w-[9cqw] rotate-[24deg] bg-gradient-to-r from-transparent to-white/80" style={{ animation: "meteor 7s linear 1s infinite" }} />
        <svg viewBox="0 0 100 75" className="absolute inset-0 h-full w-full">
          {cassiopeia.slice(1).map(([x, y], i) => {
            const [px, py] = cassiopeia[i];
            return <line key={i} data-cas x1={px} y1={py} x2={x} y2={y} pathLength={1} strokeDasharray={1} stroke="#EEF0F7" strokeOpacity="0.55" strokeWidth="0.18" />;
          })}
          {cassiopeia.map(([x, y], i) => (
            <circle key={i} data-casstar cx={x} cy={y} r="0.55" fill="#EEF0F7" />
          ))}
        </svg>

        {/* the watchtower from the welcome screen */}
        <div className="absolute bottom-[9%] left-[2%] h-[48%] w-[44%] rounded-full" style={{ background: "radial-gradient(closest-side,#6E5FB073,transparent)" }} />
        <svg viewBox="0 0 100 75" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id={beam} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#FFB547" stopOpacity="0.7" />
              <stop offset="1" stopColor="#FFB547" stopOpacity="0" />
            </linearGradient>
          </defs>
          <g style={{ transformBox: "view-box", transformOrigin: "23px 34px", animation: "beam-sweep 9s ease-in-out infinite alternate" }}>
            <path d="M23 34 L75 25 L75 43 Z" fill={`url(#${beam})`} />
          </g>
          <path d="M0 75 V63 C25 60 38 57 50 56.5 C64 57 79 61 100 59.5 V75 Z" fill="#0B1030" />
          <g transform="translate(16.5 39)">
            <path d="M1.2 4.4 H11.8 L13 20 H0 Z" fill="#EEF0F7" />
            <rect x="0.6" y="2.6" width="11.8" height="2.2" rx="0.3" fill="#EEF0F7" />
            {[0.6, 5.3, 10.1].map((x) => (
              <rect key={x} x={x} y="0" width="2.3" height="2.8" rx="0.25" fill="#EEF0F7" />
            ))}
            <rect x="5.4" y="7.2" width="2.1" height="4.3" rx="1.05" fill="#FFB547" style={{ animation: "twinkle 3.6s ease-in-out infinite" }} />
          </g>
          <g style={{ transformBox: "fill-box", transformOrigin: "center", animation: "star-breathe 5.6s ease-in-out infinite" }}>
            <path d="M23 26.5 C23.45 29.3 25.05 30.9 27.8 31.3 C25.05 31.75 23.45 33.35 23 36.1 C22.55 33.35 20.95 31.75 18.2 31.3 C20.95 30.9 22.55 29.3 23 26.5 Z" fill="#FFB547" />
          </g>
        </svg>
        <p className={`absolute bottom-[3.5%] left-[4%] text-[5.6cqw] leading-none text-[#EEF0F7] ${shoulders.className}`}>talaia</p>

        {/* the app: tonight's recommendations */}
        <div data-sheet className="absolute bottom-[5%] right-[3.5%] top-[5%] flex w-[50%] flex-col gap-[1.4cqw] rounded-[2.6cqw] border p-[2.4cqw]" style={{ background: `${tal.sheet}f2`, borderColor: tal.linia }}>
          <div>
            <p className="text-[1.25cqw] font-extrabold tracking-[0.06em]" style={{ color: tal.far }}>AQUESTA NIT · DC 22 OCT</p>
            <p className="mt-[0.5cqw] text-[2.5cqw] font-bold leading-tight" style={{ color: tal.lluna }}>On mirar el cel</p>
          </div>
          <div className="relative flex flex-col gap-[1cqw]">
            <span data-sel className="absolute inset-x-0 top-0 h-[calc((100%-2cqw)/3)] rounded-[1.8cqw] border" style={{ background: tal.vel, borderColor: tal.vora }} />
            {talPoints.map((p) => (
              <div key={p.nom} data-row className="relative flex items-center justify-between rounded-[1.8cqw] border px-[1.6cqw] py-[1.1cqw]" style={{ borderColor: tal.linia }}>
                <div className="min-w-0">
                  <p className="truncate text-[1.75cqw] font-bold" style={{ color: tal.lluna }}>{p.nom}</p>
                  <p className="text-[1.25cqw]" style={{ color: tal.boira }}>{p.lloc}</p>
                  <p className="mt-[0.4cqw] flex gap-[1.2cqw] text-[1.15cqw]" style={{ color: "#D9C4A0" }}>
                    <span>☁ {p.nuvols}</span>
                    <span>☾ {p.lluna}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p data-num className={`text-[4.6cqw] leading-[0.95] ${shoulders.className}`} style={{ color: band(p.index) }}>
                    {p.index}
                  </p>
                  <p className="text-[0.95cqw] font-extrabold tracking-[0.05em]" style={{ color: band(p.index) }}>{p.label}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-auto">
            <p className="mb-[0.8cqw] text-[1.2cqw]" style={{ color: tal.boira }}>Índex per hores</p>
            <div className="flex h-[8cqw] items-end gap-[0.8cqw]">
              {talHours.map(([h, [v]]) => (
                <div key={h} className="flex h-full flex-1 flex-col justify-end gap-[0.4cqw]">
                  <span className="relative block flex-1 overflow-hidden rounded-[0.6cqw]" style={{ background: tal.crep }}>
                    <span data-hbar className="absolute inset-x-0 bottom-0 origin-bottom rounded-[0.6cqw]" style={{ height: `${v}%`, background: band(v) }} />
                  </span>
                  <span className="text-center text-[1.05cqw]" style={{ color: h === "23" ? tal.far : tal.boira }}>{h}h</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Stage>
  );
}

// ---------------------------------------------------------------- Voice agent (ElevenLabs)

export function ElevenLabsMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 10 14" className={className} aria-hidden>
      <rect x="1" y="0" width="2.6" height="14" fill="currentColor" />
      <rect x="6.4" y="0" width="2.6" height="14" fill="currentColor" />
    </svg>
  );
}

const call = [
  ["agent", "Hola! Sóc l’assistent de recollida de mobles de l’Ajuntament. En què et puc ajudar?"],
  ["vei", "Voldria que em recollissin un sofà i un matalàs."],
  ["agent", "Molt bé. A quina adreça?"],
  ["vei", "Rambla de Sant Sebastià, 12."],
  ["tool", "consulta_dies · 200"],
  ["agent", "Puc passar dijous 6 de novembre, de 8 a 12 h. Et va bé?"],
  ["vei", "Perfecte, gràcies."],
  ["tool", "crear_reserva · 201"],
] as const;

export function VoiceDemo() {
  const r = seeded(5);
  const bars = Array.from({ length: 22 }, () => 0.25 + r() * 0.75);
  const loop = useLoop((tl, $) => {
    const lines = $("[data-line]");
    const [orb] = $("[data-orb]");
    const [wave] = $("[data-wave]");
    const [timer] = $("[data-timer]");
    const clock = { s: 31 };
    const tick = () => (timer.textContent = `00:${String(Math.floor(clock.s)).padStart(2, "0")}`);
    const speak = (at: number, dur: number) =>
      tl.to(orb, { scale: 1.08, duration: 0.35, ease: "sine.inOut", repeat: Math.max(1, Math.round(dur / 0.35) - 1), yoyo: true }, at).to(wave, { opacity: 1, duration: 0.2 }, at).to(wave, { opacity: 0.25, duration: 0.3 }, at + dur);

    tl.set(lines, { opacity: 0, y: "30%" })
      .set($("[data-done]"), { opacity: 0, y: "20%" })
      .set(wave, { opacity: 0.25 })
      .set(clock, { s: 31, onComplete: tick })
      .to(clock, { s: 51, duration: 10.5, ease: "none", onUpdate: tick }, 0);
    let t = 0.3;
    lines.forEach((line, i) => {
      const [who] = call[i];
      tl.to(line, { opacity: 1, y: "0%", duration: 0.4 }, t);
      if (who === "agent") speak(t, 1.3);
      t += who === "tool" ? 0.7 : who === "agent" ? 1.45 : 1.05;
    });
    tl.to($("[data-done]"), { opacity: 1, y: "0%", duration: 0.5, ease: "back.out(1.6)" }, t)
      .addLabel("poster", t + 0.6)
      .to([...lines, ...$("[data-done]")], { opacity: 0, duration: 0.4 }, t + 2.6)
      .set({}, {}, t + 3.1);
  });

  return (
    <Stage bg="#F3F2EF" loop={loop} wide={false}>
      <div className="absolute inset-0 flex gap-[3cqw] bg-[radial-gradient(60%_70%_at_18%_45%,#E8E3FF_0%,transparent_70%),radial-gradient(50%_60%_at_85%_100%,#FFE7DA_0%,transparent_70%)] p-[3.5cqw] font-sans text-[#0B0B0C]">
        {/* the call */}
        <div className="flex w-[34cqw] shrink-0 flex-col items-center justify-between rounded-[3.4cqw] bg-[#0B0B0C] px-[2.4cqw] py-[3cqw] text-white shadow-[0_2.4cqw_4cqw_-2cqw_rgb(0_0_0/0.45)]">
          <div className="text-center">
            <p className="text-[1.25cqw] text-white/50">Trucada en curs · <span data-timer className="tabular-nums">00:31</span></p>
            <p className="mt-[0.6cqw] text-[2cqw] font-semibold leading-tight">Recollida de mobles</p>
            <p className="text-[1.25cqw] text-white/50">Ajuntament de Santa Coloma</p>
          </div>
          <div data-orb className="relative grid size-[17cqw] place-items-center">
            <div className="absolute inset-0 animate-[spin_8s_linear_infinite] rounded-full blur-[0.8cqw]" style={{ background: "conic-gradient(from 0deg,#5C7CFF,#A98BFF,#FF8FC4,#FFC9A1,#7FE0FF,#5C7CFF)" }} />
            <div className="absolute inset-[9%] rounded-full bg-[radial-gradient(circle_at_35%_30%,#ffffffee,#ffffff55_45%,transparent_70%)]" />
          </div>
          <div data-wave className="flex h-[4cqw] items-center gap-[0.35cqw]">
            {bars.map((h, i) => (
              <span key={i} className="block w-[0.45cqw] origin-center rounded-full bg-white" style={{ height: `${h * 100}%`, animation: `bars ${0.6 + (i % 5) * 0.11}s ease-in-out ${(i % 7) * -0.1}s infinite` }} />
            ))}
          </div>
          <div className="flex gap-[1.6cqw]">
            <span className="grid size-[4.4cqw] place-items-center rounded-full bg-white/12">
              <svg viewBox="0 0 24 24" className="w-[1.9cqw]" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="3" width="6" height="12" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>
            </span>
            <span className="grid size-[4.4cqw] place-items-center rounded-full bg-[#E5484D]">
              <svg viewBox="0 0 24 24" className="w-[2cqw] rotate-[135deg]" fill="currentColor"><path d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.6a1 1 0 0 1-.25 1z" /></svg>
            </span>
          </div>
        </div>

        {/* live transcript */}
        <div className="flex min-w-0 flex-1 flex-col rounded-[2.4cqw] border border-black/10 bg-white/85 p-[2.4cqw] shadow-[0_1.6cqw_3.2cqw_-2cqw_rgb(0_0_0/0.25)] backdrop-blur">
          <div className="flex items-center justify-between">
            <p className="text-[1.5cqw] font-semibold">Transcripció en directe</p>
            <span className="flex items-center gap-[0.5cqw] rounded-full bg-[#E9F8EE] px-[1cqw] py-[0.3cqw] text-[1.1cqw] font-medium text-[#1C7C3D]">
              <span className="size-[0.7cqw] animate-pulse rounded-full bg-current" /> ca · es
            </span>
          </div>
          <div className="mt-[1.6cqw] flex min-h-0 flex-1 flex-col justify-end gap-[0.9cqw] overflow-hidden text-[1.32cqw] leading-snug">
            {call.map(([who, text], i) =>
              who === "tool" ? (
                <p key={i} data-line className="flex items-center gap-[0.6cqw] self-start rounded-[0.7cqw] border border-dashed border-black/15 px-[0.9cqw] py-[0.35cqw] font-mono text-[1.08cqw] text-black/55">
                  <span className="text-[#5C7CFF]">↳ webhook</span> {text}
                </p>
              ) : (
                <p key={i} data-line className={`max-w-[85%] rounded-[1.3cqw] px-[1.3cqw] py-[0.8cqw] ${who === "agent" ? "self-start rounded-bl-[0.3cqw] bg-[#F1F0EE]" : "self-end rounded-br-[0.3cqw] bg-[#0B0B0C] text-white"}`}>
                  {text}
                </p>
              ),
            )}
            <div data-done className="mt-[0.4cqw] flex items-center gap-[1cqw] rounded-[1.3cqw] border border-[#BFE8CC] bg-[#F1FBF4] px-[1.3cqw] py-[0.9cqw]">
              <span className="grid size-[2.4cqw] place-items-center rounded-full bg-[#1C7C3D] text-white">
                <svg viewBox="0 0 12 12" className="w-[1.2cqw]" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M2.5 6.5 5 9l4.5-5.5" /></svg>
              </span>
              <span className="text-[1.3cqw]"><b>Reserva creada</b> · dj 6 nov · 8–12 h</span>
            </div>
          </div>
          <div className="mt-[1.6cqw] flex items-center justify-between border-t border-black/10 pt-[1.2cqw]">
            <span className="flex items-center gap-[0.6cqw] text-[1.55cqw] font-semibold tracking-[-0.02em]">
              <ElevenLabsMark className="h-[1.6cqw]" />
              ElevenLabs
            </span>
            <span className="font-mono text-[1.05cqw] text-black/45">Conversational AI · 7 webhooks</span>
          </div>
        </div>
      </div>
    </Stage>
  );
}

// ---------------------------------------------------------------- Rumi

const graph = {
  nodes: [
    { id: "jo", x: 50, y: 50, r: 2.4, label: "Jo/Identitat" },
    { id: "joan", x: 30, y: 36, r: 2, label: "Persones/Joan" },
    { id: "talaia", x: 70, y: 30, r: 1.7, label: "Coneixement/Talaia" },
    { id: "ep", x: 76, y: 62, r: 1.5, label: "Episodis/15-10" },
    { id: "skia", x: 88, y: 44, r: 1.1 },
    { id: "gym", x: 22, y: 64, r: 1.3, label: "Pensaments" },
    { id: "a", x: 40, y: 72, r: 1 },
    { id: "b", x: 58, y: 80, r: 0.9 },
    { id: "c", x: 14, y: 46, r: 0.9 },
    { id: "d", x: 46, y: 22, r: 1 },
    { id: "truita", x: 88, y: 80, r: 1, label: "Recepta de truita" },
  ],
  links: [
    ["jo", "joan"], ["jo", "talaia"], ["jo", "gym"], ["jo", "a"], ["joan", "talaia"], ["talaia", "ep"], ["talaia", "skia"],
    ["ep", "b"], ["joan", "c"], ["joan", "d"], ["d", "talaia"], ["gym", "a"], ["a", "b"], ["ep", "truita"],
  ],
};
const node = (id: string) => graph.nodes.find((n) => n.id === id)!;
const answer = "Que la faries amb Skia: la torre s’alça i el feix del far dibuixa la Cassiopea. A mi m’encanta.";
const question = "Què vam dir de la intro de Talaia?";

export function RumiDemo() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const pet = useRef<RumiPet | null>(null);

  // The pet runs its own 12 fps clock, only while on screen.
  useEffect(() => {
    const c = canvas.current!;
    const p = new RumiPet(c, 6);
    pet.current = p;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0, visible = false, last = 0, acc = 0;
    const frame = (now: number) => {
      acc += Math.min(0.25, (now - last) / 1000);
      last = now;
      while (acc >= 1 / FPS) {
        acc -= 1 / FPS;
        p.update(1 / FPS);
        if (p.state === "parla" && Math.random() < 0.55) p.talk();
      }
      p.draw();
      raf = requestAnimationFrame(frame);
    };
    const sync = () => {
      cancelAnimationFrame(raf);
      if (visible && !reduced && document.documentElement.dataset.motion !== "off") {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      } else p.draw();
    };
    p.set("repos");
    p.update(0.1);
    p.draw();
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      sync();
    });
    io.observe(c);
    addEventListener("motion:change", sync);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      removeEventListener("motion:change", sync);
    };
  }, []);

  const loop = useLoop((tl, $) => {
    const set = (s: PetState, at: number) => tl.call(() => pet.current?.set(s), [], at);
    const [typed] = $("[data-typed]");
    const [said] = $("[data-said]");
    const [night] = $("[data-night]");
    const [clock] = $("[data-clock]");
    const recall = ["joan", "talaia", "ep"];
    const typing = { n: 0 };
    const speech = { n: 0 };
    const showTyped = () => {
      const n = Math.round(typing.n);
      if (typed.textContent!.length !== n) pet.current?.nod();
      typed.textContent = question.slice(0, n);
    };
    const showSaid = () => (said.textContent = answer.slice(0, Math.round(speech.n)));

    tl.set(typing, { n: 0, onComplete: showTyped })
      .set(speech, { n: 0, onComplete: showSaid })
      .set($("[data-bubble]"), { opacity: 0, y: "10%" })
      .set($("[data-input]"), { opacity: 1 })
      .set($("[data-node]"), { fill: "#A88BFA" })
      .set($("[data-link]"), { attr: { stroke: "#6A6582", "stroke-width": 0.3 } })
      .set($("[data-truita]"), { x: 0, y: 0, opacity: 1 })
      .set($("[data-truita-link]"), { opacity: 1 })
      .set(night, { opacity: 0 })
      .set($("[data-menubar]"), { color: "#2B2A33", backgroundColor: "rgba(255,255,255,0.35)" })
      .set($("[data-dream]"), { opacity: 0 })
      .call(() => (clock.textContent = "18:42"), [], 0);
    graph.nodes.forEach((n) => tl.set($(`[data-node-id='${n.id}']`)[0], { attr: { r: n.r } }, 0));
    set("repos", 0);

    // you type, he listens
    set("escolta", 0.5);
    tl.to(typing, { n: question.length, duration: 1.5, ease: "none", onUpdate: showTyped }, 0.6);
    // he remembers: activation spreads through the vault
    set("pensa", 2.3);
    tl.to($("[data-input]"), { opacity: 0.4, duration: 0.3 }, 2.2);
    recall.forEach((id, i) => {
      const n = $(`[data-node-id='${id}']`)[0];
      tl.to(n, { fill: "#F6D365", attr: { r: node(id).r * 1.5 }, duration: 0.3 }, 2.4 + i * 0.4);
    });
    $("[data-link-hot]").forEach((l, i) => tl.to(l, { attr: { stroke: "#F6D365", "stroke-width": 0.55 }, duration: 0.3 }, 2.6 + i * 0.4));
    // he answers, in Catalan, word by word, with the note he took it from
    set("parla", 3.9);
    tl.to($("[data-bubble]"), { opacity: 1, y: "0%", duration: 0.4 }, 3.8)
      .to(speech, { n: answer.length, duration: 3.2, ease: "none", onUpdate: showSaid }, 4.0)
      .addLabel("poster", 7.4);
    set("content", 7.4);

    // night: he sleeps, dreams, strengthens what was recalled together and forgets what nobody used
    tl.to($("[data-bubble]"), { opacity: 0, duration: 0.4 }, 9.0)
      .to(night, { opacity: 1, duration: 1 }, 9.0)
      .to($("[data-menubar]"), { color: "#E4DBF3", backgroundColor: "rgba(255,255,255,0.06)", duration: 1 }, 9.0)
      .call(() => (clock.textContent = "23:58"), [], 9.3)
      .call(() => ((typed.textContent = ""), (typing.n = 0)), [], 9.3)
      .to($("[data-input]"), { opacity: 1, duration: 0.3 }, 9.4);
    set("dorm", 9.4);
    set("somia", 10.6);
    tl.to($("[data-dream]"), { opacity: 1, duration: 0.4 }, 10.7)
      .to($("[data-link-hot]"), { attr: { "stroke-width": 0.95 }, duration: 1.2, ease: "power2.inOut" }, 10.9)
      .to($("[data-truita-link]"), { opacity: 0, duration: 0.8 }, 11.2)
      .to($("[data-truita]"), { opacity: 0.2, x: 4, y: 6, duration: 1.6, ease: "power2.inOut" }, 11.4)
      .to(recall.map((id) => $(`[data-node-id='${id}']`)[0]), { fill: "#C9B6FF", duration: 0.6 }, 11.8)
      .to(night, { opacity: 0, duration: 1 }, 14.4)
      .to($("[data-menubar]"), { color: "#2B2A33", backgroundColor: "rgba(255,255,255,0.35)", duration: 1 }, 14.4)
      .to($("[data-dream]"), { opacity: 0, duration: 0.4 }, 14.4)
      .call(() => (clock.textContent = "07:30"), [], 14.6);
    set("desperta", 14.6);
    set("repos", 15.9);
    tl.set({}, {}, 16.4);
  });

  const hot = new Set(["joan-talaia", "talaia-ep", "jo-joan"]);
  return (
    <Stage bg="#EDE6F6" loop={loop} wide={false}>
      <div className="absolute inset-0 overflow-hidden font-sans" style={{ background: "linear-gradient(160deg,#EAE3F7 0%,#F6E8DD 55%,#F9EFE4 100%)" }}>
        <div className="absolute -left-[10%] top-[20%] size-[50cqw] rounded-full bg-[#C9B6FF]/45 blur-[6cqw]" />
        <div className="absolute -right-[8%] bottom-[-10%] size-[46cqw] rounded-full bg-[#FFC6A8]/50 blur-[6cqw]" />
        <div data-night className="absolute inset-0" style={{ background: "linear-gradient(160deg,#15173A 0%,#262352 60%,#3A2E5C 100%)" }} />

        {/* menu bar */}
        <div data-menubar className="absolute inset-x-0 top-0 flex h-[4cqw] items-center justify-between bg-white/35 px-[2.4cqw] text-[1.3cqw] text-[#2B2A33] backdrop-blur-md">
          <span className="font-semibold">Rumi</span>
          <span className="flex items-center gap-[1.6cqw]">
            <span className="flex items-center gap-[0.5cqw]"><span className="size-[0.8cqw] rounded-full bg-[#34C759]" />Ollama · gemma4:12b</span>
            <span data-clock className="tabular-nums">18:42</span>
          </span>
        </div>

        {/* the brain: his Obsidian vault */}
        <div className="absolute bottom-[6%] left-[4%] top-[10%] w-[52%] overflow-hidden rounded-[1.8cqw] border border-white/10 bg-[#1E1E22] shadow-[0_2cqw_4cqw_-2cqw_rgb(20_10_40/0.6)]">
          <div className="flex h-[3.6cqw] items-center gap-[0.6cqw] border-b border-white/10 px-[1.4cqw]">
            {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
              <span key={c} className="size-[0.9cqw] rounded-full" style={{ background: c }} />
            ))}
            <span className="ml-[1cqw] text-[1.15cqw] text-white/55">Cervell-Rumi · Graph view</span>
          </div>
          <svg viewBox="6 14 88 74" className="h-[calc(100%-3.6cqw)] w-full">
            {graph.links.map(([a, b]) => {
              const A = node(a), B = node(b), key = `${a}-${b}`;
              return (
                <line
                  key={key}
                  data-link
                  {...(hot.has(key) ? { "data-link-hot": "" } : {})}
                  {...(b === "truita" ? { "data-truita-link": "" } : {})}
                  x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke="#6A6582" strokeWidth="0.3"
                />
              );
            })}
            {graph.nodes.map((n) => (
              <g key={n.id} {...(n.id === "truita" ? { "data-truita": "" } : {})}>
                <circle data-node data-node-id={n.id} cx={n.x} cy={n.y} r={n.r} fill="#A88BFA" />
                {n.label && (
                  <text x={n.x} y={n.y + n.r + 3} textAnchor="middle" fontSize="2.6" fill="#ffffff" fillOpacity="0.62">
                    {n.label}
                  </text>
                )}
              </g>
            ))}
          </svg>
          <p data-dream className="absolute bottom-[3%] left-[4%] rounded-full bg-[#B9A3E3]/20 px-[1.2cqw] py-[0.4cqw] text-[1.1cqw] text-[#E4DBF3]">
            Somia · reforça 3 records · oblida 1 nota
          </p>
        </div>

        {/* the pet, his bubble and your message, in his own style */}
        <div className="absolute bottom-[6%] right-[4%] top-[10%] flex w-[37%] flex-col justify-end">
          <div data-bubble className="mb-[1.2cqw] rounded-[1.4cqw] border-[0.25cqw] border-[#2B2A33] bg-[#FFFDF8] px-[1.4cqw] py-[1cqw] text-[1.38cqw] leading-snug text-[#2B2A33] shadow-[0.4cqw_0.4cqw_0_rgb(43_42_51/0.18)]">
            <p data-said className="min-h-[5.6cqw]" />
            <p className="mt-[0.5cqw] text-[1.1cqw] text-[#8A8794]">Recorda · Episodis/2026-10-15</p>
          </div>
          <div className="grid place-items-center">
            <canvas ref={canvas} className="w-[24cqw] [image-rendering:pixelated]" />
          </div>
          <div data-input className="mt-[0.8cqw] rounded-[1.4cqw] border-[0.25cqw] border-[#2B2A33] bg-[#FFFDF8] px-[1.4cqw] py-[0.9cqw] text-[1.32cqw] text-[#2B2A33] shadow-[0.4cqw_0.4cqw_0_rgb(43_42_51/0.18)]">
            <span data-typed />
            <span className="ml-[0.1cqw] inline-block h-[1.5cqw] w-[0.15cqw] translate-y-[0.25cqw] animate-pulse bg-[#C97D93]" />
          </div>
          <p className="mt-[1cqw] text-center font-mono text-[1.05cqw] text-[#8A8794]">tot local · 0 crides al núvol</p>
        </div>
      </div>
    </Stage>
  );
}
