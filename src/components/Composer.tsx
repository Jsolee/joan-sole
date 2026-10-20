"use client";

import { useRef, useState } from "react";

const topics = [
  {
    id: "role",
    label: "A role",
    subject: "A role on our team",
    body: "Hi Joan,\n\nI’m hiring for a position that looks like a good fit for you. Do you have 20 minutes for a call this week?\n\n",
  },
  {
    id: "project",
    label: "A project",
    subject: "A project I’d like your help with",
    body: "Hi Joan,\n\nI’m building something and could use a hand with it. Here’s the short version:\n\n",
  },
  {
    id: "hello",
    label: "Just hello",
    subject: "Hello from your portfolio",
    body: "Hi Joan,\n\n",
  },
];

export default function Composer({ email }: { email: string }) {
  const [topic, setTopic] = useState(topics[0]);
  const [body, setBody] = useState(topics[0].body);
  const [copied, setCopied] = useState(false);
  const form = useRef<HTMLFormElement>(null);

  const pick = (t: (typeof topics)[number]) => {
    // Keep what the visitor wrote; only swap the untouched template.
    if (body.trim() === "" || body === topic.body) setBody(t.body);
    setTopic(t);
  };

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const q = `subject=${encodeURIComponent(topic.subject)}&body=${encodeURIComponent(body)}`;
    location.href = `mailto:${email}?${q}`;
  };

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
    <form
      ref={form}
      onSubmit={send}
      className="relative w-full overflow-hidden rounded-[1.25rem] bg-paper text-ink shadow-[0_1px_0_0_rgb(255_255_255/0.8)_inset,0_30px_60px_-24px_rgb(60_14_4/0.55),0_8px_16px_-8px_rgb(60_14_4/0.3)] md:rotate-[1.2deg]"
    >
      <div className="flex items-center justify-between border-b border-ink/10 px-5 py-3">
        <span className="text-sm font-medium">New message</span>
        <span className="flex gap-1.5" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span key={i} className="size-2.5 rounded-full bg-ink/15" />
          ))}
        </span>
      </div>

      <div className="flex items-baseline gap-3 border-b border-ink/10 px-5 py-3 text-sm">
        <span className="w-16 shrink-0 text-mute">To</span>
        <span className="truncate" translate="no">
          Joan Solé &lt;{email}&gt;
        </span>
      </div>

      <fieldset className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-ink/10 px-5 py-3 text-sm">
        <legend className="sr-only">What is it about?</legend>
        <span className="w-16 shrink-0 text-mute" aria-hidden>
          About
        </span>
        {topics.map((t) => (
          <label
            key={t.id}
            className="cursor-pointer rounded-full border border-ink/15 px-3 py-1.5 transition-colors duration-200 has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-paper has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-signal"
          >
            <input type="radio" name="topic" value={t.id} checked={topic.id === t.id} onChange={() => pick(t)} className="sr-only" />
            {t.label}
          </label>
        ))}
      </fieldset>

      <label htmlFor="message" className="sr-only">
        Message
      </label>
      <textarea
        id="message"
        name="message"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) form.current?.requestSubmit();
        }}
        rows={6}
        spellCheck
        className="block w-full resize-none bg-transparent px-5 py-4 text-base leading-relaxed outline-none placeholder:text-mute"
        placeholder="Write a few lines…"
      />

      <div className="flex items-center justify-between gap-3 border-t border-ink/10 px-4 py-3">
        <button
          type="submit"
          className="press inline-flex items-center gap-2 rounded-full bg-signal px-5 py-2.5 text-sm font-medium text-paper transition-colors duration-200 hover:bg-[#a8321a]"
        >
          Open in your email app
          <kbd className="hidden rounded bg-paper/20 px-1.5 font-mono text-[0.7rem] sm:inline">⌘&nbsp;↵</kbd>
        </button>
        <button type="button" onClick={copy} className="press rounded-full px-3 py-2.5 font-mono text-xs text-mute transition-colors hover:text-ink">
          <span aria-hidden>{copied ? "Copied" : "Copy address"}</span>
          <span className="sr-only" aria-live="polite">
            {copied ? "Email address copied" : "Copy email address"}
          </span>
        </button>
      </div>
    </form>
  );
}
