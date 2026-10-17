export const contact = {
  email: "joansolejimenez@gmail.com",
  github: "https://github.com/Jsolee",
  linkedin: "https://www.linkedin.com/in/joan-sol%C3%A9-jim%C3%A9nez-569873245",
};

export type Project = {
  slug: string;
  title: string;
  kind: string;
  year: string;
  summary: string;
  role: string;
  stack: string[];
  notes: string[];
  url?: string;
  image?: string;
  tint: string;
};

export const featured: Project[] = [
  {
    slug: "picgenio",
    title: "Picgenio",
    kind: "SaaS · TheEtailers",
    year: "2026",
    summary: "AI product photography and video for e‑commerce brands.",
    role: "Fullstack developer",
    stack: ["Next.js", "Prisma", "PostgreSQL", "Gemini", "Veo", "Kling", "Stripe"],
    notes: [
      "Video generator with a model cascade: Kling first, Google Veo as the fallback.",
      "Multi-scene storyboards, stitched together in the browser.",
      "Background generation that survives a page reload.",
      "CapCut-style subtitles with eight presets.",
    ],
    url: "https://picgenio.ai",
    image: "/work/picgenio.webp",
    tint: "oklch(0.68 0.19 40)",
  },
  {
    slug: "qusap",
    title: "QusAP",
    kind: "Client · University",
    year: "2026",
    summary: "A learning platform with instant automatic grading, in weekly use at a UPC school.",
    role: "Sole developer",
    stack: ["Next.js 16", "Supabase", "Postgres RLS", "Edge Functions", "Stripe", "next-intl"],
    notes: [
      "Used every week by 132 students since September 2026.",
      "A live class froze at 282 requests per second. One query per heartbeat later, an 80-student simulation ran with zero errors on 4% of one core.",
      "Course page cut from 3.5 MB to 0.41 MB; repeat navigation from 400 ms to 64 ms.",
      "Row-level security on all 35 tables. The grading engine runs inside Postgres.",
    ],
    url: "https://qusap.com",
    image: "/work/qusap.webp",
    tint: "oklch(0.7 0.15 155)",
  },
  {
    slug: "ticketing",
    title: "Club ticketing",
    kind: "Client · Nightlife",
    year: "2026",
    summary: "Ticket sales and door control for a 1,000-capacity club, replacing a commercial platform.",
    role: "Sole developer",
    stack: ["Next.js 16", "Expo", "Supabase", "Postgres 17", "Stripe", "Wallet passes"],
    notes: [
      "Online sales, promoter links, a door app that keeps working offline and a live dashboard.",
      "QR codes signed with HMAC. The key never leaves the database.",
      "Check-in is a single Postgres function.",
      "605 tests, including integration tests against a real database.",
    ],
    tint: "oklch(0.62 0.2 25)",
  },
  {
    slug: "esco",
    title: "Escó",
    kind: "Personal · with Pol Alcoverro",
    year: "2026",
    summary: "Voting advice you play like a game. Your answers fill a parliament in 3D.",
    role: "Design and development",
    stack: ["Next.js 16", "three.js", "GSAP", "Zod", "Vitest"],
    notes: [
      "Swipe through 24 proposals. Results seat 350 instanced seats using the D'Hondt method.",
      "Everything runs in the browser: no cookies, no analytics, no server.",
    ],
    url: "https://esco-psi.vercel.app",
    image: "/work/esco.webp",
    tint: "oklch(0.85 0.01 85)",
  },
];

export type IndexItem = {
  title: string;
  kind: string;
  year: string;
  line: string;
  stack: string;
  url?: string;
  preview: "eclipse" | "frost" | "xinxeta" | "talaia" | "motion" | "voice" | "rumi";
};

export const index: IndexItem[] = [
  {
    title: "Edmondsski",
    kind: "Client",
    year: "2026",
    line: "One-page site for a DJ. A shader eclipse that pulses at 124 BPM and follows your scroll.",
    stack: "three.js · GSAP · Vite",
    url: "https://edmondsski.vercel.app",
    preview: "eclipse",
  },
  {
    title: "FROST",
    kind: "iOS app",
    year: "2026",
    line: "A 92-day Winter Arc tracker: habits, gym, GPS runs, Apple Health and a home-screen widget. First version built and on TestFlight in a single day.",
    stack: "Expo · Reanimated · HealthKit",
    preview: "frost",
  },
  {
    title: "Xinxeta",
    kind: "Personal",
    year: "2026",
    line: "A map of date spots you share with friends. Private by default, enforced entirely by row-level security.",
    stack: "Next.js · Supabase · MapLibre",
    url: "https://xinxeta.vercel.app",
    preview: "xinxeta",
  },
  {
    title: "Talaia",
    kind: "FIB–UPC · team of six",
    year: "2026",
    line: "Where and when to watch the night sky in Catalonia. Scrum master for the first sprint, design system, map and visibility index.",
    stack: "Expo · MapLibre · PostGIS",
    preview: "talaia",
  },
  {
    title: "Motiongenio",
    kind: "TheEtailers",
    year: "2026",
    line: "Turns PDFs and slide decks into motion-graphics videos.",
    stack: "Remotion · Gemini · FFmpeg",
    preview: "motion",
  },
  {
    title: "Voice agent",
    kind: "TheEtailers",
    year: "2026",
    line: "A phone agent for a city council. Residents book bulky-waste pickups by talking to it.",
    stack: "ElevenLabs · Webhooks",
    preview: "voice",
  },
  {
    title: "Rumi",
    kind: "Personal",
    year: "2026",
    line: "A digital pet running on a local LLM. Its memory is an Obsidian vault; it dreams, and it forgets.",
    stack: "Ollama · Node · Swift",
    preview: "rumi",
  },
];

export const disciplines = [
  {
    title: "Interface and motion",
    body: "Design systems, type and motion that feel considered. WebGL when it earns its place, never as decoration for its own sake.",
    tools: ["React", "Next.js", "Tailwind", "GSAP", "three.js", "Remotion"],
  },
  {
    title: "Backend and data",
    body: "Postgres first. Row-level security, logic in functions, migrations that ship before the code, tests against a real database.",
    tools: ["Node", "PostgreSQL", "Supabase", "Prisma", "Stripe"],
  },
  {
    title: "Mobile",
    body: "Expo and Swift, from HealthKit and GPS to offline door scanners and home-screen widgets.",
    tools: ["Expo", "React Native", "Reanimated", "SwiftUI"],
  },
  {
    title: "AI products",
    body: "Image, video and voice pipelines with fallbacks that hold up in production, plus local models when the data should stay home.",
    tools: ["Gemini", "Veo", "Kling", "ElevenLabs", "Ollama"],
  },
];

export const experience = [
  {
    years: "2026 – now",
    org: "TheEtailers",
    role: "Fullstack developer, AI products",
    note: "Joined as an intern in March, permanent since September.",
  },
  {
    years: "2025 – 2026",
    org: "Bjarke Ingels Group",
    role: "IT intern",
    note: "Azure, Entra ID, Intune, Defender.",
  },
  {
    years: "2024",
    org: "Ollé Amortidors",
    role: "Programmer and data analyst",
    note: "Internal tools in C++ and VBA.",
  },
  {
    years: "2023 – 2025",
    org: "Sala Royale",
    role: "Head of public relations",
    note: "Led the promotion team and built the venue's website.",
  },
];

export const marquee = [
  "TypeScript",
  "Next.js",
  "PostgreSQL",
  "Supabase",
  "three.js",
  "GSAP",
  "Expo",
  "Swift",
  "Prisma",
  "Stripe",
  "Remotion",
  "Tailwind",
];
