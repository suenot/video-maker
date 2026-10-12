# Scene guide: complex-arbitrage-graph-algorithms (en)

The workflow, rules and tools are collection-agnostic. They live in **`collections/_episode/README.md`**; read it first. This page adds only what is specific to the Arbitrage Crab collection and to this pilot.

```bash
EP=collections/complex-arbitrage-rust/episodes/complex-arbitrage-graph-algorithms/en/episode; T=collections/_episode/tools
$T/new_scene.sh $EP s05_complexity && $T/snap.sh $EP s05 2.5 && $T/render_scene.sh $EP s05
```

## Crab collection layer (`complex-arbitrage-rust/style/episode/`)

- **`HOST`** (65_host.js):
  - Captain Ferrous the crab is host A, the lower voice (about 102 Hz), the explainer. Pip the parrot is host B, the higher voice (about 179 Hz).
  - `HOST.duo` draws a raft with the crab and the parrot on its perch. It has the default size s 1.55 and supports `carryR/carryL` items in the crab's claws.
  - `HOST.ship` puts the crab at the helm and the parrot on the bow rail (side set).
  - Crab reactions: surprise, grin, worry, shrug, thumbs, jump, spyglass, nod, think. Parrot reactions: surprise, flap, worry, grin, think.
- **`SIGN`** (66_signs.js): `chapter` is a wooden board on ropes, `note` is a paper callout with a leader arrow, `stamp` is a rubber stamp with a cross-out.
- **`SIDE`** (67_side.js): the horizon set with pan, zoom, storm, murk and flash, and parallax layers. The chart set is the kit's `K.applyCam` + `K.chartSea`.
- **`TR`** (68_transitions.js): the sea-wall wave and the brass spyglass iris.
- Kit: `K.node`, `K.edge` (with `arrow`), `K.tag`, `K.plank`, `K.ledger`, `K.slate`, `K.sailChart`, `K.notice`, `K.logbook`, `K.banner`, `K.miniShip`, `K.coin`, `K.goldBit`, `K.coinPile`, `K.sparkle`, `K.glow`, `K.cog`, `K.crab`, `K.parrot`, `K.perch`. The style rules are in `style/STYLE.md`: gold only for money and the winning path, red for caveats.
- Subscripts: the font subset has no subscript glyphs. s02c draws subscripted formula terms with its own small helper; copy it from `scenes/s02c_cycle_condition/src/50_scene.js`.

## Pilot status

- Done and rendered: s01a-s02c (0-344.9 s).
- These scenes still use the old small hosts (s 1.15, pinned explicitly). Re-staging them with big hosts is an open task.
- To do: s03-s15. See `REVIEW.md` for the known weaknesses.
