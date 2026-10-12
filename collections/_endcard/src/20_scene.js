/* ============================================================
   ENDCARD 20 SCENE: layout, drawing and the timeline.
   One canvas, drawn as a pure function of t by the shared Coral Exchange
   kit (collections/marketmaker-general/style/kit). 1920 x 1080, 19 s.

   Layout (screen px):
     header      y  40-130  logo + "marketmaker.cc"; on the right the two
                            websites as big pills (www.marketmaker.cc, www.listingapis.com)
     headline    y 150-240  cream banner, localized (variable `lang`)
     channels    x  40-1110 four YouTube signs held by Otto the octopus,
                            the sign for `lang` is sun-yellow and bobs
     YouTube     x 1150-1880 two calm slots for the end-screen elements:
                            NEXT  video 640 x 360 at (1190, 290)
                            SUB   subscribe circle r 116 at (1510, 770)
                            nothing moves inside or over them after 2.4 s
     contacts    y 900-1056 cream panel, eight chips in two rows
   Story: 0-0.9 ink cloud clears; 0.2-2.6 everything pops in;
   2.6-18.1 idle (waves, blinks, bobbing sign, fish); 18.1-19 fade out.
   ============================================================ */
const K = MK, P = K.P;
const DUR = 19.0;
const cv = document.getElementById("cv"), ctx = cv.getContext("2d");
const ap = (t, t0, d) => K.inv(t0, t0 + (d || 0.4), t);   /* appear 0..1 from t0 */

/* ---------- variables ---------- */
const VARS = Object.assign({ lang: "en" },
  (window.__hyperframes && window.__hyperframes.getVariables && window.__hyperframes.getVariables()) || {});
const LANG = COPY[VARS.lang] ? VARS.lang : "en";
const T = COPY[LANG];
const CJK = { "zh-CN": '"EC SC"', "zh-TW": '"EC TC"' };
const cjkFor = (lang) => CJK[lang] || '"EC SC"';
const FT = (lang) => `"Manrope", ${cjkFor(lang)}, sans-serif`;      /* body text */
const FD = (lang) => `"Unbounded", ${cjkFor(lang)}, sans-serif`;    /* display */

/* ---------- layout ---------- */
const SIGN_W = 440, SIGN_H = 134;
const SIGNS = [
  { x: 40, y: 292, side: -1 }, { x: 670, y: 292, side: 1 },
  { x: 40, y: 468, side: -1 }, { x: 670, y: 468, side: 1 },
];
const NEXT = { x: 1190, y: 290, w: 640, h: 360 };
const SUB = { x: 1510, y: 770, r: 116 };
const PANEL = { x: 40, y: 900, w: 1840, h: 156 };
const OCTO = { x: 575, y: 884, s: 0.74 };
const HI = CHANNELS.findIndex((c) => c.lang === LANG);

/* ---------- small drawing helpers ---------- */
const pathCache = {};
const path = (d) => pathCache[d] || (pathCache[d] = new Path2D(d));
/* fit a string into maxW by shrinking the size, never below minSize */
function fitSize(str, size, weight, font, maxW, minSize) {
  const w = K.textW(ctx, str, size, weight, font);
  return w <= maxW ? size : Math.max(minSize || 32, Math.floor(size * maxW / w));
}
/* a 24 x 24 glyph on a coloured disc */
function glyph(x, y, r, name, color, a) {
  const g = ICON[name];
  K.shape(ctx, K.ellipsePts(x, y, r, r, 16), { fill: P[color], w: 4, boil: 0.35, seed: 900 + name.length * 7, alpha: a });
  ctx.save(); ctx.globalAlpha *= a == null ? 1 : a;
  const k = (r * 1.25) / 24;
  ctx.translate(x - 12 * k, y - 12 * k); ctx.scale(k, k);
  ctx.strokeStyle = P.cream; ctx.fillStyle = P.cream; ctx.lineWidth = 2.3; ctx.lineJoin = "round"; ctx.lineCap = "round";
  if (g.s) ctx.stroke(path(g.s));
  if (g.f) ctx.fill(path(g.f));
  ctx.restore();
}
/* generic play-button glyph (rounded coral box + white triangle) */
function playGlyph(x, y, w, a) {
  const h = w * 0.7;
  K.shape(ctx, K.rrectPts(x - w / 2, y - h / 2, w, h, h * 0.3, 3), { fill: P.ask, w: 4, boil: 0.35, seed: 931, alpha: a });
  K.shape(ctx, [[x - w * 0.13, y - h * 0.25], [x + w * 0.2, y], [x - w * 0.13, y + h * 0.25]], { fill: "#ffffff", stroke: null, w: 0, boil: 0.2, seed: 932, sharp: true, alpha: a });
}
function logo(x, y, size, color) {
  ctx.save(); ctx.translate(x, y); ctx.scale(size / 1024, size / 1024); ctx.translate(0, 1024); ctx.scale(0.1, -0.1);
  ctx.fillStyle = color; ctx.fill(path(LOGO_D)); ctx.restore();
}
/* pop: scale around a pivot with a back ease */
function pop(a, px, py, fn) {
  if (a <= 0) return;
  const s = a >= 1 ? 1 : K.E.back(a, 2.0);
  ctx.save(); ctx.translate(px, py); ctx.scale(s, s); ctx.translate(-px, -py);
  ctx.globalAlpha *= K.clamp(a * 3, 0, 1); fn(); ctx.restore();
}

/* ---------- sign geometry over time (the highlighted sign bobs) ---------- */
function signAt(i, t) {
  const S = SIGNS[i], hi = i === HI;
  const bob = hi ? 9 * Math.sin((t - 2.6) * 2.4) * K.ss(2.4, 3.2, t) : 3 * Math.sin(t * 1.3 + i * 1.7);
  const tilt = hi ? 0.015 * Math.sin((t - 2.6) * 1.2) : 0;
  return { x: S.x, y: S.y + bob, tilt, side: S.side, a: ap(t, 0.8 + i * 0.14, 0.5) };
}
/* where Otto's arm ends: hidden just behind the edge facing him */
const grip = (g) => [g.side < 0 ? g.x + SIGN_W - 44 : g.x + 44, g.y + SIGN_H * 0.6];

function drawSign(i, t) {
  const c = CHANNELS[i], g = signAt(i, t), hi = i === HI;
  const cx = g.x + SIGN_W / 2, cy = g.y + SIGN_H / 2;
  pop(g.a, cx, cy + 40, () => {
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(g.tilt); ctx.translate(-cx, -cy);
    K.shape(ctx, K.rrectPts(g.x, g.y, SIGN_W, SIGN_H, 26, 3), {
      fill: hi ? P.sun : P.cream, w: hi ? 6 : 5, boil: 0.5, seed: 400 + i * 11,
      shade: { color: hi ? P.sunDark : P.creamShade, dx: 0, dy: -10 }, drop: { dx: 0, dy: 10 },
    });
    /* language tab on the top edge */
    const lw = K.textW(ctx, c.label, 32, 800, FT(c.lang)) + 40, tx = g.x + 22, ty = g.y - 24;
    K.shape(ctx, K.rrectPts(tx, ty, lw, 46, 23, 3), { fill: hi ? P.ask : P.ink, w: 4, boil: 0.4, seed: 450 + i * 5 });
    K.text(ctx, c.label, tx + lw / 2, ty + 24, { size: 32, weight: 800, font: FT(c.lang), fill: "#ffffff" });
    /* row 1: play glyph + youtube.com/ */
    playGlyph(g.x + 44, g.y + 52, 46);
    K.text(ctx, "youtube.com/", g.x + 80, g.y + 52, { size: 32, weight: 600, font: FT("en"), fill: hi ? P.ink : P.inkSoft, align: "left" });
    /* row 2: the handle, as large as fits */
    const hs = fitSize(c.handle, 40, 800, FT("en"), SIGN_W - 44, 32);
    K.text(ctx, c.handle, g.x + 22, g.y + 102, { size: hs, weight: 800, font: FT("en"), align: "left" });
    ctx.restore();
  });
  if (hi && g.a >= 1) {
    const sp = (t - 2.6) % 3.2;
    K.sparkle(ctx, g.x + SIGN_W - 14, g.y + 4, 22 * Math.sin(K.clamp(sp / 0.7, 0, 1) * Math.PI), 1, 77);
    K.sparkle(ctx, g.x + 18, g.y + SIGN_H - 6, 15 * Math.sin(K.clamp((sp - 0.35) / 0.6, 0, 1) * Math.PI), 1, 78);
  }
}

/* ---------- Otto: four arms hold the signs, two wave, two rest ---------- */
const HOLD = { 2: 0, 1: 2, 5: 1, 6: 3 };   /* arm index -> sign index */
function octoPose(t) {
  const rise = K.E.back(ap(t, 0.3, 0.7), 1.6), y = OCTO.y + (1 - rise) * 430;
  const toLocal = (p) => [(p[0] - OCTO.x) / OCTO.s, (p[1] - y) / OCTO.s];
  const arms = [];
  for (let i = 0; i < 8; i++) {
    if (HOLD[i] != null) {
      const g = signAt(HOLD[i], t), q = toLocal(grip(g)), u = K.E.out3(ap(t, 0.8 + HOLD[i] * 0.14, 0.5));
      const rest = K.OCTO_REST[i];
      arms[i] = u <= 0 ? null : { x: K.lerp(rest[0], q[0], u), y: K.lerp(rest[1], q[1], u), bend: (i < 4 ? -1 : 1) * 26, curl: 0 };
    } else if (i === 0 || i === 7) {
      /* waves: an envelope of hello-bursts, the outer arms swing up and out */
      const sd = i === 0 ? -1 : 1;
      const burst = Math.max(K.ss(1.6, 2.2, t) * (1 - K.ss(4.4, 5.0, t)), K.ss(8.6, 9.1, t) * (1 - K.ss(10.6, 11.2, t)), K.ss(14.4, 14.9, t) * (1 - K.ss(16.4, 17.0, t)));
      const sw = Math.sin(t * 7.0 + (sd > 0 ? 0 : 1.2));
      arms[i] = { x: sd * (318 + 26 * burst * sw), y: K.lerp(-60, -330 - 40 * sw, burst), bend: sd * (30 - 40 * burst), curl: sd * (1.4 + 0.8 * burst * sw) };
    } else arms[i] = null;
  }
  const lookTo = HI < 0 ? [0, 0] : [SIGNS[HI].side * 0.8, SIGNS[HI].y < 400 ? -0.7 : -0.2];
  const lk = K.ss(3.0, 3.5, t) * (1 - K.ss(6.0, 6.5, t)) + K.ss(12.0, 12.5, t) * (1 - K.ss(14.0, 14.5, t));
  const toSlot = K.ss(6.8, 7.3, t) * (1 - K.ss(8.4, 8.9, t));   /* glance at the next-video slot */
  return {
    y, arms,
    st: {
      blink: K.blinkAt(t, 11), mouth: t < 2.6 || (t > 8.6 && t < 11) ? "grin" : "smile",
      look: [K.lerp(0, lookTo[0], lk) + toSlot, K.lerp(0, lookTo[1], lk) - 0.3 * toSlot],
      glint: K.inv(3.2, 3.8, t) < 1 ? K.inv(3.2, 3.8, t) : K.inv(13.0, 13.6, t),
      squash: 0.05 * Math.sin(t * 2.2) + (1 - rise) * -0.2, wave: 0.8, seed: 700, arms,
      brow: 0.3 * K.ss(1.6, 2.0, t) * (1 - K.ss(3.0, 3.4, t)),
    },
  };
}
/* ---------- header ---------- */
function drawHeader(t) {
  const a = ap(t, 0.5, 0.5);
  pop(a, 110, 86, () => {
    K.shape(ctx, K.ellipsePts(110, 86, 50, 50, 20), { fill: P.cream, w: 5, boil: 0.4, seed: 601, shade: { color: P.creamShade, dx: -6, dy: -6 }, drop: { dx: 0, dy: 7 } });
    logo(110 - 40, 86 - 40, 80, P.ink);
  });
  const aw = ap(t, 0.6, 0.5);
  if (aw > 0) {
    ctx.save(); ctx.globalAlpha *= K.clamp(aw * 2, 0, 1);
    const dx = (1 - K.E.out3(aw)) * -40;
    K.text(ctx, "marketmaker.cc", 186 + dx, 90, { size: 52, weight: 900, font: FD("en"), fill: P.cream, stroke: P.ink, w: 12, align: "left" });
    ctx.restore();
  }
  /* websites: two big pills, right-aligned in the header row */
  const ss = fitSize(SITES.map((q) => q.text).join(""), 38, 800, FT("en"), 1880 - 800 - SITES.length * 104, 32);
  let x1 = 1880;
  SITES.slice().reverse().forEach((q, k) => {
    const i = SITES.length - 1 - k, w = K.textW(ctx, q.text, ss, 800, FT("en")) + 100, x0 = x1 - w;
    const as = ap(t, 0.6 + i * 0.12, 0.5), cy = 86;
    const glint = t > 3 ? Math.sin(K.clamp(((t - 3 - i * 0.4) % 5.5) / 0.6, 0, 1) * Math.PI) : 0;
    pop(as, x0 + 40, cy, () => {
      K.shape(ctx, K.rrectPts(x0, cy - 40, w, 80, 40, 3), { fill: P.cream, w: 5, boil: 0.45, seed: 660 + i * 3, shade: { color: P.creamShade, dx: 0, dy: -9 }, drop: { dx: 0, dy: 8 } });
      ctx.save(); ctx.translate(x0 + 42, cy); ctx.rotate(0.5 * glint); ctx.translate(-(x0 + 42), -cy);
      glyph(x0 + 42, cy, 26, "web", q.color);
      ctx.restore();
      K.text(ctx, q.text, x0 + 80, cy + 1, { size: ss, weight: 800, font: FT("en"), align: "left" });
    });
    x1 = x0 - 24;
  });
  /* headline banner: unrolls from the left */
  const ab = ap(t, 0.75, 0.6);
  if (ab > 0) {
    const size = fitSize(T.head, 48, 900, FD(LANG), 1740, 34);
    const tw = K.textW(ctx, T.head, size, 900, FD(LANG)), w = tw + 72, x = 40, y = 152, h = 88;
    const u = K.E.out3(ab);
    ctx.save();
    ctx.beginPath(); ctx.rect(x - 20, y - 20, (w + 40) * u, h + 50); ctx.clip();
    K.shape(ctx, K.rrectPts(x, y, w, h, 24, 3), { fill: P.cream, w: 5, boil: 0.5, seed: 611, shade: { color: P.creamShade, dx: 0, dy: -10 }, drop: { dx: 0, dy: 9 } });
    K.text(ctx, T.head, x + 36, y + h / 2 + 2, { size, weight: 900, font: FD(LANG), align: "left" });
    ctx.restore();
  }
}

/* ---------- YouTube end-screen slots (calm after 2.4 s) ---------- */
function drawSlots(t) {
  const ab = ap(t, 0.3, 0.6);
  if (ab <= 0) return;
  ctx.save(); ctx.globalAlpha *= ab;
  K.shape(ctx, K.rrectPts(1150, 268, 730, 620, 34, 3), { fill: "rgba(14,42,92,0.55)", stroke: P.boardEdge, w: 5, boil: 0.3, seed: 621 });
  ctx.restore();
  const a1 = ap(t, 1.5, 0.5), a2 = ap(t, 1.7, 0.5);
  if (a1 > 0) {
    ctx.save(); ctx.globalAlpha *= a1;
    const s = 0.94 + 0.06 * K.E.out3(a1), cx = NEXT.x + NEXT.w / 2, cy = NEXT.y + NEXT.h / 2;
    ctx.translate(cx, cy); ctx.scale(s, s); ctx.translate(-cx, -cy);
    ctx.fillStyle = "rgba(242,248,255,0.07)"; ctx.beginPath(); ctx.roundRect(NEXT.x, NEXT.y, NEXT.w, NEXT.h, 18); ctx.fill();
    ctx.setLineDash([22, 16]); ctx.lineWidth = 5; ctx.strokeStyle = "rgba(242,248,255,0.55)"; ctx.stroke(); ctx.setLineDash([]);
    playGlyph(cx, cy - 34, 96, 0.9);
    K.text(ctx, T.next, cx, cy + 52, { size: fitSize(T.next, 40, 800, FT(LANG), NEXT.w - 60, 32), weight: 800, font: FT(LANG), fill: P.chalk });
    ctx.restore();
  }
  if (a2 > 0) {
    ctx.save(); ctx.globalAlpha *= a2;
    const s = 0.94 + 0.06 * K.E.out3(a2);
    ctx.translate(SUB.x, SUB.y); ctx.scale(s, s); ctx.translate(-SUB.x, -SUB.y);
    ctx.fillStyle = "rgba(242,248,255,0.07)"; ctx.beginPath(); ctx.arc(SUB.x, SUB.y, SUB.r, 0, K.TAU); ctx.fill();
    ctx.setLineDash([18, 14]); ctx.lineWidth = 5; ctx.strokeStyle = "rgba(242,248,255,0.55)"; ctx.stroke(); ctx.setLineDash([]);
    K.text(ctx, T.sub, SUB.x, SUB.y + 2, { size: fitSize(T.sub, 36, 800, FT(LANG), SUB.r * 1.8, 32), weight: 800, font: FT(LANG), fill: P.chalk });
    ctx.restore();
  }
}

/* ---------- contacts panel: chips wrap into two centred rows ---------- */
const CHIP = { r: 25, gap: 12, pad: 46, size: 32 };
let chipRows = null;
function layoutChips() {
  const items = CONTACTS.map((c) => {
    const tw = K.textW(ctx, c.text, CHIP.size, 800, FT("en"));
    const tagW = c.tag ? K.textW(ctx, c.tag, CHIP.size, 800, FT("en")) + 26 + 10 : 0;
    return Object.assign({ tw, tagW, w: CHIP.r * 2 + CHIP.gap + tw + tagW }, c);
  });
  /* two rows: pick the split that minimises the wider row, then shrink the gap to fit */
  const maxW = PANEL.w - 60, sum = (r) => r.reduce((q, it) => q + it.w, 0);
  let best = null;
  for (let k = 1; k < items.length; k++) {
    const r = [items.slice(0, k), items.slice(k)], m = Math.max(sum(r[0]) + (r[0].length - 1) * CHIP.pad, sum(r[1]) + (r[1].length - 1) * CHIP.pad);
    if (!best || m < best.m) best = { m, r };
  }
  const rows = best.r;
  const padOf = (r) => Math.min(CHIP.pad, (maxW - sum(r)) / Math.max(1, r.length - 1));
  const wOf = (r) => sum(r) + (r.length - 1) * padOf(r);
  let n = 0;
  rows.forEach((r, ri) => {
    let x = PANEL.x + (PANEL.w - wOf(r)) / 2;
    r.forEach((it) => { it.x = x; it.y = PANEL.y + 44 + ri * 70; it.n = n++; x += it.w + padOf(r); });
  });
  chipRows = rows;
}
function drawPanel(t) {
  const a = ap(t, 0.15, 0.6);
  if (a <= 0) return;
  const dy = (1 - K.E.out3(a)) * 220;
  ctx.save(); ctx.translate(0, dy);
  K.shape(ctx, K.rrectPts(PANEL.x, PANEL.y, PANEL.w, PANEL.h, 30, 3), { fill: P.cream, w: 5, boil: 0.5, seed: 631, shade: { color: P.creamShade, dx: 0, dy: -12 }, drop: { dx: 0, dy: 10 } });
  if (!chipRows) layoutChips();
  chipRows.forEach((r) => r.forEach((it) => {
    const ac = ap(t, 1.2 + it.n * 0.08, 0.4);
    if (ac <= 0) return;
    /* one chip at a time gets a gentle nod (a slow roll call through the list) */
    const k = Math.floor((t - 3) / 1.6), nod = t > 3 && (k % CONTACTS.length) === it.n ? Math.sin(((t - 3) % 1.6) / 1.6 * Math.PI) : 0;
    pop(ac, it.x + CHIP.r, it.y, () => {
      ctx.save(); ctx.translate(it.x + CHIP.r, it.y); ctx.rotate(-0.12 * nod); ctx.scale(1 + 0.1 * nod, 1 + 0.1 * nod); ctx.translate(-(it.x + CHIP.r), -it.y);
      glyph(it.x + CHIP.r, it.y, CHIP.r, it.icon, it.color);
      ctx.restore();
      const tx = it.x + CHIP.r * 2 + CHIP.gap;
      K.text(ctx, it.text, tx, it.y + 1, { size: CHIP.size, weight: 800, font: FT("en"), align: "left" });
      if (it.tag) {
        const px = tx + it.tw + 10, pw = it.tagW - 10;
        K.shape(ctx, K.rrectPts(px, it.y - 21, pw, 42, 21, 3), { fill: P.bid, w: 3.5, boil: 0.3, seed: 641 });
        K.text(ctx, it.tag, px + pw / 2, it.y + 1, { size: CHIP.size, weight: 800, font: FT("en"), fill: "#ffffff" });
      }
    });
  }));
  ctx.restore();
}

/* ---------- world ---------- */
function drawWorld(t) {
  K.ocean(ctx, { depth: 0.45 });
  K.rays(ctx, { a: 0.8, x: 700, spread: 1500 });
  K.applyCam(ctx, 1);
  K.kelp(ctx, 1120, 960, 360, { seed: 4, sway: 0.6 });
  K.kelp(ctx, 26, 960, 520, { seed: 8, sway: 0.8 });
  K.sand(ctx, 905, {});
  K.coralFan(ctx, 1030, 915, 0.55, {});
  K.brainCoral(ctx, 120, 925, 0.6, {});
  /* fish cross the water right of the headline, one after another (never over the slots or pills) */
  [[0.4, 12, 200, "Y", 0.5], [6.0, 13, 214, "T", 0.45], [11.4, 12, 196, "O", 0.5]].forEach(([t0, d, y, sp, s], k) => {
    const u = (t - t0) / d; if (u < 0 || u > 1) return;
    const x = K.lerp(2020, 1380, u);
    ctx.save(); ctx.globalAlpha *= K.clamp((x - 1380) / 120, 0, 1);
    K.fish(ctx, x, y + 8 * Math.sin(t * 2 + k), s, { species: sp, dir: -1 });
    ctx.restore();
  });
  K.bubbles(ctx, { n: 14, x0: 0, x1: 1110, y0: 900, h: 760, speed: 60, rMax: 14, seed: 33 });
}

function render(t) {
  K.begin(ctx, t, { x: 960, y: 540, z: 1 });
  drawWorld(t);
  K.screen(ctx);
  drawSlots(t);
  const o = octoPose(t);
  K.octo(ctx, OCTO.x, o.y, OCTO.s, o.st);
  for (let i = 0; i < 4; i++) drawSign(i, t);
  drawPanel(t);
  drawHeader(t);
  /* bubble hello when Otto lands */
  K.bubbleBurst(ctx, OCTO.x, OCTO.y - 200, t - 0.9, { n: 12, r: 220, size: 14 });
  /* in: the octopus ink cloud clears; out: fade to deep navy */
  K.inkCloud(ctx, OCTO.x, 760, Math.pow(1 - ap(t, 0, 0.8), 2), { maxR: 1900 });
  const out = K.ss(18.1, 19.0, t);
  if (out > 0) { K.screen(ctx); ctx.fillStyle = `rgba(10,18,48,${out})`; ctx.fillRect(0, 0, 1920, 1080); }
}

const TL = gsap.timeline({ paused: true });
const drv = { _t: 0 };
Object.defineProperty(drv, "t", { get() { return this._t; }, set(v) { this._t = v; render(v); } });
TL.to(drv, { t: DUR, duration: DUR, ease: "none" }, 0);
render(0);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { chipRows = null; render(drv._t); });
window.__timelines["main"] = TL;
