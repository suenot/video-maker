/* ============================================================
   KIT 05 PALETTE + TYPE: the only place colours and fonts are defined.
   STYLE.md documents the same values; change both together.
   ============================================================ */
var CK = window.CK || (window.CK = {});
(function (K) {
  K.P = {
    ink: "#2b1d16",        /* all outlines and dark type */
    inkSoft: "#5a4334",    /* hatching, secondary lines */
    paper: "#f6e8c8",      /* parchment boards, banner, cream type */
    paperShade: "#e2cc9c",
    /* crab */
    rust: "#e0632a", rustDark: "#a8401c", rustLight: "#f79a5c", belly: "#f6b57e",
    eye: "#fffaf0", pupil: "#1d130e",
    capNavy: "#26364f", capNavyDark: "#17223a", gold: "#ffc53d", goldDark: "#c98a12",
    /* ship */
    iron: "#526777", ironDark: "#33424f", ironLight: "#7f96a6", rivet: "#c9d6dd",
    wood: "#9a6236", woodDark: "#6b3f22", sail: "#f3e6c6", sailShade: "#d9c59a", waterline: "#c2412a",
    /* sea + sky */
    skyTop: "#6fc0d6", skyMid: "#a9dcdc", skyLow: "#fde6b3", sun: "#ffd166", sunGlow: "#fff2c2",
    cloud: "#fffaf0", cloudShade: "#d7ecec",
    seaFar: "#5fb3c4", seaMid: "#2f8fa8", seaDeep: "#1d6a86", seaNight: "#16506a", foam: "#f7f3e6",
    /* land */
    sand: "#f2d38d", sandDark: "#d4ac5e", grass: "#73b351", grassDark: "#4c8a39", rock: "#9a8a78", palm: "#3f8a3a", trunk: "#8a5a32",
    /* parrot (first mate, host B) */
    parrot: "#5fbf4a", parrotDark: "#3c8a33", parrotLight: "#9ad97a", parrotWing: "#2f7fc0", parrotWingDark: "#1f5a8c",
    parrotBelly: "#ffe08a", beak: "#efe2c0", beakDark: "#c9b98e", crest: "#f79a5c",
    /* data / explainer */
    route: "#fff7e0",       /* a plain graph edge (rope) */
    profit: "#ffc93c",      /* the winning cycle, gains */
    profitGlow: "#fff1a8",
    loss: "#d64545",        /* losing edges, negative numbers */
    chalk: "#f6f1e3",       /* type on dark boards */
    board: "#3b2b22",       /* dark wooden board (formula, code) */
    boardEdge: "#5b4232",
    /* assets: one colour per currency island */
    BTC: "#f39b2c", ETH: "#7b83eb", USDT: "#26a17b", SOL: "#a25ddc", EUR: "#3a6ea5", BNB: "#e8b923", USD: "#5b9b4a",
  };
  K.FONT = {
    display: '"Rubik", "CJK SC", "CJK TC", sans-serif',  /* titles, labels (weights 800/900) */
    text: '"Rubik", "CJK SC", "CJK TC", sans-serif',     /* body, numbers (500) */
    mono: '"JetBrains Mono", monospace',                 /* code, tables of numbers */
    cjk: { "zh-CN": '"CJK SC", "Rubik", sans-serif', "zh-TW": '"CJK TC", "Rubik", sans-serif' },
  };
})(CK);
