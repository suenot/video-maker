/* ============================================================
   KIT 05 PALETTE + TYPE (Surf Turtle kit): the only place colours and
   fonts are defined. STYLE.md documents the same values; change both.
   60s surf-poster / tiki print: warm sunset bands, turquoise water,
   sand, deep-teal ink. Two regimes recolour the world: calm and storm.
   ============================================================ */
var VK = window.VK || (window.VK = {});
(function (K) {
  K.P = {
    ink: "#16323a",        /* every outline and dark type: deep teal, never black */
    inkSoft: "#2f5a5c",    /* halftone dots, secondary lines */
    cream: "#fbeed3",      /* poster paper, light type, boards' paint */
    creamShade: "#ecd3a6",
    /* sunset (calm regime sky, top to horizon) */
    sky0: "#e8566a", sky1: "#f27d58", sky2: "#f7a24c", sky3: "#f9c562", sky4: "#fde3a0",
    sun: "#ffd86b", sunRing: "#ffb84d",
    /* storm regime sky */
    storm0: "#3b3561", storm1: "#54497a", storm2: "#6f5f8f", storm3: "#8f7aa0", storm4: "#b59bab",
    cloud: "#fff3dc", cloudShade: "#f5c99a", stormCloud: "#6c6a8f", stormCloudShade: "#4a4870",
    /* ocean */
    seaLight: "#7fd8cf", sea: "#2bb0a8", seaMid: "#1d8d8e", seaDeep: "#145a63", seaNight: "#0f4250", foam: "#fff6e2",
    stormSea: "#2d6d7a", stormDeep: "#183f4f",
    /* beach + land */
    sand: "#f2c98a", sandDark: "#d9a35f", sandWet: "#c99a62", rock: "#8a6a5a", rockDark: "#5e463c",
    palm: "#2f8a5e", palmDark: "#1f6446", trunk: "#9a6a3c",
    /* hero: Siggy the surfer sea turtle */
    skin: "#7cc49a", skinDark: "#4f9a78", skinLight: "#b3e2c0", belly: "#f3dca0",
    shell: "#b5763a", shellDark: "#8a5427", shellLight: "#e0a65c", scute: "#d9a05a",
    shades: "#16323a", shadesFrame: "#f2675a", shadesShine: "#7fd8cf", cheek: "#f59a8a",
    eye: "#fffaf0", pupil: "#142a30",
    /* surfboards + tiki wood */
    board: "#fbeed3", boardStripe: "#f2675a", boardStripe2: "#2bb0a8",
    wood: "#a8693a", woodDark: "#6e4224", woodLight: "#cf9256", woodNight: "#4a2c18",
    /* lighthouse */
    light: "#fbeed3", lightRed: "#e8566a", lightRoof: "#16323a",
    beamCalm: "#9ff0e2", beamStorm: "#ff7a5c",
    /* data / explainer */
    calm: "#2bb0a8",        /* calm regime (turquoise) */
    storm: "#e8566a",       /* storm regime (coral) */
    sigma: "#f6b93b",       /* volatility line, sigma, the forecast (mustard) */
    sigmaGlow: "#ffe7a3",
    up: "#3a9a5b", down: "#d9483b",
    chalk: "#fbeed3", slate: "#24434a", slateEdge: "#3a6266",
    /* accent set for categorical series (episodes) */
    A: ["#2bb0a8", "#e8566a", "#f6b93b", "#7a6bb0", "#f27d58", "#3a9a5b"],
  };
  K.FONT = {
    script: '"Lobster", "CJK SC", "CJK TC", cursive',          /* poster title, accent words */
    display: '"Nunito", "CJK SC", "CJK TC", sans-serif',        /* labels, headings (800/900) */
    text: '"Nunito", "CJK SC", "CJK TC", sans-serif',           /* body (600) */
    mono: '"Fira Mono", "Nunito", monospace',                   /* numbers, formulas, code, tables */
    cjk: { "zh-CN": '"CJK SC", "Nunito", sans-serif', "zh-TW": '"CJK TC", "Nunito", sans-serif' },
  };
  /* mix two hex colours (u = 0 -> a, 1 -> b) */
  K.mix = function (a, b, u) {
    const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
    const A = p(a), B = p(b), c = A.map((v, i) => Math.round(v + (B[i] - v) * Math.max(0, Math.min(1, u))));
    return "#" + c.map((v) => v.toString(16).padStart(2, "0")).join("");
  };
  /* regime blend: storm = 0 calm .. 1 storm */
  K.reg = (calmCol, stormCol, storm) => K.mix(calmCol, stormCol, storm);
})(VK);
