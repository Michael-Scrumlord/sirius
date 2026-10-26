// The three machines and what runs on them. Public page: roles and services only. No hardware specs, model names,
// addresses, ports, host or account names.
export const BODIES = {
  sirius: {
    name: "Sirius",
    expansion: "Self Improving Remote Intelligent Utility Server",
    tagline: "The home server: apps, storage, the graphics card and the agents' workplace.",
    about:
      "Sirius is where nearly everything lives. Apps sleep until someone opens them and wake in a few seconds, so " +
      "dozens of services cost almost nothing while idle. AI assistants build and maintain it in the open: they " +
      "coordinate by mail, file reports when something breaks, and ask for access through a gatekeeper instead of " +
      "holding keys. Michael decides; the agents do the work.",
    color: 0xd9e8ff, glow: "#cfe2ff", radius: 2.4, position: [0, 0, 0],
    groups: [
      { title: "Home", color: 0x7fb7ff, items: [
        ["Sirius Station", "the start page: every app, live status, power and the household calendar on one screen"],
        ["Household calendar", "shared by the TV, the Station and the agents; every change is logged with who made it"],
        ["Living-room TV", "a dashboard app with weather and the calendar, plus toasts when agents finish work"],
        ["Power watch", "battery and power-cut alerts, and a safe shutdown before the battery runs out"],
      ]},
      { title: "Make", color: 0xffb36b, items: [
        ["Image and music generation", "ComfyUI with tested workflows that agents and people run alike"],
        ["Design and diagrams", "Penpot for interface design, draw.io for diagrams"],
        ["Sewing studio", "patterns drafted from measurements, checked against a design spec, sewing-ready PDFs and a 3D drape"],
        ["Inspiration library", "Karakeep: saved references with screenshots, archives, notes and AI tags from a local model"],
        ["Performance lab", "Lighthouse runs and site previews with a screenshot service for reviewing web work"],
      ]},
      { title: "Files and media", color: 0x8be0b0, items: [
        ["Shared folder", "one network folder for the household and the agents, with per-person access"],
        ["Media server", "Jellyfin for films, shows and music on the TV and phones"],
        ["Document archive", "Paperless-ngx: scanned and searchable paperwork"],
        ["PDF tools", "Stirling-PDF for merging, splitting and converting"],
        ["Sirius Backup", "encrypted backups to the owner's own Google Drive (details below)"],
      ]},
      { title: "Play", color: 0xff7fa8, items: [
        ["Game streaming", "Sunshine streams games to the TV, phone and laptop with Moonlight"],
        ["Ports and emulators", "native PC ports and emulators, launched from the TV like any other app"],
      ]},
      { title: "Build", color: 0xc9a6ff, items: [
        ["Code hosting", "Gitea with continuous integration: every repo, issue and pull request stays at home"],
        ["Dev containers", "one sandbox per person and per assistant, woken on demand"],
        ["GitHub copies", "chosen repos copied out only after a secret and privacy scan"],
        ["Local model", "a small language model for Vega's answers, Karakeep's tags and trials of cheaper agent work"],
      ]},
      { title: "Agents", color: 0x6fe3e8, items: [
        ["Agent mail", "every assistant has its own mailbox; plans and results go to a shared list"],
        ["Answer desk", "four models take turns answering other agents' questions from the guide, the code and the web"],
        ["The Warden", "grants access from a fixed catalogue; every grant is reversible and expires"],
        ["Report queue", "assistants report what broke or wasted time; each report becomes a ticket someone fixes"],
        ["Agent guide", "the shared handbook every assistant reads first, published from version control"],
      ]},
      { title: "Care", color: 0xe8e08a, items: [
        ["On-demand apps", "services sleep after thirty minutes unused and wake on the first visit"],
        ["Device watch", "NetAlertX keeps track of what joins the home network"],
        ["Private access", "Tailscale makes Sirius reachable from anywhere without opening it to the internet"],
        ["Health readings", "temperatures and use of all three machines, with alerts before anything overheats"],
      ]},
    ],
  },
  vega: {
    name: "Vega",
    expansion: "Variable Endpoint for General Assistance",
    tagline: "The companion that stays on: the house's voice and its Apple-side helper.",
    about:
      "Vega is the endpoint people talk to. Its speaker says what the TV shows, and its talk page answers questions " +
      "out loud. The thinking happens on Sirius and Rigel; Vega listens, speaks and keeps an eye on Sirius.",
    color: 0xb8d4ff, glow: "#a9c9ff", radius: 1.4, position: [-30, 7, -16],
    groups: [
      { title: "Voice", color: 0x7fb7ff, items: [
        ["Spoken alerts", "after a chime, Vega says the alerts the TV shows, with quiet hours and volume set from the Station"],
        ["Character voices", "BMO, GLaDOS, HAL 9000 and SpongeBob, each with its own personality"],
      ]},
      { title: "Talk", color: 0x6fe3e8, items: [
        ["Push to talk", "hold a button, speak, and watch the message go Sent, Heard and Answered"],
        ["Vega's agent", "a cloud model first and a local model as fallback; it can check on Sirius and add to the calendar"],
      ]},
      { title: "Watch", color: 0xe8e08a, items: [
        ["Watchdog", "Vega says when Sirius stops answering, and Sirius shows on the TV when Vega goes quiet"],
      ]},
      { title: "Apple side", color: 0xffb36b, items: [
        ["Mac-only work", "builds and tools that need macOS, without keeping a laptop awake"],
      ]},
    ],
  },
  rigel: {
    name: "Rigel",
    expansion: "the newest companion",
    tagline: "A headless helper: voices on its graphics card and room for more storage.",
    about:
      "Rigel runs without a screen, lid closed, and only Sirius may talk to its services. It takes the voice work off " +
      "Sirius so answers come back quickly, and it is where the library can grow.",
    color: 0x9fbcff, glow: "#8fb3ff", radius: 1.8, position: [27, -6, -22],
    groups: [
      { title: "Voices", color: 0xff7fa8, items: [
        ["Voice conversion", "turns plain speech into BMO's voice in about a second; Sirius keeps a slower copy as fallback"],
        ["Narrator", "a small local model that says a line about your question while the answer is on its way"],
      ]},
      { title: "Library", color: 0x8be0b0, items: [
        ["Storage helper", "the machine beside Sirius that can hold more: copies and backups"],
      ]},
      { title: "Watched", color: 0xe8e08a, items: [
        ["Health and use", "temperatures, graphics load and use recorded beside Sirius's own, with heat alerts"],
      ]},
    ],
  },
};

// Lines between the stars: what flows between them.
export const LINKS = [
  ["sirius", "vega", "alerts, speech and the watchdog"],
  ["sirius", "rigel", "voice work and health readings"],
  ["vega", "rigel", "BMO's voice"],
];
