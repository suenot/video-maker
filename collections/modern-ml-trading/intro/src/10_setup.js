/* ============================================================
   INTRO 10 SETUP: variables, title DOM, world layout, timing (beat grid)
   Song: song_full.m4a = song_raw.mp4 1.95 - 59.2 s (the whole song,
   leading silence trimmed), electro-swing 133 BPM (beat 0.451 s, bar 1.804 s).
   Measured downbeats (librosa grid fit + whisper word times) below.
   Lyric map (film time):
     0.0 - 17.2  instrumental: lab lights up, seed, sprout, gauge, swing dance
     17.2 "Fit it RIGHT (18.07), don't overfit"     -> overfit vine, snip, smooth fit
     21.2 "Validate every little bit"              -> walk-forward flasks get ticks
     23.3 "Trees and nets that learn and grow"     -> tree plant + net vine grow
     25.1 "Modern ML for Trading, steal the show"  -> plants bloom, spotlight bow
     28.3 "An owl in a lab with a data seed"       -> owl raises the glowing seed
     30.6 "Grows a little model on features to feed" -> new pot, feature pellets
     33.5 "Train it, test it, walk it forward in time" -> sliding train/test windows
     36.0 "No peeking at the future"               -> shutter over the future, eyes covered
     37.4 "keep the backtest clean"                -> feather duster, sparkle
     39.3 "Fit it RIGHT (39.72), don't overfit"     -> prune the wild twigs
     41.9 "Validate every little bit"              -> ticks over the plants
     43.3 "Trees and nets that learn and grow"     -> plants grow, net pulses
     45.1 "Modern ML for Trading, steal the show"  -> marquee title, bow, medals
     48.7 - 57.3 outro                             -> swing dance, final seed + wink
   All story times are K.at(bar, beat) on these downbeats.
   ============================================================ */
const K = LK, P = K.P, at = K.at;
K.G.BPM = 133;
K.G.BARS = [0.021, 1.825, 3.630, 5.434, 7.239, 9.043, 10.848, 12.652, 14.456, 16.261, 18.065, 19.870, 21.674, 23.479, 25.283, 27.087,
  28.892, 30.696, 32.501, 34.305, 36.110, 37.914, 39.718, 41.523, 43.327, 45.132, 46.936, 48.741, 50.545, 52.349, 54.154, 55.958];
const DUR = 57.3;
const cv = document.getElementById("cv"), ctx = cv.getContext("2d");
const BEAT = K.beatLen();

/* ---------- story beats ---------- */
const T = {
  iris: [0, at(0, 2)],               /* deco iris opens on a dark lab */
  lamps: [at(1, 0), at(2, 0)],       /* 1.83 lamps flicker on, full on the band entry */
  swivel: at(2, 0),                  /* 3.63 the head swivels 180 to face us */
  wave: [at(2, 2), at(3, 0)],        /* waves hello */
  pocket: at(4, 0),                  /* 7.24 hand to the coat pocket: the data seed */
  toss: at(4, 1),
  land: at(4, 2),
  pour: [at(4, 3), at(5, 0.5)],      /* data drizzle from a flask */
  sprout: at(5, 0),                  /* 9.04 sprout + data points pop */
  gauge: at(6, 0),                   /* 10.85 train-accuracy gauge pops, needle climbs */
  creep: [at(7, 0), at(9, 0)],       /* the vine creeps up, needle drifts into the red */
  dance1: [at(8, 0), at(9, 0)],      /* 14.46 a little swing dance */
  vine: [at(9, 2), at(10, -0.3)],    /* 17.16 "Fit it": vine overfits every point */
  worry: at(9, 3.3),
  snip: at(10, 0),                   /* 18.07 "RIGHT": snip! */
  wag: [at(10, 3), at(11, 0.6)],     /* "don't overfit": finger wag */
  band: at(11, 0),                   /* 19.87 uncertainty band */
  truck1: [at(11, 2), at(12, 0)],    /* walk to the flask bench */
  flasks: at(11, 3.2),
  ticks: at(12, 0.5),                /* 21.9 "Validate every little bit" */
  jump: [at(12, 3), at(13, 0)],      /* leap to the garden bench */
  grow: at(13, 0),                   /* 23.48 "Trees and nets" */
  bloom: at(14, 0),                  /* 25.28 "Modern ML for Trading": plants bloom, spotlight */
  bow1: at(15, 0),                   /* 27.09 "steal the show": bow */
  seedUp: at(16, 0),                 /* 28.89 "An owl in a lab with a data seed" */
  wink1: at(16, 2),
  truck2: [at(16, 3), at(17, 0)],    /* hop over to the nursery bench */
  plant: at(17, 0),                  /* 30.70 "Grows a little model": seed into the new pot */
  feed: [at(17, 2), at(19, 0)],      /* "on features to feed": feature pellets on eighths */
  wf: at(19, 0),                     /* 34.31 "Train it, test it, walk it forward" */
  peek: at(20, 0),                   /* 36.11 "No peeking at the future": shutter */
  cover: at(20, 1.6),                /* covers the eyes on "future" */
  clean: [at(21, 0), at(21, 3)],     /* 37.91 "keep the backtest clean": duster */
  truck3: [at(21, 3), at(22, 0)],    /* leap back to the garden */
  wild: at(21, 2),                   /* wild twigs have sprouted on the tree */
  prune: at(22, 0),                  /* 39.72 "RIGHT": prune the twigs */
  ticks2: at(23, 0),                 /* 41.52 "Validate": ticks over the plants */
  grow2: at(24, 0),                  /* 43.33 "Trees and nets ... grow": plants swell */
  zoomOut: [at(24, 2), at(25, 0)],
  title: at(25, 0),                  /* 45.13 "Modern ML for Trading": marquee drop */
  letters: at(25, 0.5),
  show: at(26, 0),                   /* 46.94 "steal the show": spotlight, bow */
  medals: at(27, 0),                 /* 48.74 medals pop on eighths */
  thumb: at(27, 2.5),
  dance2: [at(28, 0), at(31, 0)],    /* 50.55 outro swing dance */
  final: at(31, 0),                  /* 55.96 seed held high */
  wink: at(31, 2),
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
const TITLE_SIZE = IS_CJK ? 122 : Math.min(118, Math.floor((CYR ? 1900 : 2050) / Math.max(9, longest)));
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
const ST_D = { cam: { x: 6050, y: 520 }, owl: 5840, pot: 5600, plate: { x: 6350, y: 330, w: 640, h: 400 } };
const WINDOWS = [[1960, -160, 300, 560], [2900, -160, 300, 560], [4050, -220, 360, 600], [520, -160, 300, 560], [3300, -160, 300, 560], [4800, -160, 300, 560], [6900, -160, 300, 560], [5450, -160, 300, 560]];

/* plate data: a gentle trend plus seeded noise (the "market") */
const NPTS = 12;
const TRUE_F = (u) => 0.30 + 0.40 * u + 0.13 * Math.sin(u * 5.2 + 0.3);
const PTS = Array.from({ length: NPTS }, (_, i) => K.clamp(TRUE_F(i / (NPTS - 1)) + K.hs(i, 11) * 0.16, 0.06, 0.94));
/* the smooth fit and its uncertainty band (wider at the edges, like a real fit) */
const FIT = Array.from({ length: 25 }, (_, i) => TRUE_F(i / 24));
const BAND_W = (u) => 0.07 + 0.09 * Math.pow(2 * u - 1, 2);
const BAND = { lo: FIT.map((v, i) => v - BAND_W(i / 24)), hi: FIT.map((v, i) => v + BAND_W(i / 24)) };

/* walk-forward plate (station D): a price path, train/test windows step forward */
const WF = Array.from({ length: 24 }, (_, i) => K.clamp(0.42 + 0.28 * Math.sin(i * 0.42 + 0.6) * (0.6 + i / 40) + K.hs(i, 23) * 0.08 + i * 0.008, 0.08, 0.92));
