# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- Resume the bilingual order-types package through Gaia/NotebookLM with primary-source factual guardrails and recorded source provenance.
- Record the reviewed English scene timing, corrected transcript provenance, and verified bilingual article URLs for the order-types package.
- Bind NotebookLM production to the designated Gaia Camoufox account and record account verification before source generation.
- Record the continuous NotebookLM article-video queue and the same-chat progress/recovery policy, including Camoufox-only operation and duplicate checks.

## [1.0.0] - 2026-08-13

### Added

- Add one canonical cross-agent skill for the full NotebookLM-to-YouTube and blog workflow.
- Add tracked artifact, native-aspect, QA, publishing, and provenance contracts.
- Add explicit slide-start timelines and separate display and spoken narration copy.
- Support pre-rendered desktop and native vertical end cards.
- Add project versioning and a Keep a Changelog history.

### Changed

- Make independently generated 1080x1920 frames the default for slide-deck Shorts.
- Share the canonical skill with Claude Code through one project symlink.
- Keep landscape cutting as an explicit legacy path rather than the production default.

### Fixed

- Prevent partial OCR timelines from silently dropping known slide boundaries when manual starts are supplied.
- Document private-first uploads and retained Studio/public-state verification.
- Document that generated videos and audio must never be committed.

[Unreleased]: https://github.com/suenot/video-maker/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/suenot/video-maker/releases/tag/v1.0.0
