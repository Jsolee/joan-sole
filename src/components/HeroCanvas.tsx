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

// Pass 2: ordered (Bayer 8x8) dithering into round dots, three inks.
const ditherFrag = /* glsl */ `
  uniform sampler2D tScene;
  uniform vec2 uRes;
  uniform vec2 uGrid;
  uniform float uCell;
  uniform vec2 uMouse;
  uniform float uReveal;
  uniform vec3 uInk;
  uniform vec3 uBone;
  uniform vec3 uSignal;

  float bayer2(vec2 a) { a = floor(a); return fract(a.x / 2.0 + a.y * a.y * 0.75); }
  #define bayer4(a) (bayer2(0.5 * (a)) * 0.25 + bayer2(a))
  #define bayer8(a) (bayer4(0.5 * (a)) * 0.25 + bayer2(a))

  void main() {
    vec2 cell = floor(gl_FragCoord.xy / uCell);
    vec4 s = texture2D(tScene, (cell + 0.5) / uGrid);
    float th = bayer8(cell);

    vec2 c = (cell + 0.5) * uCell;
    float halo = smoothstep(uRes.y * 0.32, 0.0, distance(c, uMouse));
    float bg = 0.03 + halo * 0.2;
    float lum = mix(bg, s.r, s.b) * uReveal;
    float rim = s.g * s.b * uReveal;

    vec2 local = fract(gl_FragCoord.xy / uCell) - 0.5;
    float r = 0.2 + 0.22 * clamp(max(lum, rim), 0.0, 1.0);
    float aa = 1.2 / uCell;
    float dotMask = 1.0 - smoothstep(r - aa, r + aa, length(local));

    vec3 col = uInk;
    if (lum > th + 0.002) col = mix(uInk, uBone, dotMask);
    if (rim * 0.95 > th + 0.002) col = mix(uInk, uSignal, dotMask);
    gl_FragColor = vec4(col, 1.0);
  }
`;

const fullVert = /* glsl */ `
  void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const rgb = (r: number, g: number, b: number) => [r / 255, g / 255, b / 255] as const;

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
      if (disposed) return;
      gsap.registerPlugin(ScrollTrigger);

      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: "high-performance" });
      } catch {
        return; // no WebGL: the ink background stands in
      }
      const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
      const dpr = Math.min(devicePixelRatio, 2);
      renderer.setPixelRatio(dpr);

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
        depthBuffer: true,
      });

      const ditherMat = new THREE.ShaderMaterial({
        vertexShader: fullVert,
        fragmentShader: ditherFrag,
        depthTest: false,
        uniforms: {
          tScene: { value: target.texture },
          uRes: { value: new THREE.Vector2() },
          uGrid: { value: new THREE.Vector2() },
          uCell: { value: 4 },
          uMouse: { value: new THREE.Vector2(-9999, -9999) },
          uReveal: { value: 0 },
          uInk: { value: new THREE.Vector3(...rgb(15, 13, 11)) },
          uBone: { value: new THREE.Vector3(...rgb(242, 238, 230)) },
          uSignal: { value: new THREE.Vector3(...rgb(242, 95, 51)) },
        },
      });
      const post = new THREE.Scene();
      const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), ditherMat);
      quad.frustumCulled = false;
      post.add(quad);
      const postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

      const state = { cssCell: 4, scroll: 0, w: 1, h: 1 };
      const pointer = { x: 0, y: 0, px: -9999, py: -9999 };
      const eased = { x: 0, y: 0, px: -9999, py: -9999 };

      const layout = () => {
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        state.w = w;
        state.h = h;
        renderer.setSize(w, h, false);
        const cell = Math.max(2, Math.round(state.cssCell * (1 + state.scroll * 2.2) * dpr));
        const gw = Math.ceil((w * dpr) / cell);
        const gh = Math.ceil((h * dpr) / cell);
        target.setSize(gw, gh);
        ditherMat.uniforms.uCell.value = cell;
        ditherMat.uniforms.uGrid.value.set(gw, gh);
        ditherMat.uniforms.uRes.value.set(w * dpr, h * dpr);
        camera.aspect = gw / gh;
        camera.updateProjectionMatrix();
        const aspect = w / h;
        const wide = aspect > 1.1 && w >= 768;
        knot.position.set(wide ? 1.55 : 0, wide ? 0.15 : 0.95, 0);
        knot.scale.setScalar(wide ? 1 : Math.min(0.85, aspect * 1.15));
      };
      state.cssCell = innerWidth < 640 ? 3 : 4;
      layout();

      let lastCell = ditherMat.uniforms.uCell.value;
      const render = (t: number) => {
        sceneMat.uniforms.uTime.value = t * 0.0006;
        for (const k of ["x", "y", "px", "py"] as const) {
          eased[k] += (pointer[k] - eased[k]) * (k.startsWith("p") ? 0.12 : 0.05);
        }
        knot.rotation.x = t * 0.00012 + eased.y * 0.35 + state.scroll * 1.2;
        knot.rotation.y = t * 0.0002 + eased.x * 0.5;
        sceneMat.uniforms.uLight.value.set(eased.x * 1.4 + 0.3, -eased.y * 1.2 + 0.6, 0.9);
        ditherMat.uniforms.uMouse.value.set(eased.px * dpr, (state.h - eased.py) * dpr);

        const cell = Math.max(2, Math.round(state.cssCell * (1 + state.scroll * 2.2) * dpr));
        if (cell !== lastCell) {
          lastCell = cell;
          layout();
        }
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
        if (reduced) kick();
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

      const reveal = () =>
        gsap.to(ditherMat.uniforms.uReveal, {
          value: 1,
          duration: reduced ? 0 : 2.4,
          ease: "power2.out",
          onUpdate: kick,
        });
      const w = window as Window & { __introDone?: boolean };
      if (w.__introDone || reduced) reveal();
      else addEventListener("portfolio:intro", reveal, { once: true });

      kick();

      cleanup = () => {
        cancelAnimationFrame(raf);
        io.disconnect();
        ro.disconnect();
        st.kill();
        removeEventListener("pointermove", onMove);
        removeEventListener("portfolio:intro", reveal);
        document.removeEventListener("visibilitychange", onVis);
        knot.geometry.dispose();
        sceneMat.dispose();
        ditherMat.dispose();
        quad.geometry.dispose();
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
