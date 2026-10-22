export const contact = {
  email: "joansolejimenez@gmail.com",
  github: "https://github.com/Jsolee",
  linkedin: "https://www.linkedin.com/in/joansolejimenez",
  cv: "/joan-sole-cv.pdf",
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
  visual: "picgenio" | "qusap" | "traingenio" | "ticket";
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
      "Multi-scene storyboards generated in parallel and stitched together in the browser.",
      "Background generation that survives navigation and reloads.",
      "Guided onboarding and the partner landing pages.",
    ],
    url: "https://picgenio.ai",
    visual: "picgenio",
    tint: "#e5683c",
  },
  {
    slug: "qusap",
    title: "QusAP",
    kind: "Client · University",
    year: "2026",
    summary: "A learning platform with instant grading that replaced a legacy Access system at a UPC school.",
    role: "Sole developer",
    stack: ["Next.js 16", "Supabase", "Postgres RLS", "Edge Functions", "Stripe", "next-intl"],
    notes: [
      "Used every week by 132 students since September 2026.",
      "A live class froze at 282 requests a second. After moving to one query per heartbeat, an 80-student simulation ran with 0 errors on 4% of one core.",
      "Course page cut from 3.5\u00A0MB to 0.41\u00A0MB; repeat navigation from 400\u00A0ms to 64\u00A0ms.",
      "Row-level security on all 35 tables, and the grading engine runs inside Postgres.",
    ],
    url: "https://qusap.com",
    visual: "qusap",
    tint: "#2f9e62",
  },
  {
    slug: "traingenio",
    title: "Traingenio",
    kind: "SaaS · TheEtailers",
    year: "2026",
    summary: "Corporate training generated with AI. Upload a document and get narrated lessons, quizzes and an exam.",
    role: "Fullstack developer",
    stack: ["Next.js 16", "Remotion", "Gemini", "Prisma", "Supabase"],
    notes: [
      "Built Motiongenio, which turns PDFs and slide decks into branded motion-graphics videos rendered with Remotion.",
      "AI script, voice narration, captions and extra languages in one pipeline.",
      "The learner area: AI-generated daily quizzes, final exams and progress tracking.",
    ],
    visual: "traingenio",
    tint: "#c99a2e",
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
    visual: "ticket",
    tint: "#c23b1c",
  },
];

export type IndexItem = {
  title: string;
  kind: string;
  year: string;
  line: string;
  stack: string;
  url?: string;
  preview: "voice" | "talaia" | "rumi";
};

export const index: IndexItem[] = [
  {
    title: "Council voice agent",
    kind: "TheEtailers",
    year: "2026",
    line: "A phone agent for Santa Coloma de Gramenet city council. Residents book, change or cancel bulky-waste pickups by voice, in Catalan or Spanish. Sole developer of the agent and its broker to the council’s booking system.",
    stack: "ElevenLabs · Next.js · 7 webhooks",
    preview: "voice",
  },
  {
    title: "Talaia",
    kind: "University · FIB–UPC",
    year: "2026",
    line: "Where and when to watch the night sky in Catalonia. Team of 6. I was Scrum master for the first sprint and built the design system, the map and the visibility index.",
    stack: "Expo · MapLibre · PostGIS",
    preview: "talaia",
  },
  {
    title: "Rumi",
    kind: "Personal",
    year: "2026",
    line: "A digital pet that runs on a local LLM and keeps its memories in an Obsidian vault. Old ones fade over time.",
    stack: "Ollama · Node · Swift",
    preview: "rumi",
  },
];

export const disciplines = [
  {
    title: "Interface and motion",
    body: "Design systems, type and motion. I reach for WebGL when a page needs it, like the hero at the top of this one.",
    tools: ["React", "Next.js", "Tailwind", "GSAP", "three.js", "Remotion"],
  },
  {
    title: "Backend and data",
    body: "Postgres first: row-level security, logic in SQL functions, migrations that ship before the code, and tests that run against a real database.",
    tools: ["Node", "PostgreSQL", "Supabase", "Prisma", "Stripe"],
  },
  {
    title: "Mobile",
    body: "Expo and React Native: a door-scanning app that keeps working offline, and a night-sky map built with a team of six.",
    tools: ["Expo", "React Native", "Reanimated", "SwiftUI"],
  },
  {
    title: "AI products",
    body: "Image, video and voice pipelines with a fallback for when a model fails, plus local models when the data shouldn’t leave the machine.",
    tools: ["Gemini", "Veo", "Kling", "ElevenLabs", "Ollama"],
  },
];

export const experience = [
  {
    years: "2026 – now",
    org: "TheEtailers",
    role: "Fullstack developer, AI products",
    note: "AI division of an e-commerce outsourcing company. Joined as an intern in March, permanent since September.",
  },
  {
    years: "2025 – 2026",
    org: "Bjarke Ingels Group",
    role: "IT intern",
    note: "Azure, Entra ID, Intune and Active Directory for an international architecture firm.",
  },
  {
    years: "2024",
    org: "Ollé Amortidors",
    role: "Programmer and data analyst",
    note: "C++ and VBA tools and data models for production planning at a shock-absorber maker.",
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
