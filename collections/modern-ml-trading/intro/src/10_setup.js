/* ============================================================
   INTRO 10 SETUP: variables, title DOM, world layout, timing (beat grid)
   Song: song_short.m4a (26.6 s) = song_raw.mp4 7.385 - 32.66 s (5 bars
   instrumental + chorus + "an owl in a lab" line) spliced on a downbeat
   to the song's real ending 57.893 - 59.25 s (30 ms crossfade, 0.5 s fade).
   Electro-swing, 133 BPM (beat 0.451 s, bar 1.804 s), measured downbeats
   below. Lyric map (film time):
     0.0 - 11.8 instrumental: dark lab, lamps, swivel, gauge, a swing dance,
                the data seed tossed into the pot, sprout, data points
     11.8 "Fit it RIGHT (12.63), don't overfit"     -> overfit vine, snip, smooth fit
     15.8 "Validate every little bit"               -> walk-forward flasks get ticks
     17.9 "Trees and nets that learn and grow"      -> tree plant + net vine grow
     19.6 "Modern ML for Trading, steal the show"   -> marquee title (19.85), bow (21.65)
     22.8 "An owl in a lab with a data seed"        -> owl raises the glowing seed
     25.26 final hit                                -> ta-da
   All story times are K.at(bar, beat) on these downbeats.
   ============================================================ */
const K = LK, P = K.P, at = K.at;
K.G.BPM = 133;
K.G.BARS = [0.000, 1.804, 3.609, 5.413, 7.218, 9.022, 10.827, 12.631, 14.435, 16.240, 18.044, 19.849, 21.653, 23.458, 25.262];
const DUR = 26.6;
const cv = document.getElementById("cv"), ctx = cv.getContext("2d");
const BEAT = K.beatLen();

/* ---------- story beats ---------- */
const T = {
  iris: [0, at(0, 2)],               /* deco iris opens on a dark lab */
  lamps: [at(1, 0), at(2, 0)],       /* lamps flicker on, full on bar 2 */
  swivel: at(2, 0),                  /* the head swivels 180 to face us */
  wave: [at(2, 2), at(3, 0)],        /* waves hello */
  gauge: at(3, 0),                   /* train-accuracy gauge pops */
  dance1: [at(4, 0), at(5, 0)],      /* a bar of swing dance */
  pocket: at(5, 0),                  /* hand to the coat pocket: the data seed */
  toss: at(5, 1),                    /* seed flies to the pot */
  land: at(5, 2),                    /* lands, pot squashes */
  pour: [at(5, 3), at(6, 0.5)],      /* data drizzle from a flask */
  sprout: at(6, 0),                  /* sprout + data points pop */
  vine: [at(6, 2), at(7, -0.3)],     /* "Fit it": vine overfits every point */
  worry: at(6, 3.3),                 /* eyes pop at the mess */
  snip: at(7, 0),                    /* "RIGHT": snip! */
  wag: [at(7, 3), at(8, 0.6)],       /* "don't overfit": finger wag */
  band: at(8, 0),                    /* uncertainty band blooms */
  truck1: [at(8, 2), at(9, 0)],      /* walk to the flask bench */
  flasks: at(8, 3.2),                /* flasks pop on sixteenths as we arrive */
  ticks: at(9, 0.5),                 /* "Validate every little bit": ticks on eighths */
  jump: [at(9, 3), at(10, 0)],        /* leap to the garden bench */
  grow: at(10, 0),                    /* "Trees and nets": both grow */
  zoomOut: [at(10, 3), at(11, 0)],
  title: at(11, 0),                   /* "Modern ML for Trading": marquee drop */
  letters: at(11, 0.5),
  show: at(12, 0),                    /* "steal the show": spotlight, bow, medals */
  thumb: at(12, 2.5),
  seedUp: at(13, 0),                 /* "An owl in a lab with a data seed" */
  wink: at(13, 2),
  finale: at(14, 0),                 /* the song's last hit: ta-da */
};

/* ---------- variables ---------- */
const VARS = Object.assign({ title: "Modern ML|for Trading", lang: "en" },
  (window.__hyperframes && window.__hyperframes.getVariables && window.__hyperframes.getVariables()) || {});
const LANG = VARS.lang || "en";
const TITLE_LINES = String(VARS.title || "Modern ML|for Trading").split("|").map((s) => s.trim()).filter(Boolean);
const IS_CJK = LANG === "zh-CN" || LANG === "zh-TW";

/* ---------- title DOM: one span per character ---------- */
const titleEl = document.getElementById("title");
if (LANG === "zh-CN") titleEl.classList.add("cjk-sc");
if (LANG === "zh-TW") titleEl.classList.add("cjk-tc");
/* the marquee's glass panel is about 1240 px wide inside the bulbs.
   Oswald is condensed: a capital at 100 px is about 50-58 px wide with tracking */
const longest = Math.max(...TITLE_LINES.map((s) => Array.from(s).length));
const CYR = /[Ѐ-ӿ]/.test(VARS.title);
const TITLE_SIZE = IS_CJK ? 98 : Math.min(110, Math.floor((CYR ? 1700 : 1850) / Math.max(9, longest)));
const TITLE_CH = [];
TITLE_LINES.forEach((ln, li) => {
  const d = document.createElement("div");
  d.className = "ln " + (li === TITLE_LINES.length - 1 && TITLE_LINES.length > 1 ? "l1" : "l0");
  const size = li === 0 || TITLE_LINES.length === 1 ? TITLE_SIZE : Math.round(TITLE_SIZE * 0.72);
  d.style.fontSize = size + "px";
  d.dataset.size = size;
  Array.from(ln).forEach((c) => {
    const s = document.createElement("span");
    s.className = "ch"; s.textContent = c === " " ? " " : c;
    d.appendChild(s); TITLE_CH.push({ el: s, line: li, idx: TITLE_CH.length });
  });
  titleEl.appendChild(d);
});
const TITLE_LN = Array.from(titleEl.querySelectorAll(".ln"));

/* ---------- world layout (one long lab; the camera trucks along it) ---------- */
const BENCH_Y = 780;
const ST_A = { cam: { x: 1000, y: 520 }, owl: 1430, pot: 640, plate: { x: 900, y: 360, w: 680, h: 430 } };
const ST_B = { cam: { x: 2420, y: 520 }, owl: 1830, flasks: [2090, 2280, 2470, 2660, 2850] };
const ST_C = { cam: { x: 4050, y: 520 }, owl: 4050, tree: 3500, net: 4620 };
const WINDOWS = [[1960, -160, 300, 560], [2900, -160, 300, 560], [4050, -220, 360, 600], [520, -160, 300, 560], [3300, -160, 300, 560], [4800, -160, 300, 560]];

/* plate data: a gentle trend plus seeded noise (the "market") */
const NPTS = 12;
const TRUE_F = (u) => 0.30 + 0.40 * u + 0.13 * Math.sin(u * 5.2 + 0.3);
const PTS = Array.from({ length: NPTS }, (_, i) => K.clamp(TRUE_F(i / (NPTS - 1)) + K.hs(i, 11) * 0.16, 0.06, 0.94));
/* the smooth fit and its uncertainty band (wider at the edges, like a real fit) */
const FIT = Array.from({ length: 25 }, (_, i) => TRUE_F(i / 24));
const BAND_W = (u) => 0.07 + 0.09 * Math.pow(2 * u - 1, 2);
const BAND = { lo: FIT.map((v, i) => v - BAND_W(i / 24)), hi: FIT.map((v, i) => v + BAND_W(i / 24)) };
