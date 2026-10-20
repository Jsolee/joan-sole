"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef, useState } from "react";
import { index } from "@/content";
import { Preview } from "./Previews";
import { Arrow } from "./Work";

export default function WorkIndex() {
  const [active, setActive] = useState<number | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const float = useRef<HTMLDivElement>(null);

  // The preview card trails the cursor with a little lag.
  useGSAP(
    (_, contextSafe) => {
      if (!matchMedia("(hover: hover) and (pointer: fine)").matches || !contextSafe) return;
      const el = float.current!;
      const x = gsap.quickTo(el, "x", { duration: 0.7, ease: "power3.out" });
      const y = gsap.quickTo(el, "y", { duration: 0.7, ease: "power3.out" });
      const move = contextSafe((e: PointerEvent) => {
        x(e.clientX - el.offsetWidth / 2);
        y(e.clientY - el.offsetHeight - 24);
      });
      addEventListener("pointermove", move, { passive: true });
      return () => removeEventListener("pointermove", move);
    },
    { scope: root },
  );

  return (
    <section id="index" aria-labelledby="index-title" className="relative z-10 bg-paper" ref={root}>
      <div className="gutter pb-24 pt-28 md:pb-40 md:pt-44">
        <header className="mb-10 flex items-end justify-between md:mb-16">
          <h2 id="index-title" data-reveal className="font-display text-[clamp(2.5rem,6vw,6rem)] leading-[0.9] tracking-[-0.04em]">
            Also built
          </h2>
          <span data-fade className="font-mono text-sm text-mute">
            (0{index.length})
          </span>
        </header>

        <ul className="group/list border-b border-line/70" onPointerLeave={() => setActive(null)}>
          {index.map((item, i) => {
            const Row = item.url ? "a" : "div";
            return (
              <li
                key={item.title}
                data-fade
                className="border-t border-line/70 transition-opacity duration-500 md:group-hover/list:opacity-30 md:hover:!opacity-100"
                onPointerEnter={() => setActive(i)}
              >
                <Row
                  {...(item.url ? { href: item.url, target: "_blank", rel: "noreferrer" } : {})}
                  className="group grid grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-2 py-5 md:grid-cols-12 md:py-7"
                >
                  <span translate="no" className="font-display text-[clamp(1.75rem,3.6vw,3.25rem)] leading-none tracking-[-0.035em] transition-transform duration-700 ease-[var(--ease-out-expo)] md:col-span-4 md:group-hover:translate-x-3">
                    {item.title}
                  </span>
                  <span className="font-mono text-xs text-mute md:order-last md:col-span-2 md:text-right">
                    {item.kind}
                    {item.url && <Arrow className="ml-2 inline" />}
                  </span>
                  <span className="col-span-2 max-w-[56ch] text-[0.95rem] leading-relaxed text-ink/70 md:col-span-4">
                    {item.line}
                  </span>
                  <span className="col-span-2 font-mono text-xs text-mute md:col-span-2">{item.stack}</span>
                </Row>
              </li>
            );
          })}
        </ul>
      </div>

      <div
        ref={float}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-40 hidden h-[15rem] w-[22rem] md:block"
      >
        <div
          className="relative h-full w-full overflow-hidden rounded-xl border border-ink/10 transition-[clip-path,opacity] duration-500 ease-[var(--ease-out-expo)]"
          style={{
            clipPath: active === null ? "inset(50% 0 50% 0 round 0.75rem)" : "inset(0 0 0 0 round 0.75rem)",
            opacity: active === null ? 0 : 1,
          }}
        >
          {index.map((item, i) => (
            <div
              key={item.title}
              className="absolute inset-0 transition-[opacity,transform] duration-500 ease-[var(--ease-out-expo)]"
              style={{ opacity: active === i ? 1 : 0, transform: active === i ? "none" : "scale(1.06)" }}
            >
              <Preview kind={item.preview} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
