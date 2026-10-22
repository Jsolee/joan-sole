"use client";

import { useState } from "react";
import { index } from "@/content";
import { Preview } from "./Previews";
import { Arrow } from "./Work";

// The preview lives in its own sticky column, so it never sits on top of the text it illustrates.
export default function WorkIndex() {
  const [active, setActive] = useState(0);

  return (
    <section id="index" aria-labelledby="index-title" className="relative z-10">
      <div className="gutter pb-24 pt-28 md:pb-40 md:pt-44">
        <header className="mb-10 flex items-end justify-between md:mb-16">
          <h2 id="index-title" data-reveal className="font-display text-[clamp(2.5rem,6vw,6rem)] leading-[0.9] tracking-[-0.04em]">
            Also built
          </h2>
          <span data-fade className="font-mono text-sm text-mute">
            (0{index.length})
          </span>
        </header>

        <div className="grid gap-10 md:grid-cols-12 md:gap-12">
          <ul className="group/list border-b border-line/70 md:col-span-7">
            {index.map((item, i) => {
              const Row = item.url ? "a" : "div";
              return (
                <li
                  key={item.title}
                  data-fade
                  onPointerEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  className={`border-t border-line/70 transition-opacity duration-500 ${active === i ? "" : "md:opacity-55"}`}
                >
                  <Row
                    {...(item.url ? { href: item.url, target: "_blank", rel: "noreferrer" } : {})}
                    className="group block py-6 md:py-8"
                  >
                    <div aria-hidden className="mb-5 aspect-video overflow-hidden rounded-xl border border-ink/10 md:hidden">
                      <Preview kind={item.preview} />
                    </div>
                    <div className="flex items-baseline justify-between gap-6">
                      <span
                        translate="no"
                        className="font-display text-[clamp(1.75rem,3.4vw,3rem)] leading-none tracking-[-0.035em] transition-transform duration-700 ease-[var(--ease-out-expo)] md:group-hover:translate-x-2"
                      >
                        {item.title}
                      </span>
                      <span className="shrink-0 font-mono text-xs text-mute">
                        {item.kind}
                        {item.url && <Arrow className="ml-2 inline" />}
                      </span>
                    </div>
                    <p className="mt-4 max-w-[60ch] text-pretty text-[0.95rem] leading-relaxed text-ink/75">{item.line}</p>
                    <p className="mt-3 font-mono text-xs text-mute">{item.stack}</p>
                  </Row>
                </li>
              );
            })}
          </ul>

          <div aria-hidden className="hidden md:col-span-5 md:block">
            <div className="sticky top-28">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-ink/10 shadow-[0_1px_2px_0_rgb(23_21_15/0.06),0_24px_48px_-24px_rgb(23_21_15/0.3)]">
                {index.map((item, i) => (
                  <div
                    key={item.title}
                    className="absolute inset-0 transition-[opacity,transform] duration-500 ease-[var(--ease-out-expo)]"
                    style={{ opacity: active === i ? 1 : 0, transform: active === i ? "none" : "scale(1.04)" }}
                  >
                    <Preview kind={item.preview} />
                  </div>
                ))}
              </div>
              <p className="mt-4 flex justify-between font-mono text-xs text-mute">
                <span translate="no">{index[active].title}</span>
                <span>
                  0{active + 1} / 0{index.length}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
