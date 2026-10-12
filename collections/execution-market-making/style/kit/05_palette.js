/* ============================================================
   KIT 05 PALETTE + TYPE: the only place colours and fonts are defined.
   1950s screen-print poster: four inks (mustard, teal, cream, charcoal)
   plus one tomato accent used only for impact, loss and the ask side.
   STYLE.md documents the same values; change both together.
   ============================================================ */
var SK = window.SK || (window.SK = {});
(function (K) {
  K.P = {
    /* the four inks */
    ink: "#2a2a2e",          /* key plate: all lines, dark type */
    inkSoft: "#4d4b52",      /* secondary lines, halftone on cream */
    cream: "#f3e6c8",        /* paper, signs, light type */
    creamShade: "#e0cfa6",
    creamDeep: "#cdb88a",
    mustard: "#e2a42b", mustardDark: "#b07a12", mustardLight: "#f3c95f",
    teal: "#2a7b78", tealDark: "#1b5654", tealLight: "#5fa79c", tealPale: "#a7d0c3",
    /* the one accent (impact, loss, ask) */
    tomato: "#d65a3a", tomatoDark: "#a23e26", tomatoLight: "#ec8a6c",
    /* mascot: Mr. Tick, the stationmaster mouse */
    fur: "#b4aa9c", furDark: "#8a8073", furLight: "#d8d0c2", earPink: "#ec9a86", nose: "#2a2a2e",
    eye: "#fffaf0", pupil: "#1f1e22", glove: "#fbf6ea", gloveShade: "#ddd3bf",
    /* sky and land */
    sky: "#f1dfb5", skyHigh: "#e9d3a0", sun: "#e2a42b",
    hillFar: "#a7d0c3", hillMid: "#5fa79c", hillNear: "#2a7b78",
    steel: "#5c6168", steelDark: "#3c4046", steelLight: "#8b9097",
    wood: "#a8743a", woodDark: "#7a5126",
    water: "#5fa79c", waterDeep: "#2a7b78", foam: "#f3e6c8",
    /* data / explainer */
    bid: "#2a7b78",          /* buy side, passive quotes, "good" */
    ask: "#d65a3a",          /* sell side, impact, "bad" */
    profit: "#e2a42b",       /* money, the chosen schedule */
    board: "#2a2a2e",        /* split-flap / departure board */
    flap: "#3a3a40", flapText: "#f3e6c8",
    enamel: "#2a7b78",       /* enamel sign (formulas, titles) */
  };
  K.FONT = {
    display: '"Jost", "CJK SC", "CJK TC", sans-serif',   /* titles, labels (700/800) */
    text: '"Jost", "CJK SC", "CJK TC", sans-serif',      /* body (500) */
    mono: '"IBM Plex Mono", monospace',                  /* numbers, flaps, code, tables */
    cjk: { "zh-CN": '"CJK SC", "Jost", sans-serif', "zh-TW": '"CJK TC", "Jost", sans-serif' },
  };
})(SK);
