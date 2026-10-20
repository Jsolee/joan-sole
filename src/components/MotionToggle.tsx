"use client";

import { useSyncExternalStore } from "react";

// Looping motion (the hero, marquee, illustrations) can be paused, per WCAG 2.2.2.
const subscribe = (cb: () => void) => {
  addEventListener("motion:change", cb);
  return () => removeEventListener("motion:change", cb);
};
const isOn = () => document.documentElement.dataset.motion !== "off";

export default function MotionToggle() {
  const on = useSyncExternalStore(subscribe, isOn, () => true);

  const toggle = () => {
    const next = on ? "off" : "on";
    document.documentElement.dataset.motion = next;
    try {
      localStorage.setItem("motion", next);
    } catch {}
    dispatchEvent(new Event("motion:change"));
  };

  return (
    <button type="button" onClick={toggle} aria-pressed={!on} className="press -my-2 inline-flex items-center gap-2 py-2">
      <span className={`size-1.5 rounded-full ${on ? "bg-current" : "border border-current"}`} aria-hidden />
      {on ? "Pause motion" : "Play motion"}
    </button>
  );
}
