/* ============================================================
   KIT 05 PALETTE + TYPE: the only place colours and fonts are defined.
   STYLE.md documents the same values; change both together.
   World: a neon 80s trading floor at night, run by robots.
   ============================================================ */
var AK = window.AK || (window.AK = {});
(function (K) {
  K.P = {
    ink: "#0b0e2b",        /* all outlines: deep navy, never black */
    inkSoft: "#262d66",    /* panel seams, secondary lines */
    /* room */
    night: "#07081c", wall: "#141842", wallDark: "#0d1033", wallLight: "#1f2560",
    floor: "#100f33", floorFar: "#1a1450",
    /* neon (light sources only; they glow) */
    pink: "#ff3fa4", pinkDeep: "#c41f7a", cyan: "#36e6ff", cyanDeep: "#1497c2",
    violet: "#9b5cff", yellow: "#ffe14d", green: "#39ff9a", orange: "#ff8a3d",
    /* skyline window (synthwave sun) */
    skyTop: "#1b1050", skyMid: "#5a1f7a", skyLow: "#ff6f91", sunTop: "#ffe14d", sunLow: "#ff3fa4",
    /* robot plastics */
    shell: "#e9ebff", shellShade: "#a3a8dc", shellDark: "#5d63a6",
    screen: "#04161f", screenShade: "#0a2a36", phosphor: "#5dffd8", phosphorDim: "#1d7f74",
    metal: "#7c84b8", metalDark: "#454c85", rubber: "#2a2f63",
    /* team bots */
    analyst: "#3fd0ff", analystDark: "#1f86b8",
    risk: "#ffb238", riskDark: "#c97a12",
    trader: "#ff5fae", traderDark: "#c42b7f",
    /* data */
    gain: "#39ff9a", loss: "#ff4d6d", profit: "#ffe14d",
    paper: "#fff4dc", paperShade: "#e8cfa0", /* order tickets only */
    term: "#03120f", termEdge: "#1d3a52", /* terminal glass */
    holo: "#36e6ff",
    /* tickers: one colour per asset */
    AAPL: "#d9dcf2", NVDA: "#7cff4f", BTC: "#ff9f2e", ETH: "#8f95ff", TSLA: "#ff4d6d", SPY: "#36e6ff", MSFT: "#ffd34d",
  };
  K.FONT = {
    display: '"Russo One", "CJK SC", "CJK TC", sans-serif',   /* titles, big labels (400 only) */
    text: '"Exo 2", "CJK SC", "CJK TC", sans-serif',          /* labels, notes (500/800) */
    mono: '"IBM Plex Mono", monospace',                       /* code, tables (500/700) */
    pixel: '"Press Start 2P", monospace',                     /* LED tags, tickers (400) */
    cjk: { "zh-CN": '"CJK SC", "Russo One", sans-serif', "zh-TW": '"CJK TC", "Russo One", sans-serif' },
  };
})(AK);
