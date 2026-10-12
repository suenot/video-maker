/* ============================================================
   GALLERY: every explainer primitive of the lab kit on one board (0-4 s),
   then the host duo (4-14 s): owl talks / Pico listens, Pico talks / owl
   listens, both point at a plate, reactions, and a Pico gesture sheet.
   Rebuild and snapshot after any kit change to catch regressions.
   ============================================================ */
const K = LK, P = K.P, DUR = 14;
const ctx = document.getElementById("cv").getContext("2d");
function render(t) {
  if (t >= 4) return renderDuo(t);
  K.begin(ctx, t, { x: 960, y: 540, z: 0.5, rot: 0 });
  K.applyCam(ctx, 1);
  K.labWall(ctx, -1000, 3000, { top: -700, bottom: 1700, dado: 1000, windows: [[180, -380, 300, 560]] });
  K.bench(ctx, -1000, 3000, 1500, { seed: 60 });
  const a = K.inv(0, 0.5, t);
  K.plate(ctx, 0, -160, 720, 440, [{ data: [0.2, 0.35, 0.3, 0.55, 0.5, 0.7, 0.66, 0.82], color: P.leaf, kind: "line" }, { data: [0.25, 0.3, 0.45, 0.5, 0.48, 0.62, 0.7, 0.75], kind: "scatter" }], { a, draw: K.inv(0.3, 1.5, t), title: "fit + band", xLabels: ["t0", "t1", "t2", "t3"], band: { lo: [0.1, 0.25, 0.2, 0.42, 0.38, 0.56, 0.5, 0.64], hi: [0.3, 0.45, 0.4, 0.68, 0.62, 0.84, 0.8, 0.98] } });
  K.plate(ctx, 900, -160, 640, 440, [{ data: [0.3, 0.6, 0.45, 0.8, 0.5], color: P.test, kind: "bar" }], { a, draw: K.inv(0.3, 1.2, t), title: "bars" });
  K.board(ctx, 1840, -200, 760, 300, ["p(y|x) = N(mu, s2)", { t: "q = 0.95", c: P.brassLight }], { a, write: K.inv(0.5, 2, t) });
  K.card(ctx, 0, 450, [200, 180, 180], [["model", "sharpe", "dd"], ["tree", "1.42", "-8 %"], ["net", "1.61", "-11 %"], ["bayes", "1.35", "-6 %"]], { a, hi: 2 });
  K.gauge(ctx, 720, 400, 150, 0.2 + 0.5 * K.inv(0.5, 2, t), { a, readout: "0.71" });
  K.packets(ctx, 1320, 430, 560, ["anomalies", "AutoML", "conformal"], { a, shown: K.inv(0.6, 2, t) * 3 });
  K.typewriter(ctx, 2140, 420, 640, ["def fit(X, y):", "    # walk-forward", "    return model.fit(X, y)"], { a, typed: K.inv(0.5, 2.5, t) });
  K.flask(ctx, -620, 1500, 1.2, { layers: [{ h: 0.4, color: P.train }, { h: 0.2, color: P.test }], bubbles: 3, label: "f1" });
  K.flask(ctx, -150, 1500, 1.2, { layers: [{ h: 0.5, color: P.glass }], bubbles: 2, glowA: 0.5 });
  K.tube(ctx, [-560, 1260], [-100, 1260], { state: "hot", bend: -50, label: "0.84" });
  K.pot(ctx, 450, 1500, 1); K.treePlant(ctx, 450, 1380, 0.8, { grow: K.inv(0, 2, t) * 3, leaves: ["0.2", "0.7", "0.4", "0.9", "0.1", "0.6", "0.3", "0.8"] });
  K.pot(ctx, 1350, 1500, 1, { color: P.glassDark, shadow: P.glassDeep }); K.netVine(ctx, 1350, 1100, 0.95, { grow: K.inv(0, 2, t) * 4, pulse: (t / 2) % 1, w: 420, h: 300 });
  K.owl(ctx, 2150, 1500, 1.2, { blink: K.blinkAt(t, 3), wingR: { x: 150, y: -330, hand: "thumb" }, wingL: { x: -150, y: -260, hand: "point" }, mouth: "smile" });
  K.screen(ctx);
  K.marquee(ctx, 960, 650, 900, 90, 1, { chase: Math.floor(t * 4) });
}
/* fake voice: syllables (about 4.5 per second) in words with gaps, 0..1 loudness */
function voice(t, seed) {
  const syl = Math.max(0, Math.sin(t * Math.PI * 9)), word = K.vnoise(t * 2.2, seed);
  return word < 0.3 ? 0 : Math.pow(syl, 0.7) * K.clamp(0.4 + word, 0, 1);
}
const VIS = ["a", "e", "o", "a", "m", "e"];
const vis = (t) => VIS[Math.floor(t * 4.5) % VIS.length];
const accent = (t, period) => { const u = (t % period) / period; return u < 0.5 ? Math.sin((u / 0.5) * Math.PI) : 0; };
function caption(txt) {
  K.screen(ctx);
  ctx.font = '600 44px "Oswald"'; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  const w = ctx.measureText(txt).width + 60;
  K.shape(ctx, K.rrectPts(960 - w / 2, 40, w, 76, 12), { fill: P.paper, w: 4, boil: 0.5, seed: 5 });
  ctx.fillStyle = P.ink; ctx.fillText(txt, 960, 80);
}
function renderDuo(t) {
  K.begin(ctx, t, { x: 960, y: 540, z: 1, rot: 0 });
  K.applyCam(ctx, 1);
  K.labWall(ctx, -200, 2200, { top: -200, bottom: 1300, dado: 760, windows: [] });
  const PL = [1380, 470], plate = (a, draw) => K.plate(ctx, PL[0], PL[1], 760, 460, [{ data: [0.2, 0.32, 0.3, 0.5, 0.46, 0.66, 0.62, 0.84], color: P.leaf, kind: "line" }], { a, draw, title: "walk-forward", xLabels: ["2019", "2021", "2023", "2025"] });
  K.screen(ctx);
  if (t < 6) { /* owl talks, Pico listens and nods */
    plate(1, 1);
    const v = voice(t, 11);
    K.duo(ctx, t, { x: 420, y: 1010, talkA: v, visA: vis(t), who: "a", accA: accent(t, 1.3), gestA: Math.floor(t / 1.3) });
    caption("STRIX TALKS, PICO LISTENS");
  } else if (t < 8) { /* Pico talks, owl listens */
    plate(1, 1);
    const v = voice(t, 23);
    K.duo(ctx, t, { x: 420, y: 1010, talkB: v, visB: vis(t), who: "b", accB: accent(t, 1.1), gestB: Math.floor(t / 1.1) });
    caption("PICO TALKS, STRIX LISTENS");
  } else if (t < 10) { /* both point at the plate's peak */
    plate(1, K.inv(8, 9.4, t));
    const amt = K.E.out3(K.inv(8.1, 8.6, t)), pk = [PL[0] + 280, PL[1] - 110];
    K.duo(ctx, t, { x: 420, y: 1010, talkA: t > 8.8 ? voice(t, 31) : 0, who: "a", pointA: pk, pointAmtA: amt, pointB: pk, pointAmtB: amt });
    caption("BOTH POINT AT A PLATE");
  } else if (t < 12) { /* reactions */
    plate(1, 1);
    const u = K.E.out3(K.inv(10.1, 10.4, t)), late = t >= 11;
    K.duo(ctx, t, { x: 420, y: 1010, who: null,
      reactA: late ? { kind: "think", amt: K.inv(11, 11.3, t) } : { kind: "surprise", amt: u },
      reactB: late ? { kind: "write", amt: K.inv(11, 11.3, t) } : { kind: "surprise", amt: u } });
    caption(late ? "THINK + TAKE NOTES" : "SURPRISE");
  } else { /* Pico gesture sheet at 0.7 (about 180 px): point, nod, surprise, think, talk */
    const Y = 860, s = 0.72;
    K.bench(ctx, -100, 2100, Y + 10, { seed: 61 });
    const cols = [
      ["point", { wingR: { mode: "point", x: 120, y: -200 }, look: [1, -0.2] }],
      ["nod", { nod: 0.6 + 0.4 * Math.sin(t * 9), look: [0.6, 0.4] }],
      ["surprise", { crest: 1, eyeUp: 1, exclaim: 1, lean: -10, blink: 0 }],
      ["think", { think: 1, wingR: { mode: "point", x: 52, y: -150 } }],
      ["talk", { talk: voice(t, 41), viseme: vis(t), crest: 0.3 }],
    ];
    cols.forEach(([name, st], i) => {
      const x = 260 + i * 350;
      K.hummingbird(ctx, x, Y - 60, s, Object.assign({ seed: 820 + i * 7, dir: 1, hover: 1, blink: K.blinkAt(t + i, 11 + i) }, st));
      ctx.font = '600 40px "Oswald"'; ctx.textAlign = "center"; ctx.fillStyle = P.paper; ctx.strokeStyle = P.ink; ctx.lineWidth = 8;
      ctx.strokeText(name.toUpperCase(), x, Y + 90); ctx.fillText(name.toUpperCase(), x, Y + 90);
    });
    caption("PICO AT 180 PX: GESTURES");
  }
}
const TL = gsap.timeline({ paused: true }), drv = { _t: 0 };
Object.defineProperty(drv, "t", { get() { return this._t; }, set(v) { this._t = v; render(v); } });
TL.to(drv, { t: DUR, duration: DUR, ease: "none" }, 0);
render(0);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => render(drv._t));
window.__timelines["main"] = TL;
