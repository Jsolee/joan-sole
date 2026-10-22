// Rumi, the real desktop pet from `IA Local/mascota/rumi.js`: a brain in a jar, drawn in pixels.
// No sprite sheets: every frame comes from the state, the clock and chance. Ported as is, typed.

export const W = 24;
export const H = 24;
const JX = 4;
const JY = 7;
export const FPS = 12;

const C = {
  glass: "#9EC3CC",
  lid: "#8A8F98",
  lidHi: "#A9AEB6",
  brain: "#E8A3B4",
  fold: "#C97D93",
  ink: "#3A2530",
  bubble: "#FFFFFF",
  shine: "#FFFFFF",
  blush: "#F09AAE",
  gold: "#F6D365",
  zzz: "#8E9BB8",
  heart: "#E06C8A",
  dream: "#B9A3E3",
  shadow: "rgba(43, 42, 51, .16)",
};
const LIQUID = { normal: "#E4F1EF", dorm: "#C8D5D8", somia: "#E4DBF3", idea: "#EEF8E8", confos: "#DCDCDC" };

const BRAIN = [".ppffpp.", "ppfppfpp", "pfppppfp", "pppppppp", "pppppppp", ".pppppp."];
const FOLDS: [number, number][] = [];
BRAIN.forEach((row, y) => [...row].forEach((c, x) => c === "f" && FOLDS.push([x, y])));
FOLDS.sort((a, b) => a[0] - b[0] || a[1] - b[1]);

type Glyph = "z" | "excl" | "q" | "heart" | "spark" | "dot" | "tear" | "star";
const GLYPHS: Record<Glyph, [string[], string]> = {
  z: [["zzz", "..z", ".z.", "z..", "zzz"], C.zzz],
  excl: [["y", "y", "y", ".", "y"], C.gold],
  q: [["zz.", "..z", ".z.", "...", ".z."], C.zzz],
  heart: [["h.h", "hhh", ".h."], C.heart],
  spark: [[".y.", "yyy", ".y."], C.gold],
  dot: [["y"], C.gold],
  tear: [["t", "t"], "#86B8E3"],
  star: [["y"], C.dream],
};

export type PetState =
  | "desperta" | "repos" | "escolta" | "pensa" | "parla" | "content" | "sorpresa"
  | "arrossegat" | "mareig" | "avorrit" | "dorm" | "somia" | "idea" | "confos" | "trist";

// Each state: bubbles per second and the colour of the liquid.
const STATES: Record<PetState, [number, keyof typeof LIQUID]> = {
  desperta: [0.4, "normal"], repos: [0.6, "normal"], escolta: [0.9, "normal"], pensa: [3.2, "normal"],
  parla: [1.2, "normal"], content: [2.2, "normal"], sorpresa: [2.5, "normal"], arrossegat: [5, "normal"],
  mareig: [1, "normal"], avorrit: [0.25, "normal"], dorm: [0.2, "dorm"], somia: [0.9, "somia"],
  idea: [2.6, "idea"], confos: [0.2, "confos"], trist: [0.3, "normal"],
};

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)];
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

type Eyes = "open" | "wide" | "half" | "closed" | "happy" | "dizzy";
type Mouth = "closed" | "open" | "o" | "smile" | "yawn" | "wavy";

export class RumiPet {
  t = 0;
  state: PetState = "desperta";
  since = 0;
  cursor: [number, number] | null = null;
  glance: [number, number] = [0, 0];
  glanceAt = 0;
  bubbles: { x: number; y: number; v: number; big: boolean }[] = [];
  fx: { glyph: Glyph; x: number; y: number; vy: number; life: number; born: number }[] = [];
  blinkAt = rand(1, 3);
  blinkUntil = 0;
  micro: { name: string; from: number } | null = null;
  microAt = rand(6, 12);
  mouthUntil = 0;
  nodUntil = 0;
  shake = 0;
  hop = 0;
  lean: [number, number] = [0, 0];
  fxAt = 0;
  private ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement, px = 6) {
    canvas.width = W * px;
    canvas.height = H * px;
    this.ctx = canvas.getContext("2d")!;
    this.ctx.scale(px, px);
  }

  set(state: PetState) {
    if (state === this.state) return;
    this.state = state;
    this.since = this.t;
    if (state === "sorpresa") { this.hop = 3; this.shake = 4; this.fly("excl", 18, 4); }
    if (state === "content") for (let i = 0; i < 3; i++) this.fly("heart", Math.round(rand(6, 16)), 5, -5, 1.6, i * 0.25);
    if (state === "mareig") this.shake = 6;
    if (state === "trist") this.fly("tear", JX + 6, JY + 10, 4, 0.9, 0.3);
    if (state === "idea") this.fxAt = this.t;
  }

  talk() { this.mouthUntil = this.t + 0.1; }
  nod() { this.nodUntil = this.t + 0.12; }

  fly(glyph: Glyph, x: number, y: number, vy = -6, life = 1.4, delay = 0) {
    this.fx.push({ glyph, x, y, vy, life, born: this.t + delay });
  }

  update(dt: number) {
    this.t += dt;
    const t = this.t, s = this.state, [rate] = STATES[s];

    if (Math.random() < rate * dt) this.bubbles.push({ x: Math.round(rand(2, 13)), y: 12.9, v: rand(2.5, 6), big: Math.random() < 0.12 });
    this.bubbles = this.bubbles.filter((b) => (b.y -= b.v * dt) > 3);

    this.fx = this.fx.filter((f) => t < f.born + f.life);
    for (const f of this.fx) if (t >= f.born) f.y += f.vy * dt;

    if (t > this.blinkAt) {
      this.blinkUntil = t + 0.13;
      this.blinkAt = t + (Math.random() < 0.2 ? 0.35 : rand(2, 6));
    }
    if (t > this.glanceAt) {
      this.glance = [pick([-1, 0, 0, 1]), pick([-1, 0, 0, 0, 1])];
      this.glanceAt = t + rand(2.5, 7);
    }
    if (s === "repos" && t > this.microAt) {
      this.micro = { name: pick(["bombolla", "pampallugues", "mira", "salt", "estira", "pampallugues"]), from: t };
      this.microAt = t + rand(8, 20);
      if (this.micro.name === "bombolla") this.bubbles.push({ x: 8, y: 9, v: 3, big: true });
      if (this.micro.name === "salt") this.hop = 2;
    }
    if (this.micro && t - this.micro.from > 1.6) this.micro = null;

    if (t > this.fxAt) {
      if (s === "dorm" || s === "somia") { this.fly("z", 17, 4, -2.5, 2.4); this.fxAt = t + 1.4; }
      else if (s === "idea") { this.fly("excl", 18, 3, -2, 1); this.hop = 2; this.fxAt = t + 2.6; }
      else if (s === "confos" || s === "mareig") { this.fly("q", 18, 3, -2, 1.4); this.fxAt = t + 2.2; }
      else if (s === "pensa") { this.fly("dot", 9 + Math.floor((t * 3) % 3) * 2, 4, 0, 0.5); this.fxAt = t + 0.33; }
      else this.fxAt = t + 0.5;
    }
    if (s === "somia" && Math.random() < 1.2 * dt) this.fly("star", JX + Math.round(rand(3, 12)), JY + Math.round(rand(4, 11)), -1, 0.8);
    if (s === "content" && Math.random() < 0.8 * dt) this.fly("heart", Math.round(rand(6, 16)), 5, -5, 1.4);

    if (this.shake > 0) this.shake -= 1;
    if (this.hop > 0) this.hop -= 1;
    this.lean = this.lean.map((v) => v * 0.8) as [number, number];
  }

  private pose() {
    const t = this.t, s = this.state, age = t - this.since, m = this.micro?.name;
    const breathe = (period: number) => Math.round((Math.sin((t * Math.PI * 2) / period) + 1) / 2);
    let x = 4, y = 4 + breathe(1.8);
    let eyes: Eyes = "open", mouth: Mouth = "closed", blush = false;
    let folds: ((i: number) => string | null) | null = null;

    let look = this.glance;
    if (this.cursor) {
      const [dx, dy] = this.cursor;
      look = [Math.abs(dx) > 30 ? Math.sign(dx) : 0, dy < -50 ? -1 : dy > 50 ? 1 : 0];
      if (Math.abs(dx) > 160) x += Math.sign(dx);
    }

    switch (s) {
      case "desperta": y = clamp(Math.round(7 - age * 3), 4, 7); eyes = age < 0.6 ? "closed" : "open"; break;
      case "escolta": y = 3 + (t < this.nodUntil ? 1 : 0); eyes = "wide"; look = [look[0], -1]; break;
      case "pensa": look = [Math.floor(t / 0.6) % 2 ? 1 : -1, -1];
        folds = (i) => (i === Math.floor(t * 9) % FOLDS.length || i === (Math.floor(t * 9) + 1) % FOLDS.length ? C.gold : null); break;
      case "parla": mouth = t < this.mouthUntil ? "open" : "closed"; look = [look[0], 0]; break;
      case "content": eyes = "happy"; mouth = "smile"; blush = true; y = 4 - (Math.floor(t * 4) % 2); break;
      case "sorpresa": eyes = "wide"; mouth = "o"; y = 3; break;
      case "arrossegat": eyes = "wide"; mouth = "o"; x += Math.round(clamp(this.lean[0], -2, 2)); y += Math.round(clamp(this.lean[1], -1, 2)); break;
      case "mareig": eyes = "dizzy"; mouth = "wavy"; x += Math.round(Math.sin(t * 6)); break;
      case "avorrit": y = 6; eyes = "half"; look = [Math.floor(t / 4) % 2 ? 1 : -1, 1]; if (Math.floor(t / 7) % 3 === 2) mouth = "yawn"; break;
      case "dorm": y = 6 + breathe(3.5); eyes = "closed"; break;
      case "somia": y = 6 + breathe(3.5); eyes = "closed"; mouth = Math.floor(t / 5) % 3 === 0 ? "smile" : "closed";
        folds = (i) => (Math.sin(t * 1.5 - i * 0.9) > 0.4 ? C.dream : null); break;
      case "idea": eyes = "wide"; mouth = "smile"; look = [0, -1]; folds = () => (Math.floor(t * 2) % 2 ? C.gold : null); break;
      case "confos": mouth = "wavy"; look = [Math.floor(t / 1.5) % 2 ? 1 : -1, 0]; break;
      case "trist": y = 6; eyes = "half"; mouth = "wavy"; look = [0, 1]; break;
    }
    if (s === "repos" && m && this.micro) {
      const a = t - this.micro.from;
      if (m === "bombolla") mouth = a < 0.5 ? "o" : "closed";
      if (m === "pampallugues") { const i = Math.floor(a * 6) % FOLDS.length; folds = (j) => (j === i ? C.gold : null); }
      if (m === "mira") look = [a < 0.8 ? -1 : 1, 0];
      if (m === "estira") y = a < 0.8 ? 3 : y;
    }
    if (t < this.blinkUntil && ["open", "wide", "half"].includes(eyes)) eyes = "closed";
    return { x: clamp(x, 2, 6), y: clamp(y, 3, 7), look, eyes, mouth, blush, folds };
  }

  draw() {
    const g = this.ctx, s = this.state;
    const ox = this.shake > 0 ? (this.shake % 2 ? 1 : -1) : 0;
    const oy = this.hop > 0 ? -1 : 0;
    const px = (x: number, y: number, c: string) => { g.fillStyle = c; g.fillRect(x, y, 1, 1); };
    const run = (x: number, y: number, w: number, c: string) => { g.fillStyle = c; g.fillRect(x, y, w, 1); };
    g.clearRect(0, 0, W, H);

    run(JX + 3 + (oy ? 1 : 0), JY + 14, 10 - (oy ? 2 : 0), C.shadow);

    const X = JX + ox, Y = JY + oy;
    g.fillStyle = LIQUID[STATES[s][1]];
    g.fillRect(X + 2, Y + 3, 12, 10);
    px(X + 2, Y + 2, C.glass); px(X + 13, Y + 2, C.glass);
    g.fillStyle = C.glass;
    g.fillRect(X + 1, Y + 3, 1, 10); g.fillRect(X + 14, Y + 3, 1, 10); g.fillRect(X + 2, Y + 13, 12, 1);

    for (const b of this.bubbles) {
      const by = Y + Math.round(b.y);
      px(X + b.x, by, s === "somia" ? C.dream : C.bubble);
      if (b.big) px(X + b.x + 1, by, s === "somia" ? C.dream : C.bubble);
    }

    const p = this.pose();
    const bx = X + p.x, by = Y + p.y;
    BRAIN.forEach((row, y) => [...row].forEach((c, x) => {
      if (c === "p") px(bx + x, by + y, C.brain);
      if (c === "f") {
        const i = FOLDS.findIndex(([fx, fy]) => fx === x && fy === y);
        px(bx + x, by + y, p.folds?.(i) ?? C.fold);
      }
    }));
    const [lx, ly] = p.look;
    const eye = (cx: number) => {
      const x = bx + clamp(cx + lx, cx - 1, cx + 1), y = by + 3 + ly;
      switch (p.eyes) {
        case "open": px(x, y, C.ink); break;
        case "wide": px(x, y, C.ink); px(x, y - 1, C.ink); break;
        case "half": px(x, y, C.ink); px(x, y - 1, C.fold); break;
        case "closed": px(bx + cx - 1 + (cx > 3 ? 1 : 0), by + 3, C.ink); px(bx + cx + (cx > 3 ? 1 : 0), by + 3, C.ink); break;
        case "happy": px(bx + cx - 1, by + 3, C.ink); px(bx + cx, by + 2, C.ink); px(bx + cx + 1, by + 3, C.ink); break;
        case "dizzy": {
          const k = Math.floor(this.t * 8) % 4, d = [[0, -1], [1, 0], [0, 1], [-1, 0]][cx > 3 ? (k + 2) % 4 : k];
          px(bx + cx + d[0], by + 3 + d[1], C.ink); break;
        }
      }
    };
    eye(1); eye(6);
    const m = (pts: number[][]) => pts.forEach(([x, y]) => px(bx + x, by + y, C.ink));
    switch (p.mouth) {
      case "closed": m([[3, 5], [4, 5]]); break;
      case "open": case "o": m([[3, 4], [4, 4], [3, 5], [4, 5]]); break;
      case "smile": m([[2, 4], [3, 5], [4, 5], [5, 4]]); break;
      case "yawn": m([[2, 4], [3, 4], [4, 4], [5, 4], [3, 5], [4, 5]]); break;
      case "wavy": m([[2, 5], [3, 4], [4, 4], [5, 5]]); break;
    }
    if (p.blush) { px(bx, by + 4, C.blush); px(bx + 7, by + 4, C.blush); }

    px(X + 2, Y + 4, C.shine); px(X + 2, Y + 5, C.shine);

    const age = this.t - this.since;
    const pop = s === "idea" ? (((this.t - this.fxAt + 2.6) % 2.6) < 0.5 ? 3 : 0) : s === "sorpresa" && age < 0.5 ? 2 : 0;
    const rattle = s === "arrossegat" || s === "mareig" ? Math.floor(this.t * 10) % 2 : 0;
    for (let i = 0; i < 10; i++) {
      const tilt = pop && i >= 5 ? 1 : 0;
      px(X + 3 + i, Y - pop - tilt - rattle, C.lid);
      px(X + 3 + i, Y + 1 - pop - tilt - rattle, C.lidHi);
    }

    for (const f of this.fx) {
      if (this.t < f.born) continue;
      const [rows, color] = GLYPHS[f.glyph];
      const fade = 1 - (this.t - f.born) / f.life;
      g.globalAlpha = clamp(fade * 1.6, 0, 1);
      rows.forEach((row, y) => [...row].forEach((c, x) => c !== "." && px(Math.round(f.x) + x, Math.round(f.y) + y, color)));
      g.globalAlpha = 1;
    }
  }
}
