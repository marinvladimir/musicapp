// Croatian texts of the CV. Only the wording lives here; links, pictures and
// tech stacks come from the English data in cv.ts, in the same order.
import {
  Experience,
  Project,
  clientWork,
  education,
  experience,
  ownProducts,
  profile,
} from "./cv";

type ProjectText = Pick<Project, "status" | "description"> &
  Partial<Pick<Project, "name" | "stack">>;

const withText = (projects: Project[], texts: ProjectText[]): Project[] =>
  projects.map((project, index) => ({ ...project, ...texts[index] }));

export const profileHr: typeof profile = {
  ...profile,
  title: "Senior full-stack i mobile inženjer",
  location: "Split, Hrvatska (CET)",
  availability: "Otvoren za remote poslove · puno radno vrijeme ili B2B",
  links: [
    profile.links[0],
    { label: "YouTube (glazba)", url: profile.links[1].url },
  ],
  summary:
    "Full-stack inženjer sa 7+ godina isporuke produkcijskog softvera, od sigurnih sustava digitalnog identiteta za njemačku saveznu vladu (Bundesdruckerei Group) do višeplatformskih mobilnih aplikacija koje za klijente izrađujem od početka do kraja. Vodim funkcionalnosti kroz cijeli stack: sučelje, API-je, podatke, plaćanja, CI/CD te objave na App Store i Google Play. Naviknut sam raditi na engleskom s međunarodnim, distribuiranim timovima. Radim AI-native (Claude Code, agentni tijekovi rada) kako bih isporučivao brže, a kod ostao pregledan, testiran i održiv.",
  highlights: [
    {
      title: "Državna razina",
      text: "3,5 godine razvoja sučelja za sustave digitalnog identiteta njemačke savezne vlade",
    },
    {
      title: "Od ideje do App Storea",
      text: "Klijentske aplikacije isporučene od početka do kraja, sa Stripe plaćanjima i objavom u trgovinama",
    },
    {
      title: "Provjereno na daljinu",
      text: "Rad na daljinu s timovima u Australiji, Njemačkoj i diljem Europe",
    },
  ],
};

const EXPERIENCE: Partial<Experience>[] = [
  {
    company: "Samozaposlen",
    role: "Freelance full-stack i mobile developer",
    period: "sij 2025. – danas",
    details:
      "B2B / freelance · Na daljinu · Mobilne aplikacije, web platforme i web stranice za klijente",
    bullets: [
      "Elan Reformer Studio (klijent): od početka do kraja izradio sam React Native / Expo aplikaciju studija: raspored i rezervacije termina, korisničke račune, cjenik i račune, push obavijesti i Stripe plaćanja, uz administratorski dio s blagajnom (POS), izvještajima, upravljanjem korisnicima i chatom za podršku uživo. Backend na Firebaseu (Auth, Firestore, Cloud Functions); objavljeno na App Storeu i Google Playu putem EAS-a.",
      "Police App (klijent): Next.js / TypeScript PWA na API Platform (Symfony / PHP) backendu za upravljanje policijskim postajama, djelatnicima, evidentiranim građanima i zakazanim provjerama po kategoriji kaznenog djela. Pristup prema ulogama, Docker Compose i Helm / Kubernetes deployment, end-to-end testovi.",
      "Naj Saloni: društvena aplikacija za beauty profesionalce, izrađena na Expu i Firebaseu (Data Connect, Cloud Functions).",
      "Web stranice za klijente: WordPress / Elementor stranice s prilagođenim PHP-om za male tvrtke, izrađene izravno s vlasnicima.",
    ],
  },
  {
    role: "Softverski inženjer",
    period: "lip 2021. – pro 2024.",
    details:
      "Front-end → full-stack · Split, Hrvatska · Rješenja digitalnog identiteta za njemačku saveznu vladu",
    bullets: [
      "Vodio front-end razvoj sigurnih rješenja digitalnog identiteta koja koristi njemačka savezna vlada.",
      "Izrađivao React / Next.js aplikacije u TypeScriptu s REST integracijama i Jest testovima.",
      "Proširio rad na full-stack: Scala backend API-ji i autentikacija na Keycloaku (OIDC / SSO).",
      "Kao Release Master u Scrum timu koordinirao cikluse izdanja od početka do kraja; mentorirao 5 inženjera.",
      "Pretvarao Figma dizajne UX tima u ponovno iskoristive, responzivne komponente sučelja.",
    ],
  },
  {
    role: "Voditelj plaćene podrške (programer)",
    period: "lip 2020. – svi 2021.",
    details: "Na daljinu · Sydney, Australija",
    bullets: [
      "Vodio eskalacije plaćene podrške za enterprise korisnike kroz .NET, Java, PHP, Python i Android SDK-ove.",
      "Reproducirao i dijagnosticirao složene greške u obradi dokumenata te s produktnim timovima isporučivao zaobilazna rješenja i zakrpe.",
      "Mentorirao 3 inženjera; provjeravao ispravke na Docker, VM i cloud okruženjima.",
    ],
  },
  {
    role: "Softverski developer (student)",
    period: "ruj 2018. – tra 2020.",
    details: "Split, Hrvatska",
    bullets: [
      "React / Node.js nadzorna ploča, Electron alat za QA te automatizacija testova u Javi / Jenkinsu.",
    ],
  },
];

export const experienceHr: Experience[] = experience.map((job, index) => ({
  ...job,
  ...EXPERIENCE[index],
}));

export const ownProductsHr = withText(ownProducts, [
  {
    status: "S Vexnetom · Google Play",
    description:
      "Aplikacija za pilates studio, izrađena zajedno s Vexnetom: raspored i rezervacije termina, korisnički računi, cjenik i računi, push obavijesti i Stripe plaćanja, uz administratorski dio s blagajnom (POS), izvještajima, upravljanjem korisnicima i chatom za podršku uživo.",
  },
  {
    status: "Završeno",
    description:
      "Opuštena puzzle igra za iOS, Android i web (itch.io, CrazyGames): 100 razina, 13 jezika, AdMob oglasi i kupnje u aplikaciji, postignuća i enciklopedija životinja. Trailer je vlastite izrade.",
  },
  {
    status: "Trailer",
    description:
      "Dating horor igra: počinje kao aplikacija za upoznavanje, a onda postaje mračna.",
    stack: "Igra",
  },
  {
    status: "U razvoju",
    description:
      "SaaS za agencije za nekretnine: 3D šetnje generirane iz videa s mobitela pomoću Python GPU pipelinea (COLMAP → Gaussian splatting), stranice oglasa za dijeljenje i nadzorna ploča za agencije.",
  },
  {
    status: "U razvoju",
    description:
      "Idle-tycoon igra odobrena za izdavanje, ugovor s izdavačem u pregovorima. Popis sportaša, utakmice temeljene na taktici, ekonomija kluba i WebGL izdanja jednim klikom.",
  },
  {
    status: "Uživo",
    description:
      "SEO stranica s 18 alata (generatori lozinki i UUID-ova, birači, kocke, kolo) na Cloudflare Pages Functions.",
  },
  {
    name: "Matematički projekt za škole",
    status: "Za škole",
    description:
      "Igra za učenje matematike: 32 vještine iz kurikuluma kroz 112 generiranih razina, od zbrajanja do 10 do jednadžbi, s težinom koja se prilagođava savladanosti svake vještine, savjetima, raspisanim koracima i pisanim postupcima računanja, uz način igre s pričom. Razvija se za školska natjecanja iz matematike, od županijske do državne razine.",
    stack: "Godot 4 · GDScript · proceduralno generiranje zadataka",
  },
]);

export const clientWorkHr = withText(clientWork, [
  {
    status: "Klijent · App Store i Google Play",
    description:
      "Aplikacija studija za rezervacije termina, korisničke račune, račune i plaćanja, s administratorskim dijelom za blagajnu, izvještaje i chat za podršku uživo.",
  },
  {
    status: "Klijent",
    description:
      "PWA za upravljanje policijskim postajama, djelatnicima, evidentiranim građanima i zakazanim provjerama, s pristupom prema ulogama.",
  },
  {
    status: "Klijent",
    description: "Društvena aplikacija za beauty profesionalce.",
  },
  {
    name: "Web stranice za klijente",
    status: "Klijent",
    description:
      "WordPress / Elementor stranice s prilagođenim PHP-om za male tvrtke, izrađene izravno s vlasnicima.",
  },
  {
    status: "Klijent · Uživo",
    description:
      "Dvojezična (HR / EN) web stranica obiteljske vinarije u Kaštel Novom, sa stranicom vinske ture i galerijom.",
    stack: "Web stranica",
  },
]);

export const educationHr: typeof education = {
  degree: "M.Sc. iz ICT-a (mag. ing.)",
  school: "FESB, Sveučilište u Splitu · 2013. – 2019.",
  languages: [
    { name: "Engleski", level: "Izvorna razina / dvojezično" },
    { name: "Hrvatski", level: "Materinji" },
  ],
  more: { title: "Glazbeni producent", text: "Autorska glazba · FL Studio" },
};
