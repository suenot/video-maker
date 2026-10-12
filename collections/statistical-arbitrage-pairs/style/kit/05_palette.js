/* ============================================================
   VAUDEVILLE KIT 05 PALETTE + TYPE: the only place colours and fonts live.
   A black-and-white 1920s cartoon: everything is a grey of silver
   nitrate film, and exactly ONE accent exists: gold = money, the
   z-score and the winning trade. STYLE.md documents the same values.
   ============================================================ */
var VK = window.VK || (window.VK = {});
(function (K) {
  K.P = {
    /* the grey ladder (warm silver, never pure #000 / #fff) */
    ink: "#141312",        /* outlines, black fur, penguin backs */
    g1: "#2b2926",         /* deep shadow, stage black */
    g2: "#4a4743",         /* dark grey: curtains in shadow, piano */
    g3: "#6e6a64",         /* mid grey: floor, drapes */
    g4: "#9a958d",         /* light grey: backdrop, metal */
    g5: "#c8c3b8",         /* pale grey: paper shade, muzzle shade */
    paper: "#ece7da",      /* "white": gloves, bellies, cards, type on dark */
    shine: "#fbf8f0",      /* specular highlights on black shapes */
    /* the one accent */
    gold: "#e9b43a", goldLight: "#ffd76a", goldDark: "#a77818", goldGlow: "#fff0b8",
    /* data meaning (still inside the grey world: only gold is a hue) */
    rich: "#2b2926",       /* the expensive leg: dark */
    cheap: "#ece7da",      /* the cheap leg: light */
  };
  K.FONT = {
    display: '"Playfair Display", "CJK SC", "CJK TC", serif',   /* marquee titles, act names (700/900) */
    label: '"Oswald", "CJK SC", "CJK TC", sans-serif',          /* labels, bullets, notices (500/700) */
    mono: '"IBM Plex Mono", monospace',                         /* numbers, z-scores, tables, code */
    cjk: { "zh-CN": '"Playfair Display", "CJK SC", serif', "zh-TW": '"Playfair Display", "CJK TC", serif' },
  };
})(VK);
