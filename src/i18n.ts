import { useStore } from "./store";
import {
  clientWork,
  education,
  experience,
  ownProducts,
  profile,
} from "./data/cv";
import {
  clientWorkHr,
  educationHr,
  experienceHr,
  ownProductsHr,
  profileHr,
} from "./data/cv.hr";

export type Lang = "en" | "hr";

const en = {
  // Menu and HUD
  cv: "CV",
  projects: "Projects",
  music: "Music",
  room: "Room",
  freeRoam: "Free roam",
  freeRoamTitle: "Walk freely with WASD or the on-screen arrows",
  sounds: "Sounds",
  soundsTitle: "Room ambience and sound effects",
  pixel: "Pixel",
  pixelTitle: "Pixel art look",
  contact: "Contact me",
  switchLanguage: "HR",
  switchLanguageTitle: "Hrvatski",
  helpFree:
    "Drag to look · WASD / arrows to walk · Shift to run · click things",
  helpGuided:
    "Click a glowing ring or object · ← → to switch · ↓ for the whole room",
  tip: "Tip: click a glowing ring to walk there, or use ← → to visit each spot.",
  previousStation: "Previous station",
  nextStation: "Next station",
  rooms: "Rooms",
  stations: "Stations",
  play: "Play",
  pause: "Pause",
  close: "Close",
  // Loading and intro
  loading: "Setting up the room…",
  ready: "Ready",
  factYears: "7+ years shipping production software",
  remote: "Remote",
  welcome:
    "Welcome to my room. My CV is on the desk, the projects I built are on the TV, and the music I compose is on the shelf.",
  enter: "Enter the room",
  skip: "Just show me the CV",
  introHint: "Best with sound on · drag to look around · WASD to walk",
  // CV
  print: "Print / save as PDF",
  profileTitle: "Profile",
  experienceTitle: "Experience",
  productsTitle: "Own products & R&D",
  techTitle: "Tech stack",
  educationTitle: "Education, languages & more",
  also: "Also:",
  // TV
  tvTitle: "TV · projects I built",
  previousChannel: "Previous channel",
  nextChannel: "Next channel",
  switchHint: (last: number) => `← → or 1–${last} to switch`,
  on: "ON",
  guide: "P100 PROGRAMME GUIDE",
  visit: (host: string) => `VISIT ${host.toUpperCase()} ↗`,
  // Music
  allAlbums: "← All albums",
  musicIntro:
    "Original music I compose and produce in FL Studio. Pick an album, or take a book from the shelf.",
  tracks: (count: number) => `${count} tracks · original music · previews`,
  position: "Position in song",
  volume: "Volume",
  // Hover labels in the room
  readCv: "Read my CV",
  watchTv: "Watch my projects on TV",
  nextTvChannel: "Next channel",
  phone: "Reformer Studio app: watch it on the TV",
  listenTo: (album: string) => `Listen to ${album}`,
  playPauseRecord: "Play / pause the record",
  pickRecord: "Pick a record from the shelf",
  goToDesk: "Go to the desk: my CV",
  goToTv: "Go to the TV: my projects",
  goToShelf: "Go to the shelf: my music",
  // Tech stack groups, in the order of src/data/tech.ts
  techGroups: [
    "Languages",
    "Frameworks",
    "Data & payments",
    "DevOps & security",
    "Games, 3D & more",
  ],
  otherSkills: [
    "Push notifications",
    "App Store / Google Play releases",
    "CI/CD",
    "OIDC / SSO",
    "AdMob / IAP",
    "PixiJS",
    "AI-assisted development",
    "SEO",
  ],
};

const hr: typeof en = {
  cv: "CV",
  projects: "Projekti",
  music: "Glazba",
  room: "Soba",
  freeRoam: "Slobodno",
  freeRoamTitle: "Slobodno hodanje s WASD tipkama ili strelicama na ekranu",
  sounds: "Zvukovi",
  soundsTitle: "Zvukovi sobe i efekti",
  pixel: "Pikseli",
  pixelTitle: "Pixel art izgled",
  contact: "Kontakt",
  switchLanguage: "EN",
  switchLanguageTitle: "English",
  helpFree:
    "Povuci za pogled · WASD / strelice za hodanje · Shift za trčanje · klikni stvari",
  helpGuided:
    "Klikni svjetleći krug ili predmet · ← → za promjenu · ↓ za cijelu sobu",
  tip: "Savjet: klikni svjetleći krug da odeš tamo ili koristi ← → za obilazak.",
  previousStation: "Prethodna točka",
  nextStation: "Sljedeća točka",
  rooms: "Kutovi sobe",
  stations: "Točke",
  play: "Pokreni",
  pause: "Pauza",
  close: "Zatvori",
  loading: "Pripremam sobu…",
  ready: "Spremno",
  factYears: "7+ godina isporuke produkcijskog softvera",
  remote: "Na daljinu",
  welcome:
    "Dobrodošli u moju sobu. CV je na stolu, projekti koje sam napravio su na TV-u, a glazba koju skladam je na polici.",
  enter: "Uđi u sobu",
  skip: "Samo mi pokaži CV",
  introHint: "Najbolje uz zvuk · povuci za pogled · WASD za hodanje",
  print: "Ispiši / spremi kao PDF",
  profileTitle: "Profil",
  experienceTitle: "Iskustvo",
  productsTitle: "Vlastiti proizvodi i R&D",
  techTitle: "Tehnologije",
  educationTitle: "Obrazovanje, jezici i ostalo",
  also: "Također:",
  tvTitle: "TV · projekti koje sam napravio",
  previousChannel: "Prethodni kanal",
  nextChannel: "Sljedeći kanal",
  switchHint: (last: number) => `← → ili 1–${last} za promjenu`,
  on: "UPALJEN",
  guide: "P100 TV VODIČ",
  visit: (host: string) => `POSJETI ${host.toUpperCase()} ↗`,
  allAlbums: "← Svi albumi",
  musicIntro:
    "Autorska glazba koju skladam i produciram u FL Studiju. Odaberi album ili uzmi knjigu s police.",
  tracks: (count: number) => `${count} pjesama · autorska glazba · isječci`,
  position: "Položaj u pjesmi",
  volume: "Glasnoća",
  readCv: "Pročitaj moj CV",
  watchTv: "Pogledaj moje projekte na TV-u",
  nextTvChannel: "Sljedeći kanal",
  phone: "Reformer Studio aplikacija: pogledaj je na TV-u",
  listenTo: (album: string) => `Poslušaj ${album}`,
  playPauseRecord: "Pokreni / pauziraj ploču",
  pickRecord: "Uzmi ploču s police",
  goToDesk: "Idi do stola: moj CV",
  goToTv: "Idi do TV-a: moji projekti",
  goToShelf: "Idi do police: moja glazba",
  techGroups: [
    "Jezici",
    "Frameworci",
    "Podaci i plaćanja",
    "DevOps i sigurnost",
    "Igre, 3D i ostalo",
  ],
  otherSkills: [
    "Push obavijesti",
    "Objave na App Store / Google Play",
    "CI/CD",
    "OIDC / SSO",
    "AdMob / IAP",
    "PixiJS",
    "Razvoj uz pomoć AI-ja",
    "SEO",
  ],
};

const texts = { en, hr };

// Interface texts in the visitor's language.
export const useT = () => texts[useStore((state) => state.lang)];

const cvContent = {
  en: { profile, experience, ownProducts, clientWork, education },
  hr: {
    profile: profileHr,
    experience: experienceHr,
    ownProducts: ownProductsHr,
    clientWork: clientWorkHr,
    education: educationHr,
  },
};

// The CV in the visitor's language. `channels` keeps the same order in both
// languages, so a channel number means the same project.
export const useCv = () => {
  const content = cvContent[useStore((state) => state.lang)];
  const channels = [...content.ownProducts, ...content.clientWork].filter(
    (project) => project.onTv !== false,
  );
  return { ...content, channels };
};

export const detectLang = (): Lang => {
  try {
    const saved = localStorage.getItem("lang");
    if (saved === "en" || saved === "hr") return saved;
  } catch {
    // Fall back to the browser's language.
  }
  return navigator.language.toLowerCase().startsWith("hr") ? "hr" : "en";
};
