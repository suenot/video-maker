# Order types: source and adaptation

Checked 2026-09-26. This video adapts the published [English article](https://marketmaker.cc/en/blog/post/algotrading-order-types) and [Russian article](https://marketmaker.cc/ru/blog/post/algotrading-order-types). The source files are `../marketmaker-cc-landing/src/content/blog/algotrading-order-types.en.md` (`sha256:c0a9ac96794825681f203aef9a225952cd0458ae1259006555795059a88f3b9c`) and `.ru.md` (`sha256:0bb258344db9e28218b8477dd2aefdc3580d0902ca3491de86f5624a9689ee7e`).

No article-specific NotebookLM audio, slide PDF, or Gaia run was present. The eight-scene script in `narration-manifest.json` is a new, focused explanation of standard order behavior. It uses one illustrative order book and a separate illustrative price gap. The exact claims and exclusions are recorded in `product-facts.md` with primary exchange documentation.

The narration is synthesized scene by scene through `scripts/build_variant_narration.py` and `selfmade/narrate.py`, retaining word timings for subtitles. English uses `en-US-JennyNeural` at normal rate; Russian uses `ru-RU-SvetlanaNeural` at `+10%` so that narration plus the ten-second contact card fits the current three-minute Shorts limit. All rendered words, times, and source hashes are in `production-manifest.json`.

The visual contract draws a native desktop and a native vertical scene from the same meaning. It does not reuse the article's unverified universal claims about guarantees, fees, queue priority, or fixed exchange rules.
