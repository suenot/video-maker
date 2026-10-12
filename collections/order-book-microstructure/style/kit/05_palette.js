/* ============================================================
   KIT 05 PALETTE + TYPE: the only place colours and fonts are defined.
   Folk-print bazaar: terracotta, saffron and teal on cream paper, with an
   aubergine-black woodcut ink. STYLE.md documents the same values; change
   both together.
   ============================================================ */
var BK = window.BK || (window.BK = {});
(function (K) {
  K.P = {
    ink: "#1f1720",          /* woodcut ink: every outline, dark type */
    inkSoft: "#4a3340",      /* gouge marks, secondary lines */
    paper: "#f3e3c3",        /* print paper, boards, cream type */
    paperShade: "#dcc39a",
    /* the three folk colours */
    terra: "#c4583a", terraDark: "#8f3a26", terraLight: "#e08a64",
    saffron: "#f0a830", saffronDark: "#c47b12", saffronLight: "#f8cf7a",
    teal: "#1f7a74", tealDark: "#13504c", tealLight: "#4fa69c",
    indigo: "#2e3a6e", indigoDark: "#1d2650",
    /* order book sides */
    bid: "#2f9460", bidDark: "#1f6a43", bidLight: "#8fd0a0",   /* buyers: green awnings, below */
    ask: "#c23b32", askDark: "#8a2420", askLight: "#f08e7c",   /* sellers: red awnings, above */
    /* raccoon */
    fur: "#8c8597", furDark: "#5d566a", furLight: "#c9c3cf", mask: "#2a2230", muzzle: "#f6efe4",
    eye: "#fffaf0", pupil: "#1a1218", nose: "#1f1720", cheek: "#e7867a", mouthIn: "#7a2433",
    fez: "#a82a3a", fezDark: "#6f1726", tassel: "#1f1720",
    vest: "#1f7a74", vestTrim: "#f0a830",
    /* materials */
    wood: "#a8693a", woodDark: "#6e4123", woodLight: "#cf9460",
    brass: "#d9a441", brassDark: "#9c6f1e",
    plaster: "#ead2a6", plasterShade: "#d1b07c",
    tile: "#f4f1ea", cobalt: "#2a4fa0", cobaltLight: "#7f9bd6",
    crate: "#c98d4e", crateDark: "#8e5a2a", crateLight: "#e8b47a",
    /* sky + city */
    skyTop: "#e9a94f", skyMid: "#f3c777", skyLow: "#f8e2b0", sun: "#f6d36a",
    cityFar: "#d99a6c", cityMid: "#2f7f78", cityNear: "#b65a3c",
    /* data */
    gold: "#e9b63c", goldDark: "#a8781a", goldGlow: "#fff0b0",
    up: "#2f9460", down: "#c23b32",
    board: "#24323a", chalk: "#f4efe2",
  };
  K.FONT = {
    display: '"Yeseva One", "CJK SC", "CJK TC", serif',                  /* titles, big stamped words */
    label: '"Fira Sans Condensed", "CJK SC", "CJK TC", sans-serif',     /* labels, numbers on signs (600 / 800) */
    mono: '"PT Mono", monospace',                                        /* code, tables of numbers */
    cjk: { "zh-CN": '"Yeseva One", "CJK SC", serif', "zh-TW": '"Yeseva One", "CJK TC", serif' },
  };
})(BK);
