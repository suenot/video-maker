# Order types: semantic scenes

The source for spoken narration, scene IDs, and **all visible wording** is
[`narration-manifest.json`](narration-manifest.json). The drawings are a single
illustrative order book, not a live venue replay. Venue behavior can differ.

| Scene ID | Visual proof | Continuity |
| --- | --- | --- |
| `hook` | A trigger at 99 sits above the next bid at 96; a descending stroke crosses the gap. | Opens the price-versus-execution question. |
| `book` | Three ask rows show 3 at 101, 4 at 102, and 3 at 104. Best bid is 100. | The same displayed asks feed the next three buy examples. |
| `market` | All three ask rows fill; the ten-unit weighted average is 102.3. | A conditional illustrative fill, not a guaranteed market result. |
| `limit` | A buy limit at 102 fills seven units in the first two ask rows; three can rest. | A crossing limit can take liquidity. |
| `post_only` | Buy at 102 crosses ask 101 and may be canceled or rejected; buy at 100 can rest. | Maker status applies only to an accepted passive order. |
| `stop` | A separate sell example compares stop-market near bid 96 with stop-limit floor 98 and possible no fill. | The stop at 99 only triggers submission. |
| `tif` | Ten requested against seven available: IOC fills seven and cancels three, while FOK fills zero. | Applies the same limit-order liquidity example. |
| `takeaway` | Four decision questions appear as cards. | Close on choosing the relevant execution risk. |

`cover.png` uses the hook wording with a separate two-level gap graphic.
`endcard.png` displays only `marketmaker.cc`; neither is a narrated scene.

The native raster source is generated with
`video_maker/scripts/build_order_types_frames.py`. The script reads the manifest
at render time, so copy corrections remain in one place.
