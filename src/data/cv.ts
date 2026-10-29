export type Experience = {
  company: string;
  role: string;
  period: string;
  details: string;
  bullets: string[];
  tags: string[];
};

export type Project = {
  name: string;
  status: string;
  description: string;
  stack: string;
  url?: string;
  // Demo video shown on the TV, e.g. "/assets/demos/snuggle-sweep.mp4".
  demo?: string;
  // Screenshot shown on the TV when there is no video. Without either, the
  // channel shows a test card.
  image?: string;
  // false keeps the project in the CV but off the TV.
  onTv?: boolean;
};

export const profile = {
  name: "Marin Vladimir",
  title: "Senior Full-Stack & Mobile Engineer",
  stack: "React Native · Expo · React · Next.js · TypeScript · Node.js",
  email: "mvladi00@fesb.hr",
  phone: "+385 91 534 4144",
  location: "Split, Croatia (CET)",
  availability: "Open to remote roles · full-time or B2B contract",
  photo: "/assets/me.webp",
  links: [
    {
      label: "LinkedIn",
      url: "https://www.linkedin.com/in/marin-vladimir-76b9b4170/",
    },
    { label: "YouTube (music)", url: "https://www.youtube.com/@Vlado54565" },
  ],
  summary:
    "Full-stack engineer with 7+ years of shipping production software, from secure digital-identity systems for the German federal government (Bundesdruckerei Group) to cross-platform mobile apps built end-to-end for clients. I own features across the whole stack: UI, APIs, data, payments, CI/CD and App Store / Google Play releases. I'm used to working in English with international, distributed teams. I work AI-natively (Claude Code, agentic workflows) to ship faster while keeping code reviewed, tested and maintainable.",
  highlights: [
    {
      title: "Government-grade",
      text: "3.5 years building digital-identity front-ends for the German federal government",
    },
    {
      title: "Idea → App Store",
      text: "Client apps delivered end-to-end, including Stripe payments and store releases",
    },
    {
      title: "Remote-proven",
      text: "Remote work with teams in Australia, Germany and across Europe",
    },
  ],
};

export const experience: Experience[] = [
  {
    company: "Self-employed",
    role: "Freelance Full-Stack & Mobile Developer",
    period: "Jan 2025 – Present",
    details:
      "B2B / freelance · Remote · Mobile apps, web platforms and websites for clients",
    bullets: [
      "Elan Reformer Studio (client): built the studio's React Native / Expo app end-to-end, covering the class schedule and bookings, member accounts, price list and invoices, push notifications and Stripe payments, plus an admin side with POS, reports, user management and live support chat. Backend on Firebase (Auth, Firestore, Cloud Functions); shipped to the App Store and Google Play via EAS.",
      "Police App (client): Next.js / TypeScript PWA on an API Platform (Symfony / PHP) backend for managing police stations, staff, registered citizens and scheduled checks by crime category. Role-based access, Docker Compose and Helm / Kubernetes deployment, end-to-end tests.",
      "Naj Saloni: social app for beauty professionals, built on Expo and Firebase (Data Connect, Cloud Functions).",
      "Client websites: WordPress / Elementor sites with custom PHP for small businesses, built directly with the owners.",
    ],
    tags: [
      "React Native",
      "Expo / EAS",
      "TypeScript",
      "Firebase",
      "Stripe",
      "Next.js",
      "Symfony",
      "Docker",
      "Helm",
    ],
  },
  {
    company: "Bundesdruckerei Group — Maurer Electronics",
    role: "Software Engineer",
    period: "Jun 2021 – Dec 2024",
    details:
      "Front-End → Full-Stack · Split, Croatia · German federal digital-identity solutions",
    bullets: [
      "Led front-end development of secure digital-identity solutions used by the German federal government.",
      "Built React / Next.js applications in TypeScript with REST integrations and Jest test coverage.",
      "Grew into full-stack scope: Scala backend APIs and Keycloak-based authentication (OIDC / SSO).",
      "Served as Release Master in a Scrum team, coordinating release cycles end-to-end; mentored 5 engineers.",
      "Translated Figma designs from the UX team into reusable, responsive UI components.",
    ],
    tags: [
      "React",
      "Next.js",
      "TypeScript",
      "Jest",
      "Keycloak",
      "Scala",
      "Docker",
      "Linux",
    ],
  },
  {
    company: "Aspose",
    role: "Paid Support Lead Programmer",
    period: "Jun 2020 – May 2021",
    details: "Remote · Sydney, Australia",
    bullets: [
      "Led paid-support escalations for enterprise customers across the .NET, Java, PHP, Python and Android SDKs.",
      "Reproduced and diagnosed complex document-processing bugs, then delivered workarounds and patches with the product teams.",
      "Mentored 3 engineers; validated fixes across Docker, VM and cloud setups.",
    ],
    tags: ["C# / .NET", "Java", "PHP", "Python", "Docker", "REST APIs"],
  },
  {
    company: "Ericsson Nikola Tesla",
    role: "Software Developer (Student)",
    period: "Sep 2018 – Apr 2020",
    details: "Split, Croatia",
    bullets: [
      "React / Node.js monitoring dashboard, Electron QA tool, and Java / Jenkins test automation.",
    ],
    tags: [],
  },
];

export const ownProducts: Project[] = [
  {
    name: "Elan Reformer Studio",
    status: "With Vexnet · Google Play",
    description:
      "Pilates studio app, built together with Vexnet: class schedule and bookings, member accounts, price list and invoices, push notifications and Stripe payments, plus an admin side with POS, reports, user management and live support chat.",
    stack: "React Native · Expo / EAS · Firebase · Stripe",
    url: "https://play.google.com/store/apps/details?id=com.crasho.pilatesapp",
    image: "/assets/demos/elan-reformer-studio.webp",
  },
  {
    name: "Snuggle Sweep",
    status: "Complete",
    description:
      "Cozy puzzle game for iOS, Android and web (itch.io, CrazyGames): 100 levels, 13 languages, AdMob ads and in-app purchases, achievements and an animal encyclopedia. Trailer produced in-house.",
    stack: "Unity · C# · AdMob · Unity IAP · WebGL",
    demo: "/assets/demos/snuggle-sweep.mp4",
    image: "/assets/demos/snuggle-sweep.jpg",
  },
  {
    name: "Smolder",
    status: "Trailer",
    description: "Dating horror game.",
    stack: "Game",
  },
  {
    name: "Obilazak",
    status: "In development",
    description:
      "SaaS for real-estate agencies: 3D walkthroughs generated from phone video with a Python GPU pipeline (COLMAP → Gaussian splatting), shareable listing pages and an agency dashboard.",
    stack: "Next.js 16 · TypeScript · Drizzle · PostgreSQL · Python",
  },
  {
    name: "Sports-management tycoon",
    status: "In development",
    description:
      "Idle-tycoon game approved for release, publishing deal in negotiation. Athlete roster, tactics-based matches, club economy and one-click WebGL releases.",
    stack: "Unity · C# · WebGL · Android · Cloudflare Pages",
  },
  {
    name: "randomli.tools",
    status: "Live",
    description:
      "SEO-focused utility site with 18 tools (password and UUID generators, pickers, dice, wheel) on Cloudflare Pages Functions.",
    stack: "JavaScript · HTML / CSS · Cloudflare Pages · SEO",
    url: "https://randomli.tools",
    onTv: false,
  },
  {
    name: "Grandpa's Notebook",
    status: "For schools",
    description:
      "Maths learning game: 32 curriculum skills across 112 generated levels, from adding to 10 up to equations, with adaptive difficulty driven by per-skill mastery, hints, worked steps and written column methods, plus a story mode. Being built for school maths competitions, from county to national level.",
    stack: "Godot 4 · GDScript · procedural task generation",
    image: "/assets/demos/math-game.webp",
  },
];

export const clientWork: Project[] = [
  {
    name: "Elan Reformer Studio",
    status: "Client · App Store & Google Play",
    description:
      "The studio's app for class bookings, member accounts, invoices and payments, with an admin side for POS, reports and live support chat.",
    stack: "React Native · Expo / EAS · Firebase · Stripe",
    url: "https://play.google.com/store/apps/details?id=com.crasho.pilatesapp",
    // Same app as the Vexnet product above, which is the one on the TV.
    onTv: false,
  },
  {
    name: "Police App",
    status: "Client",
    description:
      "PWA for managing police stations, staff, registered citizens and scheduled checks, with role-based access.",
    stack: "Next.js · TypeScript · Symfony · Docker · Helm",
    // Protected under GDPR, so it cannot be shown.
    onTv: false,
  },
  {
    name: "Naj Saloni",
    status: "Client",
    description: "Social app for beauty professionals.",
    stack: "Expo · Firebase Data Connect · Cloud Functions",
    url: "https://apps.apple.com/us/app/saloniapp/id6800621733",
  },
  {
    name: "Client websites",
    status: "Client",
    description:
      "WordPress / Elementor sites with custom PHP for small businesses, built directly with the owners.",
    stack: "WordPress · Elementor · PHP",
    onTv: false,
  },
  {
    name: "Vinarija Kuzmanić",
    status: "Client · Live",
    description:
      "Bilingual (HR / EN) website for a family winery in Kaštel Novi, with a wine tour page and a gallery.",
    stack: "Website",
    url: "https://vinarijakuzmanic.com/",
    image: "/assets/demos/vinarija-kuzmanic.webp",
  },
];

export const education = {
  degree: "M.Sc. in ICT",
  school: "FESB, University of Split · 2013 – 2019",
  languages: [
    { name: "English", level: "Native / bilingual" },
    { name: "Croatian", level: "Native" },
  ],
  more: { title: "Music producer", text: "Original music · FL Studio" },
};

// Every project is a channel on the TV, own products first.
export const channels: Project[] = [...ownProducts, ...clientWork].filter(
  (project) => project.onTv !== false,
);
