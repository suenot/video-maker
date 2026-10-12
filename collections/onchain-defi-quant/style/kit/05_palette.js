/* ============================================================
   KIT 05 PALETTE + TYPE: the only place colours and fonts are defined.
   STYLE.md documents the same values; change both together.
   1950s diner comic: cherry red + mint + cream, chrome, black-and-white
   checkerboard, mustard for money. Black plate is a warm near-black.
   ============================================================ */
var DK = window.DK || (window.DK = {});
(function (K) {
  K.P = {
    ink: "#1a1216",        /* black plate: all outlines and dark type */
    inkSoft: "#4a3a40",    /* secondary lines, dot screens */
    cream: "#fbf1dc",      /* menus, tickets, cream type */
    creamShade: "#ecd9b4",
    /* diner */
    cherry: "#e23a3f", cherryDark: "#a8222c", cherryLight: "#ff7a74",
    mint: "#8fd8c0", mintDark: "#4fa995", mintLight: "#c6efe2",
    chrome: "#c9d3d8", chromeDark: "#7d8b93", chromeLight: "#f4f8fa",
    checkA: "#f7efe0", checkB: "#1f1a1d",          /* floor tiles */
    wall: "#f4dcc0", wallShade: "#e3c39f",         /* back wall */
    teal: "#2f8f8a", tealDark: "#1d625f",          /* wainscot, booth vinyl */
    night: "#22324a", nightDark: "#141f31",        /* the dark mempool corner */
    mustard: "#ffc42e", mustardDark: "#cf8f0a",    /* money, gains, the order bell */
    /* hamster */
    fur: "#e8a25e", furDark: "#b56f33", furLight: "#f7c993", belly: "#fbe3c2",
    eye: "#fffdf6", pupil: "#14100f", nose: "#f07f8a", cheek: "#ff9e9a",
    toque: "#fffdf8", toqueShade: "#d9dde2",
    /* bee waitress (co-host) */
    bee: "#ffcf3d", beeDark: "#d99a12", beeLight: "#ffe590", wing: "rgba(246,253,252,0.86)", wingEdge: "#2f8f8a",
    /* sandwich bot */
    bread: "#e9b56a", breadDark: "#b77c35", crust: "#8c5424", botMetal: "#5d6b73", botEye: "#ff4b4b",
    lettuce: "#7cc252", tomato: "#e8473f", cheese: "#ffcf4a",
    /* data / explainer */
    route: "#fffaf0",       /* a plain chain link / edge */
    profit: "#ffc42e",      /* gains, winning path (mustard) */
    profitGlow: "#fff0b0",
    loss: "#e23a3f",        /* losses, negative numbers (cherry) */
    gain: "#2d8a5a",        /* gain text on cream */
    bid: "#2d8a5a", ask: "#d1343b",
    chalk: "#f6f3ea",       /* type on the chalk menu board */
    board: "#25302d",       /* chalk menu board (formula, code) */
    boardEdge: "#3a2a22",
    neonPink: "#ff5d8f", neonMint: "#6ff5d2", neonGlow: "rgba(255,93,143,0.9)",
    /* assets: one colour per token */
    ETH: "#7b83eb", USDC: "#2775ca", WBTC: "#f39b2c", DAI: "#f4b731", SOL: "#a25ddc", UNI: "#ff4fa0", LINK: "#2a5ada",
  };
  K.FONT = {
    script: '"Lobster", "CJK SC", "CJK TC", cursive',          /* diner sign script: titles */
    display: '"Nunito", "CJK SC", "CJK TC", sans-serif',       /* labels, headers (800/900) */
    text: '"Nunito", "CJK SC", "CJK TC", sans-serif',          /* body (600) */
    mono: '"Anonymous Pro", monospace',                         /* tickets, numbers, code, tables */
    cjk: { "zh-CN": '"Nunito", "CJK SC", sans-serif', "zh-TW": '"Nunito", "CJK TC", sans-serif' },
  };
})(DK);
