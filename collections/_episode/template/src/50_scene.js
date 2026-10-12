/* ============================================================
   GENERIC SCENE TEMPLATE (used only when the collection has no style/episode/template/50_scene.js).
   Read collections/_episode/README.md. Times are EPISODE-GLOBAL seconds g.
   Available: K (this collection's kit), P (palette), SCENE, NR (narration), HOST + SIGN (collection
   layer, see <collection>/style/episode/), TR, ctx, DUR, pop / span / hold, RUN.
   Replace the header with: "<id> <start> - <end>  <what the viewer sees, beat by beat>".
   ============================================================ */
const TXT = { title: "Section title from SCENES.md", line: "A sentence from SCENES.md" };
const B = { first: NR.cue("the", SCENE.start), second: NR.cue("and", SCENE.start + 5) };
const CAM = K.mkTrack([[SCENE.start, { x: 960, y: 540, z: 1 }], [SCENE.end, { x: 1000, y: 520, z: 1.06 }]]);

function draw(g) {
  K.cam = Object.assign({ rot: 0 }, CAM(g));
  K.applyCam(ctx, 1);
  ctx.fillStyle = P.paper || P.bg || "#f3ead6"; ctx.fillRect(-2000, -2000, 6000, 6000); /* replace with the kit's world */
  K.screen(ctx);
  if (typeof SIGN !== "undefined") SIGN.chapter(ctx, g, { at: B.first, until: B.first + 5, lines: [TXT.title] });
  K.text(ctx, TXT.line, 1150, 540, { size: 48, alpha: pop(g, B.second) });
  if (typeof HOST !== "undefined") HOST.duo(ctx, g, { point: [1150, 540], pointAmt: hold(g, B.second, B.second + 3) });
}

RUN(draw);
