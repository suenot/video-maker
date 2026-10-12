/* ============================================================
   INTRO 70 RENDER: render(t) is the whole film. One paused GSAP timeline
   drives a proxy whose setter calls render(t). Scene order and the
   diegetic transitions between them:
   0.00 - 4.04   street: moon, rain, the lamp comes on (instrumental)
   4.04 - 7.92   office: the spinning newspaper lands, hat tip, lens eye
   7.42 - 11.80  iris through the magnifier onto the street: the two trails
   11.80 - 15.67 lightning cut to the city map: footprints of prices
   15.67 - 23.38 lightning cut to the cork board: the link, the confounder
   22.90 - 33.20 venetian-blind wipe to the street: title, badges, hat tip
   ============================================================ */
/* ---------- screen-space shift for whip pans: wraps the kit camera ---------- */
let SHIFT = 0;
const baseApply = K.applyCam, baseScreen = K.screen;
const shifted = (c) => { if (SHIFT) { const m = c.getTransform(); c.setTransform(new DOMMatrix().translateSelf(SHIFT, 0).multiplySelf(m)); } };
K.applyCam = function (c, p) { baseApply(c, p); shifted(c); };
K.screen = function (c) { baseScreen(c); shifted(c); };

function ringAt(cx, cy, r) {
  baseScreen(ctx); ctx.save();
  ctx.lineWidth = 26; ctx.strokeStyle = P.brass; ctx.beginPath(); ctx.arc(cx, cy, r + 10, 0, K.TAU); ctx.stroke();
  ctx.lineWidth = 6; ctx.strokeStyle = P.ink; ctx.beginPath(); ctx.arc(cx, cy, r + 25, 0, K.TAU); ctx.stroke();
  ctx.restore();
}
/* venetian blinds closing (c = 0..1) over whatever is drawn */
function blindsOver(c) {
  if (c <= 0) return;
  baseScreen(ctx);
  const n = 12, h = 1080 / n;
  for (let i = 0; i < n; i++) {
    const th = h * c;
    K.shape(ctx, K.rectPts(-20, i * h + (h - th) / 2, 1960, th, 6), { fill: P.greyDark, w: 4, boil: 0.8, seed: 950 + i, shade: { color: P.bldgDark, dx: 0, dy: -th * 0.45 } });
  }
}

function drawFilm(t) {
  const irisT = [at(4) - 0.5, at(4)], wipe = [at(11, 3), at(12)];
  if (t < S.office[0]) return drawStreetOpening(t);
  if (t < irisT[0]) return drawOffice(t);
  if (t < irisT[1]) {
    drawOffice(t);
    const u = K.E.inOut(K.inv(irisT[0], irisT[1], t)), L = K.lensPt || { x: 960, y: 400 }, r0 = K.lensR || 60;
    const cx = K.lerp(L.x, 960, u), cy = K.lerp(L.y, 540, u), r = K.lerp(r0, 1250, u);
    baseScreen(ctx); ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, K.TAU); ctx.clip();
    drawStreetOpening(t); ctx.restore(); ringAt(cx, cy, r);
    return;
  }
  if (t < S.map[0]) return drawStreetOpening(t);
  if (t < S.board[0]) { drawMap(t); return lightningCut(t, S.map[0]); }
  if (t < wipe[0]) { drawBoard(t); return lightningCut(t, S.board[0]); }
  if (t < wipe[1]) {
    const u = K.inv(wipe[0], wipe[1], t);
    if (u < 0.5) { drawBoard(t); blindsOver(K.E.inOut(u * 2)); }
    else { drawTitleScene(t); blindsOver(K.E.inOut(2 - u * 2)); }
    return;
  }
  drawTitleScene(t);
}
/* a hard cut on the downbeat hidden in a lightning flash */
function lightningCut(t, t0) {
  const f = K.flash(t, t0 - 0.06); if (f <= 0) return;
  baseScreen(ctx); ctx.fillStyle = K.rgba(P.moon, 0.7 * f); ctx.fillRect(0, 0, 1920, 1080);
}

function render(t) {
  try {
    K.begin(ctx, t, { x: 960, y: 540, z: 1, rot: 0 });
    titleEl.style.opacity = "0";
    SHIFT = 0;
    drawFilm(t);
  } catch (err) {
    /* never leave a black frame silently: draw the error so a snapshot shows it */
    K.screen(ctx); ctx.fillStyle = "#300"; ctx.fillRect(0, 0, 1920, 80); ctx.fillStyle = "#fff"; ctx.font = "28px monospace"; ctx.fillText(String(err && err.stack || err).slice(0, 140), 20, 50);
  }
  /* marketmaker.cc plaque: one small bounce on the first downbeat, then static */
  const lb = Math.sin(Math.PI * K.inv(at(1), at(1) + 0.35, t));
  logoEl.style.transform = lb > 0 ? `scale(${(1 + 0.1 * lb).toFixed(3)})` : "none";
  /* film grain steps at the boil rate */
  const f = K.boilFrame(t);
  grainEl.style.backgroundPosition = ((f % 7) * 37) + "px " + ((f % 5) * 53) + "px";
}

const grainEl = document.getElementById("grain"), logoEl = document.getElementById("logo");
grainEl.style.backgroundImage = "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 1.4 -.2'/></filter><rect width='320' height='320' filter='url(%23n)'/></svg>\")";

const TL = gsap.timeline({ paused: true });
const drv = { _t: 0 };
Object.defineProperty(drv, "t", { get() { return this._t; }, set(v) { this._t = v; render(v); } });
TL.to(drv, { t: DUR, duration: DUR, ease: "none" }, 0);
render(0);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => render(drv._t));
window.__timelines["main"] = TL;
window.__render = render;
