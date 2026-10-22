"use client";

import NextImage from "next/image";
import { useEffect, useRef } from "react";

/*
 * One object for the whole page. ~20k particles live behind every section and rebuild
 * themselves into a different shape per section, rendered through an ink-on-paper
 * halftone pass. The hero intro (ink curtain + dotted name) is part of the same pass.
 */

// ---------- shaders ----------

const pointsVert = /* glsl */ `
  attribute vec3 aTo;
  attribute vec3 aNFrom;
  attribute vec3 aNTo;
  attribute float aToneFrom;
  attribute float aToneTo;
  attribute float aRand;

  uniform float uMix;
  uniform float uTime;
  uniform mat3 uRotFrom;
  uniform mat3 uRotTo;
  uniform vec3 uOffFrom;
  uniform vec3 uOffTo;
  uniform float uScaleFrom;
  uniform float uScaleTo;
  uniform float uToneMixFrom;
  uniform float uToneMixTo;
  uniform float uSizeFrom;
  uniform float uSizeTo;
  uniform vec3 uLight;
  uniform vec2 uMouse;
  uniform float uAspect;
  uniform float uRepel;

  varying vec3 vOut;

  vec3 swirl(vec3 p, float t) {
    return vec3(sin(p.y * 2.1 + t), sin(p.z * 1.7 + t * 1.3), sin(p.x * 1.9 + t * 0.7));
  }

  void main() {
    // Each particle leaves a little later than its neighbour, so shapes dissolve instead of sliding.
    float m = smoothstep(0.0, 1.0, uMix * 1.6 - aRand * 0.6);
    vec3 a = uRotFrom * (position * uScaleFrom) + uOffFrom;
    vec3 b = uRotTo * (aTo * uScaleTo) + uOffTo;
    vec3 p = mix(a, b, m);
    p += swirl(p * 0.8 + aRand * 6.0, uTime) * sin(m * 3.14159) * 0.6;
    p += normalize(mix(aNFrom, aNTo, m) + 1e-4) * sin(uTime * 1.3 + aRand * 12.0) * 0.012;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vec4 clip = projectionMatrix * mv;
    vec2 d = clip.xy / clip.w - uMouse;
    d.x *= uAspect;
    float f = exp(-dot(d, d) * 22.0) * uRepel;
    mv.xy += vec2(d.x / uAspect, d.y) / (length(d) + 1e-3) * f * 0.28 * (-mv.z / 7.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = mix(uSizeFrom, uSizeTo, m) * (7.0 / -mv.z);

    vec3 n = normalize(normalMatrix * normalize(mix(uRotFrom * aNFrom, uRotTo * aNTo, m) + 1e-4));
    vec3 v = normalize(-mv.xyz);
    vec3 l = normalize(uLight);
    float diff = abs(dot(n, l));
    float spec = pow(max(dot(n, normalize(l + v)), 0.0), 28.0);
    float rim = pow(1.0 - abs(dot(n, v)), 2.2);
    float lit = 0.04 + diff * 0.8 + spec * 0.6;
    float tm = mix(uToneMixFrom, uToneMixTo, m);
    float tone = mix(aToneFrom, aToneTo, m);
    float light = mix(lit, (0.86 - tone) / 0.9, tm);
    vOut = vec3(light, rim * (1.0 - diff) * (1.0 - tm), 1.0);
  }
`;

const pointsFrag = /* glsl */ `
  varying vec3 vOut;
  void main() { gl_FragColor = vec4(vOut, 1.0); }
`;

// Ink on paper: Bayer-dithered dots, a misregistered vermilion ghost while scrolling fast,
// the dotted name for the intro, and the ink curtain that opens from the centre.
const ditherFrag = /* glsl */ `
  uniform sampler2D tScene;
  uniform sampler2D tName;
  uniform vec2 uRes;
  uniform vec2 uGrid;
  uniform float uCell;
  uniform vec2 uMouse;
  uniform float uCurtain;
  uniform float uName;
  uniform float uShift;
  uniform vec3 uInk;
  uniform vec3 uPaper;
  uniform vec3 uSignal;

  float bayer2(vec2 a) { a = floor(a); return fract(a.x / 2.0 + a.y * a.y * 0.75); }
  #define bayer4(a) (bayer2(0.5 * (a)) * 0.25 + bayer2(a))
  #define bayer8(a) (bayer4(0.5 * (a)) * 0.25 + bayer2(a))

  float disc(float r, float len, float aa) { return 1.0 - smoothstep(r - aa, r + aa, len); }
  float inkAt(vec4 s) { return clamp(s.b * (0.86 - s.r * 0.9), 0.0, 1.0); }
  float lightAt(vec4 s) { return clamp(s.b * (0.08 + s.r * 0.85), 0.0, 1.0); }

  void main() {
    vec2 cell = floor(gl_FragCoord.xy / uCell);
    vec2 uv = (cell + 0.5) / uGrid;
    vec4 s = texture2D(tScene, uv);
    float th = bayer8(cell);
    vec2 c = (cell + 0.5) * uCell;

    float halo = smoothstep(uRes.y * 0.3, 0.0, distance(c, uMouse));
    float bgInk = (0.022 + halo * 0.13) * (1.0 - s.b);
    float nameInk = texture2D(tName, uv).a * uName;
    float ink = max(max(inkAt(s), bgInk), nameInk);
    float glow = max(max(lightAt(s), bgInk * 0.5), nameInk);
    float rim = s.g * s.b;
    float ghost = inkAt(texture2D(tScene, (cell + vec2(0.0, uShift) + 0.5) / uGrid));

    vec2 local = fract(gl_FragCoord.xy / uCell) - 0.5;
    float len = length(local);
    float aa = 1.2 / uCell;

    // The ink sheet: 1 = still black (the print is inverted, light glows as paper dots),
    // 0 = paper. It clears from the centre outwards as uCurtain goes 0 -> 1.
    float d = distance(c, uRes * 0.5) / length(uRes * 0.5);
    float w = clamp((1.0 - uCurtain) * 1.8 - (1.0 - d) * 0.8, 0.0, 1.0);
    float sheet = 0.72 * sqrt(w);
    bool onSheet = sheet > 0.36;
    float v = onSheet ? glow : ink;

    vec3 col = mix(uPaper, uInk, disc(sheet, len, aa));
    if (abs(uShift) > 0.4 && ghost > th + 0.002) col = mix(col, uSignal, disc(0.16 + 0.2 * ghost, len, aa));
    if (v > th + 0.002) col = mix(col, onSheet ? uPaper : uInk, disc(0.2 + 0.22 * v, len, aa));
    if (rim * 0.9 > th + 0.002) col = mix(col, uSignal, disc(0.2 + 0.22 * rim, len, aa));

    // A vermilion fringe rides the edge of the sheet while it clears.
    float front = smoothstep(0.0, 0.1, w) * (1.0 - smoothstep(0.1, 0.42, w));
    if (front * 0.9 > th) col = mix(col, uSignal, disc(0.32, len, aa));

    gl_FragColor = vec4(col, 1.0);
  }
`;

const fullVert = /* glsl */ `
  void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

// ---------- shapes ----------

type Shape = { pos: Float32Array; nrm: Float32Array; tone: Float32Array };
type Vec = [number, number, number];
type StateName = "seed" | "knot" | "dust" | "portrait" | "layers" | "database" | "phone" | "mind";

const rng = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const unit = (r: () => number): Vec => {
  const z = r() * 2 - 1;
  const a = r() * Math.PI * 2;
  const s = Math.sqrt(1 - z * z);
  return [s * Math.cos(a), s * Math.sin(a), z];
};
const norm = (v: Vec): Vec => {
  const l = Math.hypot(...v) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
};

function make(n: number, seed: number, fn: (i: number, r: () => number) => { p: Vec; n: Vec; t: number }): Shape {
  const r = rng(seed);
  const s = { pos: new Float32Array(n * 3), nrm: new Float32Array(n * 3), tone: new Float32Array(n) };
  for (let i = 0; i < n; i++) {
    const o = fn(i, r);
    s.pos.set(o.p, i * 3);
    s.nrm.set(o.n, i * 3);
    s.tone[i] = o.t;
  }
  return s;
}

const shapes = {
  // Every particle packed into the loader's red dot; the intro bursts them out into the knot.
  seed: (n: number) =>
    make(n, 8, (_, r) => {
      const d = unit(r);
      const k = 0.07 * Math.cbrt(r());
      return { p: [d[0] * k, d[1] * k, d[2] * k], n: d, t: 0 };
    }),
  dust: (n: number) => make(n, 1, (_, r) => ({ p: [(r() * 2 - 1) * 7, (r() * 2 - 1) * 3.4, 0.8 - r() * 3], n: unit(r), t: 0.18 + r() * 0.25 })),

  // Three stacked windows: interfaces.
  layers: (n: number) =>
    make(n, 2, (i, r) => {
      const k = (i % 3) - 1;
      const x = (r() - 0.5) * 1.7;
      const y = (r() - 0.5) * 1.15;
      const edge = Math.abs(x) > 0.8 || Math.abs(y) > 0.53;
      const bar = y > 0.38;
      return { p: [x + k * 0.34, y + k * 0.3, k * 0.4], n: [0, 0, 1], t: edge ? 0.95 : bar ? 0.75 : 0.18 + (k + 1) * 0.06 };
    }),

  // Three discs: a database.
  database: (n: number) =>
    make(n, 3, (i, r) => {
      const y0 = ((i % 3) - 1) * 0.58;
      const a = r() * Math.PI * 2;
      const u = r();
      const [cx, cz] = [Math.cos(a), Math.sin(a)];
      if (u < 0.55) return { p: [cx, y0 + (r() - 0.5) * 0.34, cz], n: [cx, 0, cz], t: 0.7 };
      if (u < 0.7) return { p: [cx, y0 + 0.17, cz], n: [0, 1, 0], t: 0.95 };
      const rr = Math.sqrt(r());
      return { p: [cx * rr, y0 + 0.17, cz * rr], n: [0, 1, 0], t: 0.2 };
    }),

  // A phone with an app grid and a notch.
  phone: (n: number) =>
    make(n, 4, (_, r) => {
      const [w, h] = [1.05, 2.1];
      if (r() < 0.2) {
        const side = r() * (w + h) * 2;
        const p: Vec =
          side < w ? [side - w / 2, h / 2, 0] : side < w + h ? [w / 2, side - w - h / 2, 0] : side < 2 * w + h ? [side - w - h - w / 2, -h / 2, 0] : [-w / 2, side - 2 * w - h - h / 2, 0];
        return { p, n: [0, 0, 1], t: 0.95 };
      }
      const x = (r() - 0.5) * (w - 0.12);
      const y = (r() - 0.5) * (h - 0.12);
      const gx = ((x + 0.47) / 0.94) * 4;
      const gy = ((y + 0.99) / 1.98) * 6;
      const icon = gy > 1.2 && gy % 1 > 0.2 && gy % 1 < 0.8 && gx % 1 > 0.2 && gx % 1 < 0.8;
      const notch = y > 0.88 && Math.abs(x) < 0.17;
      return { p: [x, y, 0], n: [0, 0, 1], t: notch ? 0.95 : icon ? 0.72 : 0.1 };
    }),

  // A sphere with drifting bands: a model thinking.
  mind: (n: number) =>
    make(n, 5, (i, r) => {
      const y = 1 - (2 * (i + 0.5)) / n;
      const rad = Math.sqrt(1 - y * y);
      const th = i * 2.39996;
      const j = 1 + (r() - 0.5) * 0.1;
      const p: Vec = [Math.cos(th) * rad * j, y * j, Math.sin(th) * rad * j];
      return { p, n: norm(p), t: 0.25 + 0.7 * Math.pow(Math.sin(th * 0.07 + y * 6) * 0.5 + 0.5, 6) };
    }),
};

// The halftone portrait, rebuilt from particles: density follows the darkness of the photo.
async function portraitShape(n: number): Promise<Shape> {
  const img = new Image();
  img.src = "/portrait.webp";
  await img.decode();
  const [W, H] = [112, 140];
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0, W, H);
  const data = ctx.getImageData(0, 0, W, H).data;
  const dark = new Float32Array(W * H);
  const cdf = new Float32Array(W * H);
  let sum = 0;
  for (let i = 0; i < W * H; i++) {
    const g = Math.min(1, Math.max(0, (data[i * 4] / 255 - 0.04) / 0.62));
    dark[i] = Math.pow(1 - g, 1.2);
    // Skin is mid-grey: give it a floor so the face doesn't thin out against the jacket.
    sum += dark[i] > 0.06 ? 0.08 + dark[i] : 0;
    cdf[i] = sum;
  }
  return make(n, 6, (_, r) => {
    const u = r() * sum;
    let lo = 0;
    let hi = cdf.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (cdf[mid] < u) lo = mid + 1;
      else hi = mid;
    }
    const x = (((lo % W) + r()) / W - 0.5) * 0.8;
    const y = 0.5 - (Math.floor(lo / W) + r()) / H;
    return { p: [x, y, 0.16 * Math.cos(x * 3.2) + dark[lo] * 0.06], n: norm([-Math.sin(x * 3.2) * 0.5, 0, 1]), t: 0.22 + 0.78 * dark[lo] };
  });
}

// ---------- per-state layout and motion ----------

type Layout = { fx: number; fy: number; scale: number; toneMix: number; size: number };
const desktop: Record<StateName, Layout> = {
  seed: { fx: 0.5, fy: 0.5, scale: 1, toneMix: 0, size: 1.9 },
  knot: { fx: 0.73, fy: 0.47, scale: 1, toneMix: 0, size: 1.9 },
  dust: { fx: 0.5, fy: 0.5, scale: 1, toneMix: 1, size: 1 },
  portrait: { fx: 0.74, fy: 0.47, scale: 3.1, toneMix: 1, size: 1.5 },
  layers: { fx: 0.2, fy: 0.7, scale: 0.85, toneMix: 0.75, size: 1.6 },
  database: { fx: 0.2, fy: 0.7, scale: 0.6, toneMix: 0.75, size: 1.6 },
  phone: { fx: 0.2, fy: 0.68, scale: 0.7, toneMix: 0.75, size: 1.6 },
  mind: { fx: 0.2, fy: 0.7, scale: 0.75, toneMix: 0.5, size: 1.6 },
};

const spin = (s: StateName, t: number, mx: number, my: number, hero: number): Vec => {
  switch (s) {
    case "knot":
      return [t * 0.12 + my * 0.35 + hero * 1.2, t * 0.2 + mx * 0.5, 0];
    case "seed":
      return [t * 0.6, t * 0.9, 0];
    case "dust":
      return [0, Math.sin(t * 0.05) * 0.05, 0];
    case "portrait":
      return [my * 0.08, mx * 0.25 + Math.sin(t * 0.5) * 0.06, 0];
    case "layers":
      return [-0.45 + my * 0.2, Math.sin(t * 0.4) * 0.6 + mx * 0.4, 0];
    case "database":
      return [0.45 + my * 0.2, t * 0.4, 0];
    case "phone":
      return [-0.15 + my * 0.2, Math.sin(t * 0.5) * 0.5 + mx * 0.4, 0];
    case "mind":
      return [t * 0.1 + my * 0.2, t * 0.25 + mx * 0.3, 0];
  }
};

// HUD anchors (particle indices) and labels, igloo-style.
const hudText: Partial<Record<StateName, string[]>> = {
  knot: ["01 Schema", "02 API", "03 Interface", "04 Motion"],
  portrait: ["Joan Solé", "Barcelona, 41.39° N", "FIB · UPC", "TheEtailers"],
};

const sections: [id: string, label: string, state: StateName | null][] = [
  ["top", "01 Joan Solé", "knot"],
  ["about", "02 About", "portrait"],
  ["work", "03 Selected work", "dust"],
  ["receipts", "04 Receipts", "dust"],
  ["index", "05 Also built", "dust"],
  ["capabilities", "06 What I do", null],
  ["experience", "07 Experience", "dust"],
  ["contact", "08 Contact", "dust"],
];
const disciplineShapes: StateName[] = ["layers", "database", "phone", "mind"];

const glyphs = "#%&*+=<>/\\[]{}01";
function scramble(el: HTMLElement, text: string) {
  const start = performance.now();
  const step = (now: number) => {
    const p = Math.min(1, (now - start) / 520);
    let out = "";
    for (let i = 0; i < text.length; i++)
      out += i / text.length < p || text[i] === " " ? text[i] : glyphs[(Math.random() * glyphs.length) | 0];
    el.textContent = out;
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

export type HeroControl = { curtain: number; scale: number; name: number; assemble: number };
declare global {
  interface Window {
    __hero?: HeroControl;
  }
}

const rgb = (hex: number) => [((hex >> 16) & 255) / 255, ((hex >> 8) & 255) / 255, (hex & 255) / 255] as const;

export default function Scene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<SVGPolylineElement>(null);
  const pinRefs = useRef<(HTMLDivElement | null)[]>([]);
  const sectionRef = useRef<HTMLSpanElement>(null);
  const sectionWrapRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const THREE = await import("three");
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      await document.fonts.ready;
      if (disposed) return;
      gsap.registerPlugin(ScrollTrigger);

      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: "high-performance" });
      } catch {
        return; // no WebGL: Motion falls back to a plain reveal
      }
      const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
      const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
      const dpr = Math.min(devicePixelRatio, 2);
      renderer.setPixelRatio(dpr);

      const ctl: HeroControl = reduced
        ? { curtain: 1, scale: 1, name: 0, assemble: 1 }
        : { curtain: 0, scale: 2, name: 0, assemble: 0 };

      // Particles: the torus knot's own vertices are the starting shape.
      const knotGeo = new THREE.TorusKnotGeometry(1, 0.34, 300, 64, 2, 3);
      const N = knotGeo.attributes.position.count;
      // Jitter breaks up the mesh's ring pattern so the knot reads as a surface, not as stripes.
      const jr = rng(7);
      const knot: Shape = {
        pos: (knotGeo.attributes.position.array as Float32Array).map((x) => x + (jr() - 0.5) * 0.045),
        nrm: knotGeo.attributes.normal.array as Float32Array,
        tone: new Float32Array(N),
      };
      const library: Partial<Record<StateName, Shape>> = {
        knot,
        seed: shapes.seed(N),
        dust: shapes.dust(N),
        layers: shapes.layers(N),
        database: shapes.database(N),
        phone: shapes.phone(N),
        mind: shapes.mind(N),
      };
      portraitShape(N)
        .then((s) => (library.portrait = s))
        .catch(() => {}); // no portrait: About falls back to dust

      const r = rng(9);
      const rand = new Float32Array(N).map(() => r());
      const geo = new THREE.BufferGeometry();
      const attr = (arr: Float32Array, size: number) => new THREE.BufferAttribute(arr, size).setUsage(THREE.DynamicDrawUsage);
      geo.setAttribute("position", attr(knot.pos.slice(), 3));
      geo.setAttribute("aNFrom", attr(knot.nrm.slice(), 3));
      geo.setAttribute("aToneFrom", attr(knot.tone.slice(), 1));
      geo.setAttribute("aTo", attr(knot.pos.slice(), 3));
      geo.setAttribute("aNTo", attr(knot.nrm.slice(), 3));
      geo.setAttribute("aToneTo", attr(knot.tone.slice(), 1));
      geo.setAttribute("aRand", new THREE.BufferAttribute(rand, 1));
      geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 100);
      knotGeo.dispose();

      const u = {
        uMix: { value: 0 },
        uTime: { value: 0 },
        uRotFrom: { value: new THREE.Matrix3() },
        uRotTo: { value: new THREE.Matrix3() },
        uOffFrom: { value: new THREE.Vector3() },
        uOffTo: { value: new THREE.Vector3() },
        uScaleFrom: { value: 1 },
        uScaleTo: { value: 1 },
        uToneMixFrom: { value: 0 },
        uToneMixTo: { value: 0 },
        uSizeFrom: { value: 1.9 },
        uSizeTo: { value: 1.9 },
        uLight: { value: new THREE.Vector3(0.6, 0.7, 0.8) },
        uMouse: { value: new THREE.Vector2(9, 9) },
        uAspect: { value: 1 },
        uRepel: { value: 0 },
      };
      const pointsMat = new THREE.ShaderMaterial({ vertexShader: pointsVert, fragmentShader: pointsFrag, uniforms: u });
      const points = new THREE.Points(geo, pointsMat);
      const scene = new THREE.Scene();
      scene.add(points);
      const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50);
      camera.position.z = 7;

      const target = new THREE.WebGLRenderTarget(1, 1, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
      const nameCanvas = document.createElement("canvas");
      const nameCtx = nameCanvas.getContext("2d")!;
      let nameTex = new THREE.CanvasTexture(nameCanvas);

      const ditherMat = new THREE.ShaderMaterial({
        vertexShader: fullVert,
        fragmentShader: ditherFrag,
        depthTest: false,
        uniforms: {
          tScene: { value: target.texture },
          tName: { value: nameTex },
          uRes: { value: new THREE.Vector2() },
          uGrid: { value: new THREE.Vector2() },
          uCell: { value: 4 },
          uMouse: { value: new THREE.Vector2(-9999, -9999) },
          uCurtain: { value: ctl.curtain },
          uName: { value: ctl.name },
          uShift: { value: 0 },
          uInk: { value: new THREE.Vector3(...rgb(0x17150f)) },
          uPaper: { value: new THREE.Vector3(...rgb(0xf3f0e8)) },
          uSignal: { value: new THREE.Vector3(...rgb(0xc23b1c)) },
        },
      });
      const post = new THREE.Scene();
      const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), ditherMat);
      quad.frustumCulled = false;
      post.add(quad);
      const postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

      const view = { w: 1, h: 1, cell: 0, cssCell: innerWidth < 640 ? 3 : 4, wide: true, halfW: 1, halfH: 1 };
      const pointer = { x: 0, y: 0, px: -9999, py: -9999 };
      const eased = { ...pointer };
      const cellSize = () => Math.max(2, Math.round(view.cssCell * ctl.scale * dpr));

      const drawName = () => {
        const { width: gw, height: gh } = nameCanvas;
        nameCtx.setTransform(1, 0, 0, 1, 0, 0);
        nameCtx.clearRect(0, 0, gw, gh);
        nameTex.needsUpdate = true;
        if (ctl.name <= 0) return;
        const h1 = document.querySelector<HTMLElement>("[data-kinetic]");
        if (!h1) return;
        const k = dpr / view.cell;
        nameCtx.setTransform(k, 0, 0, k, 0, gh - view.h * k);
        const cs = getComputedStyle(h1);
        nameCtx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
        if ("letterSpacing" in nameCtx) nameCtx.letterSpacing = cs.letterSpacing;
        nameCtx.fillStyle = "#000";
        const lines = h1.querySelectorAll<HTMLElement>(".line");
        for (const el of lines.length ? Array.from(lines) : [h1]) {
          const text = el.textContent ?? "";
          const rect = el.getBoundingClientRect();
          const m = nameCtx.measureText(text);
          const asc = m.fontBoundingBoxAscent;
          nameCtx.fillText(text, rect.left, rect.top + (rect.height - (asc + m.fontBoundingBoxDescent)) / 2 + asc);
        }
      };

      const layout = () => {
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        view.w = w;
        view.h = h;
        view.wide = w >= 768 && w / h > 1.1;
        renderer.setSize(w, h, false);
        view.cell = cellSize();
        const gw = Math.ceil((w * dpr) / view.cell);
        const gh = Math.ceil((h * dpr) / view.cell);
        target.setSize(gw, gh);
        if (nameCanvas.width !== gw || nameCanvas.height !== gh) {
          nameCanvas.width = gw;
          nameCanvas.height = gh;
          nameTex.dispose();
          nameTex = new THREE.CanvasTexture(nameCanvas);
          ditherMat.uniforms.tName.value = nameTex;
        }
        drawName();
        ditherMat.uniforms.uCell.value = view.cell;
        ditherMat.uniforms.uGrid.value.set(gw, gh);
        ditherMat.uniforms.uRes.value.set(w * dpr, h * dpr);
        camera.aspect = gw / gh;
        camera.updateProjectionMatrix();
        u.uAspect.value = camera.aspect;
        view.halfH = 7 * Math.tan((17.5 * Math.PI) / 180);
        view.halfW = view.halfH * camera.aspect;
      };
      layout();

      let heroProgress = 0;
      let velocity = 0;
      let shift = 0;
      let paused = false;
      let nameOn = ctl.name > 0;
      let portraitPending = true;
      let currentRequest: StateName = "knot";
      let hudPending = true;

      // ---- state machine: one transition at a time, always heading for the latest request ----
      const sm = { cur: "knot" as StateName, next: "knot" as StateName, want: "knot" as StateName, busy: false };
      const load = (which: "from" | "to", s: Shape) => {
        const [p, n, t] = which === "from" ? ["position", "aNFrom", "aToneFrom"] : ["aTo", "aNTo", "aToneTo"];
        (geo.attributes[p] as InstanceType<typeof THREE.BufferAttribute>).copyArray(s.pos).needsUpdate = true;
        (geo.attributes[n] as InstanceType<typeof THREE.BufferAttribute>).copyArray(s.nrm).needsUpdate = true;
        (geo.attributes[t] as InstanceType<typeof THREE.BufferAttribute>).copyArray(s.tone).needsUpdate = true;
      };
      const resolve = (s: StateName): StateName => (view.wide ? (library[s] ? s : "dust") : s === "knot" ? "knot" : "dust");
      const go = (requested: StateName) => {
        sm.want = resolve(requested);
        if (sm.busy || sm.want === sm.cur) return;
        sm.busy = true;
        sm.next = sm.want;
        load("to", library[sm.next]!);
        hud(false);
        const o = { m: 0 };
        gsap.to(o, {
          m: 1,
          duration: reduced ? 0 : 1.7,
          ease: "power2.inOut",
          onUpdate: () => {
            u.uMix.value = o.m;
          },
          onComplete: () => {
            sm.cur = sm.next;
            load("from", library[sm.cur]!);
            u.uMix.value = 0;
            sm.busy = false;
            if (sm.want !== sm.cur) go(sm.want);
            else hud(true);
          },
        });
      };

      // Intro: every particle starts packed into the loader's red dot and bursts out into the knot.
      // Motion drives ctl.assemble; nothing else may move the state machine until it lands.
      let assembling = ctl.assemble < 1;
      if (assembling) {
        load("from", library.seed!);
        load("to", knot);
        Object.assign(sm, { cur: "seed", next: "knot", busy: true });
      }

      // ---- HUD ----
      const anchors: Partial<Record<StateName, number[]>> = {
        knot: [0, 75, 150, 225].map((j) => j * 65 + 16),
      };
      const pickPortraitAnchors = () => {
        const s = library.portrait;
        if (!s || anchors.portrait) return;
        const near = (x: number, y: number) => {
          let best = 0;
          let bd = Infinity;
          for (let i = 0; i < N; i++) {
            const d = (s.pos[i * 3] - x) ** 2 + (s.pos[i * 3 + 1] - y) ** 2;
            if (d < bd) [bd, best] = [d, i];
          }
          return best;
        };
        anchors.portrait = [near(0.02, 0.2), near(-0.28, -0.3), near(0.3, -0.36), near(0.12, -0.05)];
      };
      let hudOn = false;
      const hud = (on: boolean) => {
        const el = hudRef.current;
        if (!el) return;
        hudOn = on && view.wide && !reduced && ctl.curtain >= 1 && !!hudText[sm.cur];
        el.style.opacity = hudOn ? "1" : "0";
        if (!hudOn) return;
        hudText[sm.cur]!.forEach((t, i) => {
          const label = pinRefs.current[i]?.querySelector<HTMLElement>("[data-label]");
          if (label) scramble(label, t);
          const face = pinRefs.current[i]?.querySelector<HTMLElement>("[data-face]");
          if (face) face.style.display = sm.cur === "portrait" && i === 0 ? "block" : "none";
        });
      };

      const v = new THREE.Vector3();
      const m3 = new THREE.Matrix3();
      const m4 = new THREE.Matrix4();
      const euler = new THREE.Euler();
      const placeHud = (s: StateName, rot: InstanceType<typeof THREE.Matrix3>, off: InstanceType<typeof THREE.Vector3>, scale: number) => {
        const idx = anchors[s];
        if (!hudOn || !idx) return;
        const shape = library[s]!;
        const pts: string[] = [];
        idx.forEach((i, k) => {
          v.fromArray(shape.pos, i * 3).multiplyScalar(scale).applyMatrix3(rot).add(off).project(camera);
          const x = (v.x * 0.5 + 0.5) * view.w;
          const y = (-v.y * 0.5 + 0.5) * view.h;
          pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
          const pin = pinRefs.current[k];
          if (pin) pin.style.transform = `translate(${x - 4}px, ${y - 4}px)`;
        });
        lineRef.current?.setAttribute("points", pts.join(" "));
      };

      const applyState = (s: StateName, t: number, which: "From" | "To") => {
        const L = view.wide ? desktop[s] : { ...desktop.dust, ...(s === "knot" ? { fx: 0.5, fy: 0.22, scale: Math.min(0.72, camera.aspect * 1.05), toneMix: 0, size: 1.9 } : {}) };
        const [ex, ey, ez] = spin(s, t, eased.x, eased.y, heroProgress);
        euler.set(ex, ey, ez);
        m3.setFromMatrix4(m4.makeRotationFromEuler(euler));
        const rot = u[`uRot${which}`].value.copy(m3);
        const off = u[`uOff${which}`].value.set((L.fx * 2 - 1) * view.halfW, (1 - L.fy * 2) * view.halfH, 0);
        u[`uScale${which}`].value = L.scale;
        u[`uToneMix${which}`].value = L.toneMix;
        u[`uSize${which}`].value = L.size;
        if (which === "From" && !sm.busy) placeHud(s, rot, off, L.scale);
      };

      const render = (now: number) => {
        const t = now * 0.001;
        u.uTime.value = t;
        if (assembling) {
          u.uMix.value = ctl.assemble;
          if (ctl.assemble >= 1) {
            assembling = false;
            sm.cur = "knot";
            load("from", knot);
            u.uMix.value = 0;
            sm.busy = false;
            if (sm.want !== "knot") go(sm.want);
          }
        }
        // Labels wait for the paper: they appear once the ink sheet has fully cleared.
        if (hudPending && ctl.curtain >= 1 && !sm.busy) {
          hudPending = false;
          hud(true);
        }
        for (const k of ["x", "y", "px", "py"] as const) eased[k] += (pointer[k] - eased[k]) * (k.startsWith("p") ? 0.12 : 0.05);
        // The portrait loads after the first frame; if someone already scrolled to About, catch up.
        if (portraitPending && library.portrait) {
          portraitPending = false;
          pickPortraitAnchors();
          if (currentRequest === "portrait") go("portrait");
        }
        applyState(sm.cur, t, "From");
        applyState(sm.busy ? sm.next : sm.cur, t, "To");
        u.uLight.value.set(eased.x * 1.4 + 0.3, -eased.y * 1.2 + 0.6, 0.9);
        u.uMouse.value.set((eased.px / view.w) * 2 - 1, -((eased.py / view.h) * 2 - 1));
        ditherMat.uniforms.uMouse.value.set(eased.px * dpr, (view.h - eased.py) * dpr);
        ditherMat.uniforms.uCurtain.value = ctl.curtain;
        ditherMat.uniforms.uName.value = ctl.name;
        velocity *= 0.9;
        shift += (Math.max(-1, Math.min(1, velocity / 1800)) * 4 - shift) * 0.15;
        ditherMat.uniforms.uShift.value = Math.round(shift);

        if (cellSize() !== view.cell) layout();
        else if (nameOn !== ctl.name > 0) drawName();
        nameOn = ctl.name > 0;

        renderer.setRenderTarget(target);
        renderer.setClearColor(0x000000, 0);
        renderer.clear();
        renderer.render(scene, camera);
        renderer.setRenderTarget(null);
        renderer.render(post, postCam);
      };
      let raf = 0;
      const stopped = () =>
        document.hidden || paused || (document.documentElement.dataset.motion === "off" && ctl.curtain >= 1 && ctl.name <= 0 && !sm.busy);
      const loop = (now: number) => {
        render(now);
        raf = !reduced && !stopped() ? requestAnimationFrame(loop) : 0;
      };
      const kick = () => {
        if (!raf) raf = requestAnimationFrame(loop);
      };

      const onMove = (e: PointerEvent) => {
        pointer.x = (e.clientX / innerWidth) * 2 - 1;
        pointer.y = (e.clientY / innerHeight) * 2 - 1;
        pointer.px = e.clientX;
        pointer.py = e.clientY;
        u.uRepel.value = fine ? 1 : 0;
      };
      if (!reduced) addEventListener("pointermove", onMove, { passive: true });
      document.addEventListener("visibilitychange", kick);
      addEventListener("motion:change", kick);
      const ro = new ResizeObserver(() => {
        layout();
        kick();
      });
      ro.observe(canvas);

      // ---- scroll wiring ----
      const triggers: InstanceType<typeof ScrollTrigger>[] = [];
      const request = (s: StateName) => {
        currentRequest = s;
        go(s);
        kick();
      };
      triggers.push(
        ScrollTrigger.create({
          trigger: "#top",
          start: "top top",
          end: "bottom top",
          onUpdate: (self) => (heroProgress = self.progress),
        }),
        ScrollTrigger.create({
          start: 0,
          end: "max",
          onUpdate: (self) => {
            velocity = self.getVelocity();
            if (progressRef.current) progressRef.current.style.transform = `scaleY(${self.progress})`;
            kick();
          },
        }),
        ScrollTrigger.create({
          trigger: "#contact",
          start: "top top",
          end: "bottom bottom",
          onToggle: (self) => {
            paused = self.isActive;
            kick();
          },
        }),
      );
      if (!reduced) {
        for (const [id, label, state] of sections) {
          const el = document.getElementById(id);
          if (!el) continue;
          triggers.push(
            ScrollTrigger.create({
              trigger: el,
              start: "top 55%",
              end: "bottom 55%",
              onToggle: (self) => {
                if (!self.isActive) return;
                if (sectionRef.current) scramble(sectionRef.current, `// ${label}`);
                if (sectionWrapRef.current) sectionWrapRef.current.style.opacity = id === "top" ? "0" : "1";
                if (state) request(state);
              },
            }),
          );
        }
        document.querySelectorAll("#capabilities li").forEach((li, i) =>
          triggers.push(
            ScrollTrigger.create({
              trigger: li,
              start: "top 65%",
              end: "bottom 65%",
              onToggle: (self) => self.isActive && request(disciplineShapes[i % disciplineShapes.length]),
            }),
          ),
        );
      }

      window.__hero = ctl;
      dispatchEvent(new Event("hero:ready"));
      hud(true);
      kick();

      cleanup = () => {
        if (window.__hero === ctl) delete window.__hero;
        cancelAnimationFrame(raf);
        ro.disconnect();
        triggers.forEach((t) => t.kill());
        removeEventListener("pointermove", onMove);
        removeEventListener("motion:change", kick);
        document.removeEventListener("visibilitychange", kick);
        geo.dispose();
        pointsMat.dispose();
        ditherMat.dispose();
        quad.geometry.dispose();
        nameTex.dispose();
        target.dispose();
        renderer.dispose();
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} aria-hidden className="pointer-events-none fixed inset-0 -z-[2] h-[100lvh] w-full" />

      <div ref={hudRef} aria-hidden className="pointer-events-none fixed inset-0 -z-[1] hidden transition-opacity duration-500 md:block" style={{ opacity: 0 }}>
        <svg className="absolute inset-0 h-full w-full">
          <polyline ref={lineRef} fill="none" stroke="#17150f" strokeOpacity="0.4" strokeWidth="1" strokeDasharray="2 4" />
        </svg>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            ref={(el) => {
              pinRefs.current[i] = el;
            }}
            className="absolute left-0 top-0 flex items-start gap-2 font-mono text-[11px] leading-none text-ink"
          >
            <span className="mt-px size-2 shrink-0 rounded-full border border-ink bg-paper" />
            <span className="mt-[-3px] flex items-center gap-1.5 bg-paper/80 px-1 py-0.5">
              <NextImage data-face src="/portrait.webp" alt="" width={16} height={16} className="hidden size-4 rounded-full object-cover object-top grayscale" />
              <span data-label className="whitespace-nowrap" />
            </span>
          </div>
        ))}
      </div>

      <div
        ref={sectionWrapRef}
        aria-hidden
        className="pointer-events-none fixed bottom-5 left-[var(--gutter)] z-40 hidden font-mono text-xs text-paper mix-blend-difference transition-opacity duration-500 md:block"
        style={{ opacity: 0 }}
      >
        <span ref={sectionRef} />
      </div>
      <div aria-hidden className="pointer-events-none fixed right-3 top-1/2 z-40 hidden h-36 w-px -translate-y-1/2 bg-paper/30 mix-blend-difference md:block">
        <div ref={progressRef} className="h-full w-full origin-top bg-paper" style={{ transform: "scaleY(0)" }} />
      </div>
    </>
  );
}
