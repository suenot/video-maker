"""Generate Fusion .comp files.

The structure mirrors a comp exported from Resolve today (see
`.superpowers/sdd/reference/resolve_export.comp`), not the brief's assumed
shape and not documentation. Two things the reference corrected:

1. The output node serializes as `MediaOut1 = Saver { ... }`, not
   `MediaOut1 = MediaOut { ... }`.
2. The whole file is wrapped in `Composition { ... }`, not a bare
   `{ Tools = ordered() { ... } }`.

Fusion composites the matplotlib PNG sequence (Task 4's output) with motion
graphics on top of it: a brand background, the sequence, and a lower-third
title that fades in over the first ~0.5s via a BezierSpline.
"""

from pathlib import Path

from . import palette

FPS = 30

# The animation PNGs (Task 4) already render each scene's own title into the
# frame. Duplicating it in the comp's lower-third would put two titles on
# screen at once, which the brief explicitly forbids. None of the scenes'
# data_refs or narration supply a *different* short label worth adding (no
# section numbering, no subtitle field in the script schema), so the safest,
# least-invented choice is: no lower-third text for any scene. The Title node
# is still emitted (tests and Task 7 depend on its presence / fade rig), just
# with an empty StyledText. If a future pass wants per-scene subtitles, this
# is the single place to add them.
LOWER_THIRDS = {}


def _rgb(hex_color):
    h = hex_color.lstrip("#")
    return tuple(int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))


COMP_TEMPLATE = """Composition {{
    CurrentTime = 0,
    RenderRange = {{ 0, {last_frame} }},
    GlobalRange = {{ 0, {last_frame} }},
    RenderRangeStart = 0,
    RenderRangeEnd = {last_frame},
    HiQ = true,
    PlaybackUpdateMode = 0,
    StereoMode = false,
    Version = "DaVinci Resolve Studio 21.0.2.0004",
    SavedOutputs = 0,
    HeldTools = 0,
    DisabledTools = 0,
    LockedTools = 0,
    AudioOffset = 0,
    Resumable = true,
    OutputClips = {{
    }},
    Tools = {{
        Loader1 = Loader {{
            Clips = {{
                Clip {{
                    ID = "Clip1",
                    Filename = "{first_frame}",
                    FormatID = "PNGFormat",
                    StartFrame = 0,
                    LengthSetManually = true,
                    TrimIn = 0,
                    TrimOut = {last_frame},
                    Length = {n_frames},
                }}
            }},
            Inputs = {{
                ["Gamut.SLogVersion"] = Input {{ Value = FuID {{ "SLog2" }}, }},
                GlobalOut = Input {{ Value = {last_frame}, }},
                Loop = Input {{ Value = 1, }},
            }},
            ViewInfo = OperatorInfo {{ Pos = {{ -220, 0 }} }},
        }},
        Bg = Background {{
            Inputs = {{
                GlobalOut = Input {{ Value = {last_frame}, }},
                Width = Input {{ Value = 1920, }},
                Height = Input {{ Value = 1080, }},
                UseFrameFormatSettings = Input {{ Value = 1, }},
                ["Gamut.SLogVersion"] = Input {{ Value = FuID {{ "SLog2" }}, }},
                TopLeftRed = Input {{ Value = {bg_r}, }},
                TopLeftGreen = Input {{ Value = {bg_g}, }},
                TopLeftBlue = Input {{ Value = {bg_b}, }},
            }},
            ViewInfo = OperatorInfo {{ Pos = {{ -220, -60 }} }},
        }},
        Mrg1 = Merge {{
            Inputs = {{
                Background = Input {{ SourceOp = "Bg", Source = "Output", }},
                Foreground = Input {{ SourceOp = "Loader1", Source = "Output", }},
                PerformDepthMerge = Input {{ Value = 0, }},
            }},
            ViewInfo = OperatorInfo {{ Pos = {{ -60, 0 }} }},
        }},
        Title = TextPlus {{
            Inputs = {{
                GlobalOut = Input {{ Value = {last_frame}, }},
                Width = Input {{ Value = 1920, }},
                Height = Input {{ Value = 1080, }},
                UseFrameFormatSettings = Input {{ Value = 1, }},
                ["Gamut.SLogVersion"] = Input {{ Value = FuID {{ "SLog2" }}, }},
                Wrap = Input {{ Value = 1, }},
                LayoutRotation = Input {{ Value = 1, }},
                TransformRotation = Input {{ Value = 1, }},
                Font = Input {{ Value = "Open Sans", }},
                Style = Input {{ Value = "Bold", }},
                StyledText = Input {{ Value = "{lower_third}", }},
                Size = Input {{ Value = 0.035, }},
                Red1 = Input {{ Value = {fg_r}, }},
                Green1 = Input {{ Value = {fg_g}, }},
                Blue1 = Input {{ Value = {fg_b}, }},
                Softness1 = Input {{ Value = 1, }},
                Opacity1 = Input {{ SourceOp = "TitleFade", Source = "Value", }},
                VerticalJustificationNew = Input {{ Value = 3, }},
                HorizontalJustificationNew = Input {{ Value = 3, }},
                Center = Input {{ Value = {{ 0.5, 0.12 }}, }},
            }},
            ViewInfo = OperatorInfo {{ Pos = {{ -60, -60 }} }},
        }},
        TitleFade = BezierSpline {{
            SplineColor = {{ Red = 225, Green = 0, Blue = 225 }},
            NameSet = true,
            KeyFrames = {{
                [0] = {{ 0, RH = {{ {fade_rh}, 0.333 }}, Flags = {{ Linear = true }} }},
                [{fade_end}] = {{ 1, LH = {{ {fade_lh}, 0.667 }}, Flags = {{ Linear = true }} }}
            }}
        }},
        Mrg2 = Merge {{
            Inputs = {{
                Background = Input {{ SourceOp = "Mrg1", Source = "Output", }},
                Foreground = Input {{ SourceOp = "Title", Source = "Output", }},
                PerformDepthMerge = Input {{ Value = 0, }},
            }},
            ViewInfo = OperatorInfo {{ Pos = {{ 110, 0 }} }},
        }},
        MediaOut1 = Saver {{
            Inputs = {{
                Index = Input {{ Value = "0", }},
                Input = Input {{ SourceOp = "Mrg2", Source = "Output", }},
            }},
            ViewInfo = OperatorInfo {{ Pos = {{ 280, 0 }} }},
        }},
    }},
    Frames = {{
    }},
    Prefs = {{
        Comp = {{
            Interactive = {{
                Proxy = {{
                    Scale = 1,
                }},
            }},
            Views = {{
                View1 = {{
                }},
            }},
            FrameFormat = {{
                GuideRatio = 1.77777777777778,
                DepthFull = 3,
                DepthPreview = 3,
                DepthInteractive = 3,
            }},
            Unsorted = {{
                GlobalEnd = {last_frame}
            }},
            SpellCheck = {{
            }},
        }}
    }},
}}"""


def build_comp(scene, png_dir, n_frames, timings, lower_third=None):
    """Return the .comp text for a scene.

    png_dir holds the matplotlib sequence; Fusion's Loader reads it directly, so
    the frames never need to enter the media pool. timings is accepted for
    interface symmetry with the rest of the pipeline (Task 7 threads it
    through) but is not needed to build the comp text itself: n_frames is
    already the authoritative, measured frame count.
    """
    bg_r, bg_g, bg_b = _rgb(palette.BG)
    fg_r, fg_g, fg_b = _rgb(palette.FG)
    fade_end = min(15, max(1, n_frames - 1))  # ~0.5s at 30fps

    text = lower_third if lower_third is not None else LOWER_THIRDS.get(scene["id"], "")
    text = text.replace('"', "'")

    return COMP_TEMPLATE.format(
        first_frame=str(Path(png_dir) / "frame_00000.png"),
        n_frames=n_frames,
        last_frame=n_frames - 1,
        bg_r=bg_r, bg_g=bg_g, bg_b=bg_b,
        fg_r=fg_r, fg_g=fg_g, fg_b=fg_b,
        lower_third=text,
        fade_end=fade_end,
        fade_rh=fade_end / 3,
        fade_lh=fade_end * 2 / 3,
    )


def write_comp(scene, png_dir, n_frames, timings, out_path):
    out_path = Path(out_path)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(build_comp(scene, png_dir, n_frames, timings))
    return out_path
