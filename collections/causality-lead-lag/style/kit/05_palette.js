/* ============================================================
   KIT 05 PALETTE + TYPE: the only place colours and fonts are defined.
   STYLE.md documents the same values; change both together.
   Film noir: indigo night, ink-black shadows, cool greys, and ONE warm
   family (amber lamp light = clues, the leader, the answer). Red is only
   the evidence string (a causal link).
   ============================================================ */
var CK = window.CK || (window.CK = {});
(function (K) {
  K.P = {
    ink: "#0b0a12",        /* all outlines, solid noir shadows */
    inkSoft: "#2a2840",    /* secondary lines, dry-brush hatching */
    paper: "#ece6d4",      /* case files, photos, tags (cool aged paper) */
    paperShade: "#c7bea6",
    /* night + city */
    night: "#0f1024", nightMid: "#1b1d3d", nightLow: "#2e3262", moon: "#e8ebf5", moonGlow: "#9fa8d8",
    cloud: "#2a2d55", cloudLight: "#454a80",
    brick: "#2b2840", brickDark: "#1a1829", brickLine: "#3c3858",
    bldg: "#1d1f38", bldgDark: "#121326", bldgLight: "#33375e",
    street: "#171930", streetLight: "#262a4c", curb: "#3a3e66", puddle: "#353c74",
    rain: "#aab4e6", fog: "#5d6494",
    grey: "#8b8fa8", greyLight: "#c4c7d8", greyDark: "#55597a",
    /* the warm accent: lamp light, clues, the leader */
    amber: "#ffb43f", amberDeep: "#d8801a", amberGlow: "#ffe3a0", amberDim: "#9a5c1c",
    /* the fox */
    fur: "#d9823f", furDark: "#8f4824", furLight: "#f0a868", cream: "#f2e8d2", creamShade: "#c9b99a",
    nose: "#141018", eye: "#f7f3e6", iris: "#ffb43f", pupil: "#0b0a12",
    coat: "#8d8062", coatDark: "#5b5240", coatLight: "#b1a47f", belt: "#4a4233",
    hat: "#34354a", hatDark: "#1c1c2a", hatBand: "#0b0a12",
    trousers: "#2a2b3e", shoe: "#0b0a12", paw: "#2a1a14",
    brass: "#c9a24a", brassDark: "#8a6a24", glass: "#bcd3e6",
    /* evidence */
    string: "#d23a3c", stringDark: "#8a1e24",
    cork: "#8a6a48", corkDark: "#5e4630", corkLight: "#a8855c",
    chalk: "#eef0f6", board: "#1e2a26", boardEdge: "#3b3328",
    good: "#8fd18f",       /* test passed (check marks) */
    bad: "#e05a5a",        /* test failed, spurious link */
    /* suspects: A leads (amber family), B lags (cool), Z is the hidden confounder */
    A: "#ffb43f", B: "#7fb6d0", C: "#a7c48a", D: "#d99ab8", Z: "#9d86d6",
    BTC: "#f7a23a", ETH: "#8a93f0",
    /* the sidekick: Sergeant Basset (host B), a basset hound in a navy police coat */
    hound: "#c08a56", houndDark: "#7a4f2c", houndLight: "#dcae7c", houndEar: "#5e3a22", houndEarDark: "#3e2516",
    uniform: "#2f3d66", uniformDark: "#1d2645", uniformLight: "#46578a",
    mouthIn: "#4a1418", tongue: "#d9686a",
  };
  K.FONT = {
    display: '"Yanone Kaffeesatz", "CJK SC", "CJK TC", sans-serif', /* titles, labels (500 / 700) */
    text: '"Yanone Kaffeesatz", "CJK SC", "CJK TC", sans-serif',
    mono: '"Cousine", monospace',                                   /* typewriter: numbers, code, tables (400 / 700) */
    cjk: { "zh-CN": '"Yanone Kaffeesatz", "CJK SC", serif', "zh-TW": '"Yanone Kaffeesatz", "CJK TC", serif' },
  };
})(CK);
