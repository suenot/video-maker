/* ============================================================
   INTRO 30 OFFICE: the fox's office (4.04 - 7.92, the instrumental).
   4.04 the newspaper spins in (the camera spins and zooms onto it)
   5.0  it lands: headline "A → B" and a lead-lag chart
   5.5  pull back: the fox is reading it behind his desk
   5.97 the paper drops: smirk, hat tip
   6.94 the lens goes up to his eye (giant eye), a blink
   7.42 iris through the lens onto the street
   ============================================================ */
const NP = { x: 760, y: 560, s: 0.78 };
const OFFICE_FOX = { x: 760, y: 1010, s: 1.62 };
const camOffice = K.mkTrack([
  [at(2), { x: NP.x, y: NP.y, z: 0.12, rot: -900 }],
  [at(2, 2), { x: NP.x, y: NP.y, z: 1.6, rot: 0 }],
  [at(2, 3), { x: NP.x, y: NP.y + 10, z: 1.62, rot: 0 }],
  [at(3, 1), { x: 900, y: 540, z: 1.0, rot: 0 }],
  [at(3, 2), { x: 910, y: 530, z: 1.05, rot: 0 }],
  [at(4) - 0.5, { x: 870, y: 440, z: 1.45, rot: 0 }],
  [at(4), { x: 900, y: 420, z: 1.7, rot: 0 }],
]);

function cityOutside(c, t, x, y, w, h) {
  c.fillStyle = P.nightMid; c.fillRect(x, y, w, h);
  K.moon(c, x + w * 0.78, y + 90, 46, 9);
  K.skyline(c, x - 40, x + w + 40, y + h + 40, { seed: 23, tone: "far", hMin: 200, hMax: 420, wMin: 70, wMax: 130, lit: 0.3 });
  K.skyline(c, x - 40, x + w + 40, y + h + 120, { seed: 29, tone: "near", hMin: 220, hMax: 380, wMin: 110, wMax: 180, lit: 0.2 });
  /* rain on the glass, world space inside the window */
  c.save(); c.translate(x, y); K.rain(c, t, { n: 70, w, h, alpha: 0.45, len: 50, seed: 91 }); c.restore();
  const fl = K.flash(t, at(3));
  if (fl > 0) { c.fillStyle = K.rgba(P.moon, 0.6 * fl); c.fillRect(x, y, w, h); }
}

/* front page art (newspaper local space, 600 x 780): masthead bars, headline A → B, chart */
function frontPage(t) {
  return (c) => {
    /* masthead: stars and a heavy rule (no words) */
    for (let i = 0; i < 5; i++) K.text(c, "★", -160 + i * 80, -345, { size: 40, weight: 700, fill: P.ink });
    const hu = ap(t, at(2, 2), 0.35), hs = hu > 0 ? 1 + 0.5 * (1 - K.E.out3(hu)) : 0;
    if (hs > 0) {
      c.save(); c.translate(0, -195); c.scale(hs, hs);
      K.text(c, "A", -170, 0, { size: 170, weight: 700, fill: P.amberDeep, stroke: P.ink, w: 8 });
      K.text(c, "→", 0, 0, { size: 150, weight: 700, fill: P.string, stroke: P.ink, w: 6 });
      K.text(c, "B", 170, 0, { size: 170, weight: 700, fill: P.B, stroke: P.ink, w: 8 });
      c.restore();
    }
    /* the photo: two price lines, B is A two steps later */
    K.shape(c, K.rectPts(-260, -80, 520, 210, 4), { fill: P.greyLight, w: 4, boil: 0.8, seed: 141 });
    const A = [0, 0, 0.2, 0.1, 1, 0.9, 0.6, 0.7, 0.4, 0.5], dr = ap(t, at(2, 2.5), 1.0), n = A.length;
    [[0, P.amberDeep], [2, P.B]].forEach(([lag, col], k) => {
      const pts = [];
      for (let i = 0; i < n; i++) { const v = i - lag >= 0 ? A[i - lag] : 0; if (i / (n - 1) <= dr) pts.push([-230 + i * 51, 100 - v * 150]); }
      if (pts.length > 1) { K.line(c, pts, { stroke: P.ink, w: 11, boil: 0.8, seed: 150 + k, taper: false, gap: 0 }); K.line(c, pts, { stroke: col, w: 6, boil: 0.8, seed: 150 + k, taper: false, gap: 0 }); }
    });
  };
}

function drawOffice(t) {
  const cam = camOffice(t);
  K.begin(ctx, t, cam);
  K.screen(ctx); ctx.fillStyle = P.ink; ctx.fillRect(0, 0, 1920, 1080);
  K.applyCam(ctx, 1);
  /* back wall with faint wallpaper stripes */
  ctx.fillStyle = P.bldg; ctx.fillRect(-600, -400, 3100, 1900);
  for (let x = -600; x < 2500; x += 64) { ctx.fillStyle = K.rgba(P.bldgLight, 0.35); ctx.fillRect(x, -400, 18, 1900); }
  /* framed photo + coat hook on the wall */
  K.shape(ctx, K.rectPts(130, 170, 220, 170, 2), { fill: P.greyDark, w: 6, boil: 1, seed: 160, shade: { color: P.ink, dx: -10, dy: -10 } });
  K.text(ctx, "★", 240, 255, { size: 70, weight: 700, fill: P.brass });
  /* window with blinds: the city outside */
  const open = 0.72 - 0.25 * ap(t, at(3, 2), 0.6);
  K.blindsWindow(ctx, 1160, 110, 560, 600, { open, slats: 12, outside: (c) => cityOutside(c, t, 1160, 110, 560, 600) });
  /* desk lamp + desk */
  const fox = OFFICE_FOX, held = 1 - ap(t, at(3), 0.4);
  K.fox(ctx, fox.x, fox.y, fox.s, foxOfficePose(t, held));
  /* the newspaper in his paws */
  if (held > 0) {
    const drop = (1 - held) * 700, peek = 0;
    const rot = (1 - held) * 0.5;
    K.newspaper(ctx, NP.x, NP.y + drop + peek, NP.s, rot, frontPage(t), 121);
    /* paws over the edges */
    [-1, 1].forEach((sd) => K.shape(ctx, K.ellipsePts(NP.x + sd * 300 * NP.s, NP.y + drop + peek + 40, 22, 26, 10), { fill: P.paw, w: 4, boil: 0.6, seed: 170 + sd }));
  }
  K.desk(ctx, 140, 900, 1640, 91);
  K.deskLamp(ctx, 1500, 880, 1.25, 1, 95);
  /* a coffee cup and a case folder on the desk */
  K.shape(ctx, K.rectPts(1120, 800, 110, 90, 2), { fill: P.greyLight, w: 5, boil: 0.8, seed: 180, shade: { color: P.grey, dx: -14, dy: 0 } });
  K.shape(ctx, [[260, 880], [300, 850], [560, 850], [600, 880]], { fill: "#c7a265", w: 5, boil: 0.8, seed: 181 });
  /* moonlight through the blinds across the whole room, and the lamp */
  K.screen(ctx);
  K.blindLight(ctx, 0, 0, 1920, 1080, { color: P.moonGlow, n: 9, a: 1.1, ang: -0.28, skew: 0.5 });
  /* spin-in darkness */
  const dark = 1 - ap(t, at(2), at(2, 2) - at(2));
  if (dark > 0) {
    ctx.fillStyle = K.rgba(P.ink, 0.75 * dark); ctx.fillRect(0, 0, 1920, 1080);
  }
}

function foxOfficePose(t, held) {
  const tip = ap(t, at(3, 0.5), 0.25) * (1 - ap(t, at(3, 1.5), 0.25));
  const lens = ap(t, at(3, 2) - 0.1, 0.35);
  const peek = 0;
  const st = {
    seed: 720, light: 0.6, squash: 0.06 * K.pulse(t, 1, 6) - 0.2 * ap(t, at(3), 0.15) * (1 - ap(t, at(3) + 0.15, 0.25)),
    blink: K.blinkAt(t, 11), lid: 0.35, mouth: t > at(3) ? "smirk" : "flat", look: peek > 0 ? [-0.6, 0.2] : [0.2, 0],
    hatTip: -16 * tip, hatLift: 18 * tip, tail: Math.sin(t * 2.6), turn: 0.15,
    browTilt: t > at(3) && t < at(3, 2) ? 0.6 : 0,
  };
  if (held > 0) { st.pawL = { x: -170, y: -280 }; st.pawR = { x: 170, y: -280 }; }
  else {
    st.pawL = tip > 0 ? { x: -60, y: -380 } : { x: -110, y: -170 };
    st.pawR = { x: K.lerp(130, 112, lens), y: K.lerp(-160, -246, lens), rot: K.lerp(-50, -150, lens) };
    st.hold = "magnifier";
    st.lensEye = lens;
    st.blink = lens > 0.5 ? Math.max(K.blinkAt(t, 11), Math.sin(K.inv(at(3, 3), at(3, 3) + 0.2, t) * Math.PI)) : st.blink;
    st.look = lens > 0.5 ? [Math.sin(t * 2) * 0.6, 0] : [0.3, -0.2];
  }
  return st;
}
