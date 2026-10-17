"use client";

import { useEffect, useRef } from "react";

// Pass 1: a breathing torus knot, lit by the cursor. Writes light into R, rim into G, coverage into B.
const sceneVert = /* glsl */ `
  uniform float uTime;
  uniform float uAmp;
  varying vec3 vNormal;
  varying vec3 vView;

  float wave(vec3 p) {
    return sin(p.x * 2.6 + uTime) * sin(p.y * 2.9 + uTime * 1.3) * sin(p.z * 2.3 + uTime * 0.7);
  }
  vec3 displace(vec3 p, vec3 n) { return p + n * wave(p) * uAmp; }

  void main() {
    vec3 n = normal;
    vec3 t = normalize(cross(n, abs(n.y) < 0.99 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0)));
    vec3 b = cross(n, t);
    vec3 p0 = displace(position, n);
    vec3 p1 = displace(position + t * 0.01, n);
    vec3 p2 = displace(position + b * 0.01, n);
    vec3 dn = normalize(cross(p1 - p0, p2 - p0));
    if (dot(dn, n) < 0.0) dn = -dn;
    vec4 mv = modelViewMatrix * vec4(p0, 1.0);
    vNormal = normalize(normalMatrix * dn);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

const sceneFrag = /* glsl */ `
  uniform vec3 uLight;
  varying vec3 vNormal;
  varying vec3 vView;

  void main() {
    vec3 n = normalize(vNormal);
    vec3 l = normalize(uLight);
    float diff = max(dot(n, l), 0.0);
    float spec = pow(max(dot(n, normalize(l + vView)), 0.0), 28.0);
    float rim = pow(1.0 - max(dot(n, vView), 0.0), 2.2);
    gl_FragColor = vec4(0.04 + diff * 0.8 + spec * 0.6, rim * (1.0 - diff), 1.0, 1.0);
  }
`;

// Pass 2: ink on paper. Ordered (Bayer 8x8) dots for the scene and the name,
// plus a halftone curtain that starts as solid ink and opens from the centre.
const ditherFrag = /* glsl */ `
  uniform sampler2D tScene;
  uniform sampler2D tName;
  uniform vec2 uRes;
  uniform vec2 uGrid;
  uniform float uCell;
  uniform vec2 uMouse;
  uniform float uCurtain;
  uniform float uName;
  uniform vec3 uInk;
  uniform vec3 uPaper;
  uniform vec3 uSignal;

  float bayer2(vec2 a) { a = floor(a); return fract(a.x / 2.0 + a.y * a.y * 0.75); }
  #define bayer4(a) (bayer2(0.5 * (a)) * 0.25 + bayer2(a))
  #define bayer8(a) (bayer4(0.5 * (a)) * 0.25 + bayer2(a))

  float disc(float r, float len, float aa) { return 1.0 - smoothstep(r - aa, r + aa, len); }

  void main() {
    vec2 cell = floor(gl_FragCoord.xy / uCell);
    vec2 uv = (cell + 0.5) / uGrid;
    vec4 s = texture2D(tScene, uv);
    float th = bayer8(cell);
    vec2 c = (cell + 0.5) * uCell;

    float halo = smoothstep(uRes.y * 0.3, 0.0, distance(c, uMouse));
    float objInk = clamp(s.b * (0.86 - s.r * 0.9), 0.0, 1.0);
    float bgInk = (0.022 + halo * 0.13) * (1.0 - s.b);
    float nameInk = texture2D(tName, uv).a * uName;
    float ink = max(max(objInk, bgInk), nameInk);
    float rim = s.g * s.b;

    vec2 local = fract(gl_FragCoord.xy / uCell) - 0.5;
    float len = length(local);
    float aa = 1.2 / uCell;

    vec3 col = uPaper;
    if (ink > th + 0.002) col = mix(col, uInk, disc(0.2 + 0.22 * ink, len, aa));
    if (rim * 0.9 > th + 0.002) col = mix(col, uSignal, disc(0.2 + 0.22 * rim, len, aa));

    float d = distance(c, uRes * 0.5) / length(uRes * 0.5);
    float cur = clamp((1.0 - uCurtain) * 1.8 - (1.0 - d) * 0.8, 0.0, 1.0);
    col = mix(col, uInk, disc(0.72 * sqrt(cur), len, aa));

    gl_FragColor = vec4(col, 1.0);
  }
`;

const fullVert = /* glsl */ `
  void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

export type HeroControl = { curtain: number; scale: number; name: number };
declare global {
  interface Window {
    __hero?: HeroControl;
  }
}

const rgb = (hex: number) => [((hex >> 16) & 255) / 255, ((hex >> 8) & 255) / 255, (hex & 255) / 255] as const;

export default function HeroCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
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
      const dpr = Math.min(devicePixelRatio, 2);
      renderer.setPixelRatio(dpr);

      const ctl: HeroControl = reduced ? { curtain: 1, scale: 1, name: 0 } : { curtain: 0, scale: 7, name: 1 };

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50);
      camera.position.z = 7;

      const sceneMat = new THREE.ShaderMaterial({
        vertexShader: sceneVert,
        fragmentShader: sceneFrag,
        uniforms: {
          uTime: { value: 0 },
          uAmp: { value: 0.09 },
          uLight: { value: new THREE.Vector3(0.6, 0.7, 0.8) },
        },
      });
      const knot = new THREE.Mesh(new THREE.TorusKnotGeometry(1, 0.34, 360, 64, 2, 3), sceneMat);
      scene.add(knot);

      const target = new THREE.WebGLRenderTarget(1, 1, {
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
      });

      // The name, drawn at grid resolution so each cell gets its average coverage.
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

      const state = { cssCell: innerWidth < 640 ? 3 : 4, scroll: 0, w: 1, h: 1, cell: 0 };
      const pointer = { x: 0, y: 0, px: -9999, py: -9999 };
      const eased = { ...pointer };

      const cellSize = () =>
        Math.max(2, Math.round(state.cssCell * ctl.scale * (1 + state.scroll * 2.2) * dpr));

      const drawName = () => {
        const { width: gw, height: gh } = nameCanvas;
        nameCtx.setTransform(1, 0, 0, 1, 0, 0);
        nameCtx.clearRect(0, 0, gw, gh);
        nameTex.needsUpdate = true;
        if (ctl.name <= 0) return;
        const h1 = document.querySelector<HTMLElement>("[data-kinetic]");
        if (!h1) return;
        const k = dpr / state.cell;
        // The grid over-scans the bottom edge, so the text is shifted to stay bottom-aligned.
        nameCtx.setTransform(k, 0, 0, k, 0, gh - state.h * k);
        const cs = getComputedStyle(h1);
        nameCtx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
        if ("letterSpacing" in nameCtx) nameCtx.letterSpacing = cs.letterSpacing;
        nameCtx.fillStyle = "#000";
        const origin = canvas.getBoundingClientRect();
        const lines = h1.querySelectorAll<HTMLElement>(".line");
        for (const el of lines.length ? Array.from(lines) : [h1]) {
          const text = el.textContent ?? "";
          const r = el.getBoundingClientRect();
          const m = nameCtx.measureText(text);
          const asc = m.fontBoundingBoxAscent;
          const baseline = r.top - origin.top + (r.height - (asc + m.fontBoundingBoxDescent)) / 2 + asc;
          nameCtx.fillText(text, r.left - origin.left, baseline);
        }
      };

      const layout = () => {
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        state.w = w;
        state.h = h;
        renderer.setSize(w, h, false);
        state.cell = cellSize();
        const gw = Math.ceil((w * dpr) / state.cell);
        const gh = Math.ceil((h * dpr) / state.cell);
        target.setSize(gw, gh);
        if (nameCanvas.width !== gw || nameCanvas.height !== gh) {
          nameCanvas.width = gw;
          nameCanvas.height = gh;
          nameTex.dispose();
          nameTex = new THREE.CanvasTexture(nameCanvas);
          ditherMat.uniforms.tName.value = nameTex;
        }
        drawName();
        ditherMat.uniforms.uCell.value = state.cell;
        ditherMat.uniforms.uGrid.value.set(gw, gh);
        ditherMat.uniforms.uRes.value.set(w * dpr, h * dpr);
        camera.aspect = gw / gh;
        camera.updateProjectionMatrix();
        const aspect = w / h;
        const wide = aspect > 1.1 && w >= 768;
        knot.position.set(wide ? 1.55 : 0, wide ? 0.15 : 0.95, 0);
        knot.scale.setScalar(wide ? 1 : Math.min(0.85, aspect * 1.15));
      };
      layout();

      let nameWasOn = ctl.name > 0;
      const render = (t: number) => {
        sceneMat.uniforms.uTime.value = t * 0.0006;
        for (const k of ["x", "y", "px", "py"] as const) {
          eased[k] += (pointer[k] - eased[k]) * (k.startsWith("p") ? 0.12 : 0.05);
        }
        knot.rotation.x = t * 0.00012 + eased.y * 0.35 + state.scroll * 1.2;
        knot.rotation.y = t * 0.0002 + eased.x * 0.5;
        sceneMat.uniforms.uLight.value.set(eased.x * 1.4 + 0.3, -eased.y * 1.2 + 0.6, 0.9);
        ditherMat.uniforms.uMouse.value.set(eased.px * dpr, (state.h - eased.py) * dpr);
        ditherMat.uniforms.uCurtain.value = ctl.curtain;
        ditherMat.uniforms.uName.value = ctl.name;

        if (cellSize() !== state.cell) layout();
        else if (nameWasOn !== ctl.name > 0) drawName();
        nameWasOn = ctl.name > 0;

        renderer.setRenderTarget(target);
        renderer.setClearColor(0x000000, 0);
        renderer.clear();
        renderer.render(scene, camera);
        renderer.setRenderTarget(null);
        renderer.render(post, postCam);
      };

      let raf = 0;
      let visible = true;
      const loop = (t: number) => {
        render(t);
        raf = visible && !reduced ? requestAnimationFrame(loop) : 0;
      };
      const kick = () => {
        if (!raf) raf = requestAnimationFrame(loop);
      };

      const io = new IntersectionObserver(([e]) => {
        visible = e.isIntersecting && !document.hidden;
        if (visible) kick();
      });
      io.observe(canvas);
      const onVis = () => {
        visible = !document.hidden;
        if (visible) kick();
      };
      document.addEventListener("visibilitychange", onVis);

      const onMove = (e: PointerEvent) => {
        const r = canvas.getBoundingClientRect();
        pointer.x = (e.clientX / innerWidth) * 2 - 1;
        pointer.y = (e.clientY / innerHeight) * 2 - 1;
        pointer.px = e.clientX - r.left;
        pointer.py = e.clientY - r.top;
      };
      if (!reduced) addEventListener("pointermove", onMove, { passive: true });

      const ro = new ResizeObserver(() => {
        layout();
        kick();
      });
      ro.observe(canvas);

      const st = ScrollTrigger.create({
        trigger: canvas.parentElement,
        start: "top top",
        end: "bottom top",
        onUpdate: (self) => {
          state.scroll = self.progress;
          if (reduced) kick();
        },
      });

      window.__hero = ctl;
      dispatchEvent(new Event("hero:ready"));
      kick();

      cleanup = () => {
        if (window.__hero === ctl) delete window.__hero;
        cancelAnimationFrame(raf);
        io.disconnect();
        ro.disconnect();
        st.kill();
        removeEventListener("pointermove", onMove);
        document.removeEventListener("visibilitychange", onVis);
        knot.geometry.dispose();
        sceneMat.dispose();
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

  return <canvas ref={ref} aria-hidden className="absolute inset-0 h-full w-full" />;
}
