# Collection videos: status and handoff (2026-10-12)

## Decisions (user)
- Each collection = own cartoon world + mascot storyteller; everything drawn in code (HyperFrames + GSAP). NotebookLM slide images never appear in final video (reference only).
- Intro: one EN song per collection via gaia (`/Users/suenot/projects/sdvg/gaia/music_gen.py`), 20-30 s; intro = full song length; marketmaker.cc logo top-right; title in en/ru/zh-CN/zh-TW.
- Every video ends with the universal end card `_endcard/renders/endcard_<lang>.mp4` (4 YT channels + site contacts + www.marketmaker.cc, www.listingapis.com).
- Episode order: intro -> scenes over NotebookLM narration -> end card. All EN episodes first, then ru, zh-CN, zh-TW.
- Articles outside collections use `marketmaker-general` (octopus Otto).

## State
| Collection | Mascot | Intro | Sidekick (host B) |
|---|---|---|---|
| complex-arbitrage-rust | crab captain | 31.5 s done; fix pending: 13 s static title | parrot Pip (done) |
| ai-agents-trading | robot Beepo | 24.3 s done | done: analyst bot Ping, K.duo + episode layer 65_host.js |
| modern-ml-trading | owl Strix | 26.6 s done | done: hummingbird Pico, K.duo |
| order-book-microstructure | raccoon Tikki | 26.4 s done | done: gecko Gekko, K.duo |
| execution-market-making | mouse Mr. Tick | 27.1 s done | in progress (pigeon) |
| statistical-arbitrage-pairs | ragtime cat + penguins | 28.9 s done | done: penguin Skip, K.duo |
| onchain-defi-quant | hamster Chef Nibbs | 30.8 s done | done: bee Bizzy, K.duo |
| volatility-regimes | turtle Siggy | 31.0 s done; TODO: blank orange wipe frame ~25 s, near-empty frames 7 s and 13 s | done: seagull Gully, K.duo |
| causality-lead-lag | fox Vulpes | 33.2 s done | done: Sergeant Basset, K.duo |
| marketmaker-general | octopus Otto | 29.6 s done | done: pufferfish Puff, K.duo |

- End card: done (19 s, 4 langs).
- Episode prep (SCENES.md, hand-set slide timing, Whisper word timings): done for all 28 EN episodes in `<collection>/episodes/<slug>/en/prep/`. sync_slides auto-timing failed on every deck; timings are manual. Each SCENES.md lists NotebookLM errors with corrected content to draw.
- Pilot episode `complex-arbitrage-rust/episodes/complex-arbitrage-graph-algorithms/en/episode/`: framework done (tools/, lib/, SCENE_GUIDE.md, assemble.py); slides 1-2 built (7 scenes, preview_en.mp4). In progress: slides 3-15 (4 packages), full render, and extraction of the framework into `collections/_framework/` (collection-agnostic, HOSTS.md adapter).
- Article fixes found during prep: pushed to marketmaker-cc-landing (8 articles x 22 langs).

## Episode engine
- Shared, collection-agnostic engine: `collections/_episode/` (README = builder guide, tools: init_episode.py, new_scene.sh, snap.sh, render_scene.sh, assemble.py).
- Per collection a small layer in `<collection>/style/episode/` (65_host.js with HOST.duo, 66_signs.js, template); crab layer is the model. Each collection needs one "collection layer" agent (~1 h) before scene builders.
- Hosts default s 1.55 (~30% of frame), must point/carry/react every 10-15 s.
- Pilot remaining work: packages A s03-s04, B s05-s06, C s07-s10, D s11-s15, E re-stage s01a-s02c with big hosts.

## Next steps
1. Finish pilot episode, show user the full episode_en.mp4.
2. With `_framework/` + sidekicks ready: one episode director agent per episode (spawns scene helpers), EN first.
3. Then ru / zh-CN / zh-TW: re-time scenes to each language's NotebookLM audio (prep per language with EPISODE_PREP_BRIEF.md).
4. Rendering is the bottleneck (~41k frames per 23 min episode). Consider HyperFrames cloud/Lambda render (needs user approval/account).

## Rules for agents
- Briefs: INTRO_BRIEF.md, EPISODE_PREP_BRIEF.md, SIDEKICK_BRIEF.md.
- Heavy jobs via `collections/tools/heavy_slot.sh <whisper|render> <cmd>` (2 whisper, 3 render slots).
- Commit path-scoped: `git commit -m ... -- <paths>`; push with `git pull --rebase --autostash && git push`.
