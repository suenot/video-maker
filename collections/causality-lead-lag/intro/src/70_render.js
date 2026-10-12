/* ============================================================
   INTRO 70 RENDER: render(t) is the whole film. One paused GSAP timeline
   drives a proxy whose setter calls render(t). Scene order and the
   diegetic transitions between them:
   0.00 - 15.82  street: lamp, two trails, the lag, two stamps
   15.82 - 23.83 office: spinning newspaper lands, pull back, the fox, lens eye
   23.33 - 27.83 iris through the magnifier: city map, footprints of prices
   27.83 - 31.84 lineup (lights clank on): who moved first
   31.84 - 53.84 whip pan to the cork board: clue card, strings, confounder
   52.84 - 64.50 venetian-blind wipe to the street: title, badges, hat tip
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
function streaks(a) {
  if (a <= 0) return;
  baseScreen(ctx); ctx.save(); ctx.strokeStyle = K.rgba(P.greyLight, 0.5 * a); ctx.lineCap = "round";
  for (let i = 0; i < 34; i++) { const y = K.hash(i, 3) * 1080, x = K.hash(i, 4) * 1920, L = 300 + 700 * K.hash(i, 5); ctx.lineWidth = 2 + 6 * K.hash(i, 6); ctx.beginPath(); ctx.moveTo(x - L / 2, y); ctx.lineTo(x + L / 2, y); ctx.stroke(); }
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
  const irisT = [at(11) - 0.5, at(11)], whip = [at(15) - 0.25, at(15) + 0.2], wipe = [at(25, 2), at(26)];
  if (t < irisT[0]) return drawOffice(t);
  if (t < irisT[1]) {
    drawOffice(t);
    const u = K.E.inOut(K.inv(irisT[0], irisT[1], t)), L = K.lensPt || { x: 960, y: 400 }, r0 = K.lensR || 60;
    const cx = K.lerp(L.x, 960, u), cy = K.lerp(L.y, 540, u), r = K.lerp(r0, 1250, u);
    baseScreen(ctx); ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, K.TAU); ctx.clip();
    drawMap(t); ctx.restore(); ringAt(cx, cy, r);
    return;
  }
  if (t < at(13)) return drawMap(t);
  if (t < whip[0]) return drawLineup(t);
  if (t < whip[1]) {
    const u = K.E.inOut(K.inv(whip[0], whip[1], t));
    baseScreen(ctx); ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 1920 * (1 - u), 1080); ctx.clip();
    SHIFT = -1920 * u; drawLineup(t); ctx.restore();
    baseScreen(ctx); ctx.save(); ctx.beginPath(); ctx.rect(1920 * (1 - u), 0, 1920 * u, 1080); ctx.clip();
    SHIFT = 1920 * (1 - u); drawBoard(t); ctx.restore();
    SHIFT = 0; streaks(Math.sin(Math.PI * u));
    return;
  }
  if (t < wipe[0]) return drawBoard(t);
  if (t < wipe[1]) {
    const u = K.inv(wipe[0], wipe[1], t);
    if (u < 0.5) { drawBoard(t); blindsOver(K.E.inOut(u * 2)); }
    else { drawTitleScene(t); blindsOver(K.E.inOut(2 - u * 2)); }
    return;
  }
  drawTitleScene(t);
}

function render(t) {
  try {
    K.begin(ctx, t, { x: 960, y: 540, z: 1, rot: 0 });
    titleEl.style.opacity = "0";
    SHIFT = 0;
    if (t < S.street[1]) drawStreetOpening(t);
    else if (typeof drawFilm === "function") drawFilm(t);
  } catch (err) {
    /* never leave a black frame silently: draw the error so a snapshot shows it */
    K.screen(ctx); ctx.fillStyle = "#300"; ctx.fillRect(0, 0, 1920, 80); ctx.fillStyle = "#fff"; ctx.font = "28px monospace"; ctx.fillText(String(err && err.stack || err).slice(0, 140), 20, 50);
  }
  /* film grain steps at the boil rate */
  const f = K.boilFrame(t);
  grainEl.style.backgroundPosition = ((f % 7) * 37) + "px " + ((f % 5) * 53) + "px";
}

const grainEl = document.getElementById("grain");
grainEl.style.backgroundImage = "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 1.4 -.2'/></filter><rect width='320' height='320' filter='url(%23n)'/></svg>\")";

const TL = gsap.timeline({ paused: true });
const drv = { _t: 0 };
Object.defineProperty(drv, "t", { get() { return this._t; }, set(v) { this._t = v; render(v); } });
TL.to(drv, { t: DUR, duration: DUR, ease: "none" }, 0);
render(0);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => render(drv._t));
window.__timelines["main"] = TL;
window.__render = render;
