# Sidekick (host B) brief

Episodes are re-animated NotebookLM conversations with TWO voices. Host A (the explainer, usually the lower ~100 Hz voice) = your collection MASCOT. Host B (the curious co-host, usually the higher ~180 Hz voice) = a SIDEKICK you add now. Reference: complex-arbitrage-rust kit — crab captain + parrot "Pip" (see its style/kit README, STYLE.md, gallery, and episodes/complex-arbitrage-graph-algorithms/en/episode/ lib + SCENE_GUIDE.md for how hosts are driven).

Add to YOUR collection kit (style/kit), in your world's art style:
1. Sidekick rig: expressive, readable at 180-400 px tall; blink, squash/stretch, IK limbs/wings, look-at target, at least 4 gestures (point, nod, surprise, thinking), idle bob.
2. Talking mouths for BOTH mascot and sidekick driven by a 0-1 loudness value per frame (mouth open amount + optional viseme-ish shapes), plus "listening" pose (nod, look at speaker).
3. A "duo" placement helper: both hosts large in frame (mascot >= 300 px tall in explainer scenes), able to stand beside / point at / carry explainer props from your kit. Hosts are storytellers, never tiny in a corner.
4. Update style/gallery to show mascot + sidekick talking, listening, pointing; update STYLE.md + kit README (API).
Keep APIs additive; don't break the intro. QA: gallery snapshots viewed, 2 critique rounds. Commit path-scoped (`git commit -m ... -- <paths>`), push with pull --rebase --autostash. No renders of intros needed.
