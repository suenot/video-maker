/* ============================================================
   INTRO 10 SETUP: variables, title DOM, world layout, timing (beat grid)
   Song: song_20s.m4a = song_raw.mp4 12.78 - 32.63 s, one take, no splice.
   Electro-swing, 133 BPM (beat 0.451 s, bar 1.804 s). Measured downbeats
   (librosa grid fit + whisper word times) below. Lyric map (cut time):
     0.0 - 5.4  band instrumental (3 bars)
     6.4 "Fit it RIGHT (7.24), don't overfit"      -> overfit vine, snip, smooth fit
     10.4 "Validate every little bit"              -> walk-forward flasks get ticks
     12.4 "Trees and nets that learn and grow"     -> tree plant + net vine grow
     14.2 "Modern ML for Trading, steal the show"  -> marquee title, spotlight bow
     17.4 "An owl in a lab with a data seed"       -> owl raises the glowing seed
   All story times are K.at(bar, beat) on these downbeats.
   ============================================================ */
const K = LK, P = K.P, at = K.at;
K.G.BPM = 133;
K.G.BARS = [0.018, 1.822, 3.627, 5.431, 7.236, 9.040, 10.845, 12.649, 14.454, 16.258, 18.062, 19.867];
const DUR = 19.9;
const cv = document.getElementById("cv"), ctx = cv.getContext("2d");
const BEAT = K.beatLen();

/* ---------- story beats ---------- */
const T = {
  iris: [0, at(0, 1.5)],             /* deco iris opens on the first downbeat */
  swivel: at(1, 0),                  /* 1.82 the head swivels 180 to face us */
  wave: [at(1, 2), at(2, 0)],        /* waves hello */
  pocket: at(2, 0),                  /* 3.63 hand to the coat pocket: the data seed */
  toss: at(2, 1),                    /* seed flies to the pot */
  land: at(2, 2),                    /* 4.53 lands, pot squashes */
  pour: [at(2, 3), at(3, 0.5)],      /* data drizzle from a flask */
  sprout: at(3, 0),                  /* 5.43 sprout + data points pop */
  vine: [at(3, 2), at(4, -0.3)],     /* 6.33 "Fit it": vine overfits every point */
  worry: at(3, 3.3),                 /* eyes pop at the mess */
  snip: at(4, 0),                    /* 7.24 "RIGHT": snip! */
  wag: [at(4, 3), at(5, 0.6)],       /* "don't overfit": finger wag */
  band: at(5, 0),                    /* 9.04 uncertainty band blooms */
  truck1: [at(5, 2), at(6, 0)],      /* walk to the flask bench */
  flasks: at(5, 3.2),                /* 10.49 flasks pop on sixteenths as we arrive */
  ticks: at(6, 0.5),                 /* 11.07 "Validate every little bit": ticks on eighths */
  jump: [at(6, 3), at(7, 0)],        /* leap to the garden bench */
  grow: at(7, 0),                    /* 12.65 "Trees and nets": both grow */
  zoomOut: [at(7, 3), at(8, 0)],
  title: at(8, 0),                   /* 14.45 "Modern ML for Trading": marquee drop */
  letters: at(8, 0.5),
  show: at(9, 0),                    /* 16.26 "steal the show": spotlight, bow, medals */
  thumb: at(9, 2.5),
  seedUp: at(10, 0),                 /* 18.06 "An owl in a lab with a data seed" */
  wink: at(10, 2),
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
const WINDOWS = [[1960, -160, 300, 560], [2900, -160, 300, 560], [4050, -220, 360, 600], [520, -160, 300, 560], [3300, -160, 300, 560], [4800, -160, 300, 560]];

/* plate data: a gentle trend plus seeded noise (the "market") */
const NPTS = 12;
const TRUE_F = (u) => 0.30 + 0.40 * u + 0.13 * Math.sin(u * 5.2 + 0.3);
const PTS = Array.from({ length: NPTS }, (_, i) => K.clamp(TRUE_F(i / (NPTS - 1)) + K.hs(i, 11) * 0.16, 0.06, 0.94));
/* the smooth fit and its uncertainty band (wider at the edges, like a real fit) */
const FIT = Array.from({ length: 25 }, (_, i) => TRUE_F(i / 24));
const BAND_W = (u) => 0.07 + 0.09 * Math.pow(2 * u - 1, 2);
const BAND = { lo: FIT.map((v, i) => v - BAND_W(i / 24)), hi: FIT.map((v, i) => v + BAND_W(i / 24)) };
