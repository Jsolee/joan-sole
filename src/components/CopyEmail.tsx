"use client";

import { useState } from "react";

export default function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      location.href = `mailto:${email}`;
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      data-magnetic="0.2"
      className="press inline-flex items-center rounded-full border border-paper/40 px-5 py-3 font-mono text-sm text-paper transition-colors duration-300 hover:bg-paper hover:text-signal"
    >
      <span aria-hidden className="relative block h-5 overflow-hidden">
        <span
          className="block transition-transform duration-500 ease-[var(--ease-out-expo)]"
          style={{ transform: copied ? "translateY(-100%)" : "none" }}
        >
          <span className="block">Copy address</span>
          <span className="block">Copied</span>
        </span>
      </span>
      <span className="sr-only">{copied ? "Email address copied" : "Copy email address"}</span>
    </button>
  );
}
