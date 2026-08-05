# Continuous Seedance storyboard — v2

This is one continuous chain, not 15 isolated start/end designs.

```text
K0 → K1 → K2 → … → K15

Scene 01: K0 → K1
Scene 02: K1 → K2
…
Scene 15: K14 → K15
```

For every Seedance job, upload exactly the adjacent anchors as the first and last frame, then use the matching scene prompt. After accepting a generated clip, extract its actual final frame and use that extracted frame as the next scene's start reference. This prevents the planned endpoint from diverging from the visible chain.

The video-model anchors contain no generated text. English titles, metrics, labels and source quotations must be composited in edit after animation, preserving the original NotebookLM information without asking Seedance to render typography.
