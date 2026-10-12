/* ============================================================
   KIT 05 PALETTE + TYPE: the only place colours and fonts are defined.
   STYLE.md documents the same values; change both together.
   Art direction: bright flat-vector "modern editorial cartoon" under the sea.
   Outlines are deep navy (never black), fills are flat, shading is a
   flat band + halftone dots, highlights are flat light shapes.
   ============================================================ */
var MK = window.MK || (window.MK = {});
(function (K) {
  K.P = {
    ink: "#14204a",        /* every outline and dark type (deep navy, not black) */
    inkSoft: "#3a4a7a",    /* secondary lines, axis ticks */
    cream: "#fff6e6",      /* boards, cards, light type */
    creamShade: "#f3dfc0",
    /* Octo, the market maker */
    octo: "#ff6f91", octoDark: "#d94a74", octoLight: "#ffa3b8", sucker: "#ffd9e1",
    eye: "#ffffff", pupil: "#14204a", glasses: "#ffd23f", glassesDark: "#d9a514", lens: "#c9f1ff",
    blush: "#ff3d6e",
    /* ocean */
    deep: "#0b3d7a", mid: "#1460a8", shallow: "#1f8fd0", surface: "#5cc6ec", foam: "#e8fbff",
    ray: "#b8f0ff",
    /* reef */
    sand: "#ffd89a", sandDark: "#e9b465", coral: "#ff7a59", coralDark: "#d9502f",
    fan: "#b07cff", fanDark: "#7e4fe0", brain: "#ffb340", brainDark: "#e08a10",
    kelp: "#19b39b", kelpDark: "#0d8a77", kelpLight: "#6fe3c8", rock: "#5a6fa8", rockDark: "#3d4f86",
    shell: "#ffe3ec", shellDark: "#f2a7bd", pearl: "#ffffff",
    /* fish traders (one colour per species) */
    fishY: "#ffd23f", fishYDark: "#e0a800", fishT: "#21c7c0", fishTDark: "#0f9690",
    fishO: "#ff9442", fishODark: "#e06a10", fishB: "#5b7cff", fishBDark: "#3a55d6",
    /* data / explainer (semantic) */
    bid: "#1fb5ff", bidDark: "#0b84c6",   /* buy side, demand */
    ask: "#ff5c7a", askDark: "#d93556",   /* sell side, supply */
    up: "#22c58b", upDark: "#12936a",     /* rising candle, gain */
    down: "#ff5c5c", downDark: "#cc3434", /* falling candle, loss */
    sun: "#ffd23f", sunDark: "#e0a800",   /* the spread, the highlight, the key term */
    lilac: "#9b7bff",                     /* volatility, chaos, the attractor */
    jaw: "#3d6bff", teeth: "#ff4f6d", lips: "#22c58b", /* Bill Williams Alligator lines */
    board: "#0e2a5c", boardEdge: "#1f4a8c", chalk: "#f2f8ff", /* dark glass board (formulas, code) */
    grid: "#2c5a9e",
  };
  K.FONT = {
    display: '"Unbounded", "CJK SC", "CJK TC", sans-serif', /* titles, big labels (700/900) */
    text: '"Manrope", "CJK SC", "CJK TC", sans-serif',      /* body, bullets (600/800) */
    mono: '"Roboto Mono", monospace',                       /* numbers, code, tables (500/700) */
    cjk: { "zh-CN": '"Unbounded", "CJK SC", sans-serif', "zh-TW": '"Unbounded", "CJK TC", sans-serif' },
  };
})(MK);
