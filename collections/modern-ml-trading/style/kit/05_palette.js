/* ============================================================
   LAB KIT 05 PALETTE + TYPE: the only place colours and fonts are defined.
   STYLE.md documents the same values; change both together.
   World: a 1930s alchemy greenhouse lab. Warm sepia paper, bottle-green
   ink, brass, green glass, oxblood accents. No blue sky, no orange hero.
   ============================================================ */
var LK = window.LK || (window.LK = {});
(function (K) {
  K.P = {
    ink: "#1f2620",        /* all outlines: bottle-green black, never pure black */
    inkSoft: "#4a5446",    /* stipple, secondary lines */
    paper: "#f4e9d0",      /* cards, plates, cream type */
    paperShade: "#dcc9a2",
    sepia: "#c9a874",      /* sepia wash, wall shadow */
    /* walls + furniture */
    wall: "#e3cf9f", wallDark: "#c7ae7a", wallLine: "#b89a62",
    wood: "#8b5a34", woodDark: "#5e3a20", woodLight: "#b07a4a",
    floor: "#6e4a2c",
    /* brass + copper (frames, gauges, pipes) */
    brass: "#c9963a", brassDark: "#8a6322", brassLight: "#f0cf7a", copper: "#b8643a",
    /* green glass, the hero material (flasks, greenhouse panes) */
    glass: "#8fcfb0", glassDark: "#4f9a7a", glassDeep: "#2f6b56", glassHi: "#e6fff2",
    pane: "#cfe3c4", paneDark: "#9fc4a4",
    /* plants */
    leaf: "#5c9a3c", leafDark: "#3c6e28", leafLight: "#9ccc6a", stem: "#4c7a2e",
    pot: "#b5603a", potDark: "#7e3c22", soil: "#4a3020",
    /* the owl: Professor Strix */
    owl: "#8a5d3b", owlDark: "#5f3c24", owlLight: "#b8875c", disc: "#ecd3a8", discDark: "#d1b07a",
    coat: "#f7f1e2", coatShade: "#d9cfb6", glove: "#fffdf6", gloveShade: "#ddd5c2",
    beak: "#e8a33a", beakDark: "#b0721c", feet: "#e8a33a",
    eye: "#fffdf4", pupil: "#141a15", blush: "#e8907a",
    /* the hummingbird: Pico */
    hum: "#3f9a6e", humDark: "#2a6b4c", humLight: "#8fd6a8", gorget: "#b8323a",
    /* data meaning */
    train: "#5c9a3c",      /* in-sample, training fold */
    test: "#e0a33a",       /* out-of-sample, test fold */
    good: "#3f8f4e",       /* validated, gain */
    bad: "#a8322c",        /* overfit, loss (oxblood) */
    band: "#8fcfb0",       /* uncertainty band fill */
    data: "#2f6b56",       /* data points */
    chalk: "#eef0e2", board: "#24332b", boardEdge: "#3c4f43",
    glow: "rgba(255,236,170,0.95)",
  };
  K.FONT = {
    display: '"Oswald", "CJK SC", "CJK TC", sans-serif',      /* titles, signs (600/700), art-deco condensed */
    text: '"Alegreya Sans", "CJK SC", "CJK TC", sans-serif',  /* labels, notes (500/800) */
    mono: '"IBM Plex Mono", monospace',                        /* numbers, code, tables (500/600) */
    cjk: { "zh-CN": '"Oswald", "CJK SC", serif', "zh-TW": '"Oswald", "CJK TC", serif' },
  };
})(LK);
