"""Render a scene's data animation to a PNG sequence.

Numbers are read from results.json through the scene's data_refs. Nothing here
may hardcode a statistic -- if a value is not in the data, it does not go on
screen. The converse also holds, and is enforced by tests: if a ref is resolved,
it must reach the canvas. A renderer that quietly drops a value ships a frame
that the narration contradicts.

Text lines are formatted through `line.format(**values)` so a script line can
carry `{spread_before:.3f}` instead of a typed-in number. One number, one source.
"""

from functools import lru_cache
from pathlib import Path

import matplotlib

matplotlib.use("Agg")

import matplotlib.pyplot as plt  # noqa: E402
import numpy as np  # noqa: E402

from . import palette  # noqa: E402
from .schema import resolve_data_ref  # noqa: E402

W, H, DPI = 1920, 1080, 100

NOMINAL_LEVEL = 0.90
# A bar is "on nominal" within this tolerance. Outside it, the direction matters:
# short of nominal is a broken promise (MISSED); over nominal is width you paid
# for (HIGHLIGHT). Colouring both failures the same would flatten the one
# distinction 08_conditional exists to make.
COVERAGE_TOL = 0.02

MONO = "DejaVu Sans Mono"

# Display names for data_ref keys. Absent keys fall back to the key itself.
LABELS = {
    "iid": "iid",
    "ar1": "AR(1)",
    "garch": "GARCH",
    "break": "break",
    "aci_garch": "ACI\non GARCH",
    "low": "low vol",
    "mid": "mid vol",
    "high": "high vol",
    "split_abs": "split\nabs",
    "split_norm": "split\nnorm",
    "cqr": "CQR",
    "split_abs_t": "split\nabs",
    "split_norm_t": "split\nnorm",
    "cqr_t": "CQR",
    "param_width": "parametric\nGaussian",
}


def scene_values(scene, results):
    """Resolve every data_ref for a scene into concrete numbers."""
    return {name: resolve_data_ref(ref, results) for name, ref in scene["data_refs"].items()}


def format_lines(scene, values):
    """Fill {placeholders} in a scene's lines from its resolved refs.

    A line with no placeholder renders unchanged.
    """
    return [line.format(**values) for line in scene["lines"]]


def _label(key):
    return LABELS.get(key, key.replace("_", " "))


def _coverage_color(value):
    if abs(value - NOMINAL_LEVEL) <= COVERAGE_TOL:
        return palette.COVERED
    return palette.MISSED if value < NOMINAL_LEVEL else palette.HIGHLIGHT


def _new_fig():
    fig = plt.figure(figsize=(W / DPI, H / DPI), dpi=DPI, facecolor=palette.BG)
    ax = fig.add_subplot(111, facecolor=palette.BG)
    for side in ("top", "right"):
        ax.spines[side].set_visible(False)
    for side in ("left", "bottom"):
        ax.spines[side].set_color(palette.MUTED)
    ax.tick_params(colors=palette.MUTED, labelsize=16)
    # bottom leaves room under the axes for the footnote _note draws in figure coords.
    fig.subplots_adjust(left=0.09, right=0.97, top=0.84, bottom=0.15)
    return fig, ax


def _ease(t):
    """Ease-out cubic: motion that settles rather than stops."""
    return 1 - (1 - t) ** 3


def _stagger(t, i, n, hold=0.6):
    """Alpha for item i of n, fading in over its own slice of the scene."""
    share = i / max(n, 1)
    return float(np.clip((t - share * hold) * 6, 0, 1))


def _title(ax, scene):
    ax.set_title(scene["title"], color=palette.FG, fontsize=40, weight="bold", pad=28)


# Figure-fraction y for footnotes. _new_fig reserves the space below the axes; a note
# in AXES fraction lands inside the plot box and strikes through the data it captions.
_NOTE_Y = 0.030


def _note(ax, text, t, appear=0.55):
    """A footnote that arrives late, once the chart has been read.

    Figure coords, below the axes, so it can never cross a bar or a curve.
    """
    alpha = float(np.clip((t - appear) * 5, 0, 1))
    if alpha <= 0:
        return
    box = ax.get_position()
    ax.figure.text((box.x0 + box.x1) / 2, _NOTE_Y, text, ha="center", va="bottom",
                   color=palette.MUTED, fontsize=17, alpha=alpha)


# --- the nominal line ----------------------------------------------------------------
#
# The dashed line at 0.90 is the promise every coverage chart is measured against, so it
# has to say so on screen. Its label needs somewhere to live that is not on top of a bar:
# a data x of len(bars) - 0.4 put it PAST the categorical xlim (x=2.58 against a limit of
# 2.5 on a 3-bar axis), i.e. off the canvas entirely, and 08 and 09 shipped a dashed line
# the viewer was never told the meaning of. Reserve a gutter to the right of the last bar
# and right-align the label into it in axes fraction: inside the axes for any bar count.
_NOMINAL_GUTTER = 1.0


def _nominal_line(ax, n_bars, label="nominal 90%"):
    ax.axhline(NOMINAL_LEVEL, color=palette.NOMINAL, linestyle="--", linewidth=2)
    ax.set_xlim(-0.5, n_bars - 0.5 + _NOMINAL_GUTTER)
    # x in axes fraction, y in data: the label tracks the line it names.
    ax.text(0.995, NOMINAL_LEVEL, label, transform=ax.get_yaxis_transform(),
            ha="right", va="bottom", color=palette.NOMINAL, fontsize=17)


# --- title card and bullets ----------------------------------------------------------


def _title_card(ax, scene, values, t):
    ax.axis("off")
    lines = scene.get("lines", [])
    y = 0.62 if lines else 0.5
    alpha = min(1.0, _ease(t) * 1.5)
    ax.text(0.5, y, scene["title"], color=palette.FG, fontsize=58, ha="center",
            va="center", weight="bold", alpha=alpha, transform=ax.transAxes)
    if not lines:
        return
    ax.plot([0.34, 0.66], [y - 0.10, y - 0.10], color=palette.HIGHLIGHT,
            linewidth=2, alpha=alpha, transform=ax.transAxes, clip_on=False)
    for i, line in enumerate(format_lines(scene, values)):
        ax.text(0.5, y - 0.20 - i * 0.09, line, color=palette.FG, fontsize=26,
                ha="center", va="center", family=MONO,
                alpha=_stagger(t, i, len(lines)), transform=ax.transAxes)


def _bullets(ax, scene, values, t):
    ax.axis("off")
    ax.text(0.07, 0.88, scene["title"], color=palette.FG, fontsize=44,
            weight="bold", va="center", transform=ax.transAxes)
    lines = format_lines(scene, values)
    n = len(lines)
    step = min(0.11, 0.70 / max(n, 1))
    size = 30 if n <= 6 else 26
    for i, line in enumerate(lines):
        ax.text(0.09, 0.74 - i * step, line, color=palette.FG, fontsize=size,
                va="center", family=MONO, alpha=_stagger(t, i, n),
                transform=ax.transAxes)


# --- coverage bars -------------------------------------------------------------------


def _coverage_bars(ax, scene, values, t):
    keys = list(values)
    grow = _ease(t)
    base = 0.80
    heights = [base + (values[k] - base) * grow for k in keys]
    colors = [_coverage_color(values[k]) for k in keys]

    ax.bar([_label(k) for k in keys], [h - base for h in heights], bottom=base,
           color=colors, width=0.55)
    _nominal_line(ax, len(keys))
    ax.set_ylim(base, 0.935)
    ax.set_ylabel("marginal coverage", color=palette.FG, fontsize=20)
    _title(ax, scene)

    for i, k in enumerate(keys):
        alpha = _stagger(t, i, len(keys), hold=0.5)
        ax.text(i, heights[i] + 0.002, f"{values[k]:.3f}", ha="center",
                color=colors[i], fontsize=20, weight="bold", alpha=alpha)
    _note(ax, "measured against known truth; nominal 90%", t)


# --- tercile drift -------------------------------------------------------------------


def _tercile_drift(ax, scene, values, t):
    order = [k for k in ("low", "mid", "high") if k in values]
    grow = _ease(t)
    base = 0.78
    heights = [base + (values[k] - base) * grow for k in order]
    colors = [_coverage_color(values[k]) for k in order]

    ax.bar([_label(k) for k in order], [h - base for h in heights], bottom=base,
           color=colors, width=0.5)
    _nominal_line(ax, len(order))
    ax.set_ylim(base, 0.975)
    ax.set_ylabel("coverage within volatility tercile", color=palette.FG, fontsize=20)
    _title(ax, scene)

    for i, k in enumerate(order):
        alpha = _stagger(t, i, len(order), hold=0.5)
        ax.text(i, heights[i] + 0.003, f"{values[k]:.3f}", ha="center",
                color=colors[i], fontsize=24, weight="bold", alpha=alpha)
        if values[k] < NOMINAL_LEVEL - COVERAGE_TOL and t > 0.45:
            shortfall = NOMINAL_LEVEL - values[k]
            callout = float(np.clip((t - 0.45) * 4, 0, 1))
            ax.annotate(
                f"you asked for 0.90\nyou are getting {values[k]:.3f}\n"
                f"{shortfall * 100:.0f} points short, in the regime\n"
                f"a position sizer needs it most",
                xy=(i - 0.22, values[k] - 0.006), xytext=(i, 0.876),
                color=palette.MISSED, fontsize=19, weight="bold", ha="center",
                va="center", alpha=callout,
                arrowprops=dict(arrowstyle="->", color=palette.MISSED, linewidth=2,
                                connectionstyle="arc3,rad=0.25", alpha=callout))

    # The spread is the scene's summary statistic, so it lands last.
    if "spread" in values:
        alpha = float(np.clip((t - 0.7) * 5, 0, 1))
        if alpha > 0:
            spread_color = (palette.MISSED if values["spread"] > 0.05 else palette.COVERED)
            ax.text(0.015, 0.965, f"spread across terciles  {values['spread']:.3f}",
                    transform=ax.transAxes, ha="left", va="top", family=MONO,
                    color=spread_color, fontsize=26, weight="bold", alpha=alpha)

    # 09_normalize carries the comparators that keep the win honest.
    footnotes = []
    if "cqr_spread" in values:
        footnotes.append(f"CQR spread {values['cqr_spread']:.3f} (untuned learners)")
    if "oracle_spread" in values:
        footnotes.append(f"oracle spread {values['oracle_spread']:.3f} = sampling-noise floor")
    if footnotes:
        _note(ax, "     |     ".join(footnotes), t, appear=0.78)


# --- break trajectory ----------------------------------------------------------------

# Which named curve gets which colour. The comparison is the point of both scenes:
# split_abs is the failure, everything else is the reference or the repair.
_CURVE_COLORS = {
    "split_abs": palette.MISSED,
    "oracle": palette.MUTED,
    "aci_fast": palette.COVERED,
}

# Curve legends want a sentence; the bar-tick LABELS want two short lines.
_CURVE_LABELS = {
    "split_abs": "split conformal (absolute score)",
    "oracle": "oracle (knows the true quantiles)",
    "aci_fast": "ACI, fastest gamma",
}

_SMOOTH_K = 21


def _smooth(y, k=_SMOOTH_K):
    """Centered moving average, for legibility only.

    The raw curve is drawn underneath at low opacity and the window is stated on the
    chart -- this is a reading aid over the drawn series, not a new statistic.
    """
    if len(y) < k:
        return y
    pad = k // 2
    return np.convolve(np.pad(y, pad, mode="edge"), np.ones(k) / k, mode="valid")

# Scalar refs, rendered in a panel that is visually separate from the curves.
# hole_depth is a mean of per-experiment minima across the 60 breaks -- it is NOT
# the minimum of the averaged curve on screen (those are ~0.40 and ~0.77). Labelling
# a curve's visible minimum with it would put a number on screen that the picture
# does not show. Hence the panel, and hence the explicit wording.
_SCALAR_PANEL = {
    "10_break": (
        "after the break",
        [("split_abs_post", "split conformal, first 60 steps after break", "{:.3f}", palette.MISSED),
         (None, "", "", None),
         (None, "mean hole depth across the 60 break experiments", "", palette.MUTED),
         (None, "(mean of per-experiment minima -- not this curve's minimum)", "", palette.MUTED),
         ("oracle_hole_depth", "    oracle", "{:.3f}", palette.MUTED),
         ("split_abs_hole_depth", "    split conformal", "{:.3f}", palette.MISSED)],
    ),
    "11_aci": (
        "the trade",
        [("aci_slow_post", "ACI slow, first 60 steps", "{:.3f}", palette.FG),
         ("aci_fast_post", "ACI fast, first 60 steps", "{:.3f}", palette.COVERED),
         (None, "", "", None),
         ("split_abs_width", "width vs oracle, split conformal", "{:.3f}x", palette.MISSED),
         ("aci_slow_width", "width vs oracle, ACI slow", "{:.3f}x", palette.FG),
         ("aci_fast_width", "width vs oracle, ACI fast", "{:.3f}x", palette.COVERED),
         (None, "width is flat in gamma -- the repair is nearly free", "", palette.MUTED),
         (None, "", "", None),
         ("aci_slow_frac_unbounded", "unbounded intervals, ACI slow", "{:.3f}", palette.FG),
         ("aci_fast_frac_unbounded", "unbounded intervals, ACI fast", "{:.3f}", palette.HIGHLIGHT),
         (None, "this is the real cost of large gamma, not width", "", palette.MUTED)],
    ),
}


def _scalar_panel(ax, scene, values, t):
    spec = _SCALAR_PANEL.get(scene["id"])
    if spec is None:
        return
    heading, rows = spec
    alpha = float(np.clip((t - 0.55) * 4, 0, 1))
    if alpha <= 0:
        return

    panel = ax.inset_axes([0.60, 0.04, 0.385, 0.44])
    panel.set_facecolor("#161a22")
    panel.patch.set_alpha(alpha)
    panel.set_xticks([])
    panel.set_yticks([])
    for side in panel.spines.values():
        side.set_color(palette.MUTED)
        side.set_alpha(alpha * 0.5)

    panel.text(0.04, 0.93, heading, transform=panel.transAxes, va="top",
               color=palette.FG, fontsize=19, weight="bold", alpha=alpha)
    step = 0.78 / max(len(rows), 1)
    for i, (key, text, fmt, color) in enumerate(rows):
        y = 0.79 - i * step
        if key is None:
            if text:
                panel.text(0.04, y, text, transform=panel.transAxes, va="top",
                           color=color, fontsize=14, alpha=alpha, style="italic")
            continue
        panel.text(0.04, y, text, transform=panel.transAxes, va="top",
                   color=palette.FG, fontsize=15, alpha=alpha)
        panel.text(0.96, y, fmt.format(values[key]), transform=panel.transAxes,
                   va="top", ha="right", family=MONO, color=color, fontsize=17,
                   weight="bold", alpha=alpha)


def _break_trajectory(ax, scene, values, t):
    rel = np.asarray(values["rel_time"], dtype=float)
    # Every list-valued ref that is not the time axis is a curve to draw and label.
    curves = {k: np.asarray(v, dtype=float) for k, v in values.items()
              if isinstance(v, list) and k != "rel_time"}

    n = max(2, int(len(rel) * _ease(t)))
    for key, series in curves.items():
        color = _CURVE_COLORS.get(key, palette.HIGHLIGHT)
        smoothed = _smooth(series)
        ax.plot(rel[:n], series[:n], color=color, linewidth=1.0, alpha=0.28)
        ax.plot(rel[:n], smoothed[:n], color=color, linewidth=3.0,
                label=_CURVE_LABELS.get(key, _label(key).replace("\n", " ")))
        if n > 2:
            ax.scatter([rel[n - 1]], [smoothed[n - 1]], s=70, color=color, zorder=5)

    ax.axhline(NOMINAL_LEVEL, color=palette.NOMINAL, linestyle="--", linewidth=2)
    ax.text(rel[0] + 8, NOMINAL_LEVEL + 0.012, "nominal 90%", color=palette.NOMINAL,
            fontsize=17)
    ax.axvline(0, color=palette.FG, linewidth=1.6, alpha=0.6)
    ax.text(8, 0.335, "the break", color=palette.FG, fontsize=18, alpha=0.8)

    ax.set_xlim(rel[0], rel[-1])
    ax.set_ylim(0.30, 1.02)
    ax.set_xlabel("steps relative to the break", color=palette.FG, fontsize=18)
    ax.set_ylabel("rolling coverage (60-step window)", color=palette.FG, fontsize=20)
    _title(ax, scene)

    legend = ax.legend(loc="lower left", fontsize=18, facecolor="#161a22",
                       edgecolor=palette.MUTED, framealpha=0.95)
    for text in legend.get_texts():
        text.set_color(palette.FG)
    ax.text(0.015, 0.965, f"bold = {_SMOOTH_K}-step moving average of the curve below it",
            transform=ax.transAxes, va="top", color=palette.MUTED, fontsize=15)

    _scalar_panel(ax, scene, values, t)


# --- residual quantile ---------------------------------------------------------------
#
# 02_why_sizing and 03_nonconformity are both `residual_quantile` and run back to back
# for nearly two minutes. One renderer for both would be two minutes of near-identical
# animation, which reads as a frozen render. They argue different things, so they get
# different pictures, keyed by scene id. Both are synthetic illustrations -- nothing
# measured is claimed here, and neither scene has data_refs.


@lru_cache(maxsize=1)
def _rq_sizing_series():
    """The synthetic series behind 02. Seeded, so every frame drew the same numbers;
    building it once per scene instead of once per frame costs nothing and saves ~1,700
    regenerations. Read-only: the frames slice it, never write to it."""
    rng = np.random.default_rng(11)
    n = 240
    x = np.arange(n)
    vol = 0.35 + 0.9 * np.exp(-((x - 150) ** 2) / (2 * 26 ** 2)) + 0.06 * rng.standard_normal(n)
    vol = np.clip(vol, 0.12, None)
    truth = np.cumsum(rng.standard_normal(n) * vol) * 0.22
    for arr in (x, vol, truth):
        arr.setflags(write=False)
    return n, x, vol, truth


def _rq_sizing(ax, scene, values, t):
    """02: a constant-width interval sizes biggest exactly when volatility spikes."""
    ax.axis("off")
    _title(ax, scene)

    n, x, vol, truth = _rq_sizing_series()
    half = 0.62  # the constant width a raw absolute-residual score buys you

    shown = max(2, int(n * _ease(t)))

    top = ax.inset_axes([0.06, 0.46, 0.90, 0.40])
    bot = ax.inset_axes([0.06, 0.10, 0.90, 0.28])
    for sub in (top, bot):
        sub.set_facecolor(palette.BG)
        for side in ("top", "right"):
            sub.spines[side].set_visible(False)
        for side in ("left", "bottom"):
            sub.spines[side].set_color(palette.MUTED)
        sub.tick_params(colors=palette.MUTED, labelsize=12)
        sub.set_xlim(0, n)
        sub.set_xticks([])

    top.fill_between(x[:shown], truth[:shown] - half, truth[:shown] + half,
                     color=palette.HIGHLIGHT, alpha=0.22)
    top.plot(x[:shown], truth[:shown], color=palette.FG, linewidth=1.8)
    top.set_ylim(truth.min() - 2.0, truth.max() + 2.0)
    top.set_ylabel("return + interval", color=palette.FG, fontsize=17)
    top.text(0.02, 0.9, "one interval width, forever", transform=top.transAxes,
             color=palette.HIGHLIGHT, fontsize=18)

    size = 1.0 / half  # size inversely to width -> constant width, constant size
    bot.fill_between(x[:shown], 0, np.full(shown, size), color=palette.MISSED, alpha=0.16)
    bot.plot(x[:shown], np.full(shown, size), color=palette.MISSED, linewidth=2.4)
    bot.plot(x[:shown], vol[:shown] * 2.0, color=palette.MUTED, linewidth=2.0,
             linestyle="--")
    bot.set_ylim(0, 3.4)
    bot.set_ylabel("position size", color=palette.FG, fontsize=17)
    bot.text(0.02, 0.86, "position size (constant)", transform=bot.transAxes,
             color=palette.MISSED, fontsize=17)
    bot.text(0.02, 0.66, "true volatility", transform=bot.transAxes,
             color=palette.MUTED, fontsize=17)

    if shown > 150:
        alpha = float(np.clip((shown - 150) / 40, 0, 1))
        for sub in (top, bot):
            sub.axvline(150, color=palette.MISSED, linewidth=1.5, alpha=alpha * 0.7)
        bot.annotate("volatility spikes,\nthe interval does not,\nso the sizer takes its\n"
                     "largest risk here",
                     xy=(150, size), xytext=(168, 2.3), color=palette.MISSED,
                     fontsize=18, weight="bold", alpha=alpha,
                     arrowprops=dict(arrowstyle="->", color=palette.MISSED, alpha=alpha))
    _note(ax, "illustration; the measured version of this failure is coming up",
          t, appear=0.8)


@lru_cache(maxsize=1)
def _rq_scores_series():
    """The 4000 residuals behind 03, and their absolute values. Seeded and identical on
    every frame, so they are drawn once. Read-only. The histogram itself still moves --
    the fold from signed to absolute is the animation."""
    rng = np.random.default_rng(7)
    resid = rng.standard_normal(4000)
    absolute = np.abs(resid)
    for arr in (resid, absolute):
        arr.setflags(write=False)
    return resid, absolute


def _rq_scores(ax, scene, values, t):
    """03: absolute residuals become a score distribution; the quantile is one of them."""
    resid, absolute = _rq_scores_series()

    _title(ax, scene)
    ax.set_yticks([])
    ax.set_ylabel("")

    # Phase 1: signed residuals. Phase 2: fold to |residual|. Phase 3: the quantile.
    fold = float(np.clip((t - 0.20) / 0.25, 0, 1))
    shown = resid * (1 - fold) + absolute * fold

    ax.hist(shown, bins=70, color=palette.HIGHLIGHT, alpha=0.55)
    ax.set_xlim(-4.2, 4.2)
    ax.set_xlabel("residual  ->  |residual| = nonconformity score",
                  color=palette.FG, fontsize=19)

    stage = "y - prediction" if fold < 0.5 else "|y - prediction|  (drop the sign)"
    ax.text(0.02, 0.93, stage, transform=ax.transAxes, color=palette.HIGHLIGHT,
            fontsize=24, family=MONO)

    sweep = float(np.clip((t - 0.5) / 0.35, 0, 1))
    if sweep > 0:
        q = float(np.quantile(absolute, 0.90 * _ease(sweep)))
        top = ax.get_ylim()[1]
        ax.axvline(q, color=palette.AMBER, linewidth=3.5, alpha=sweep)
        ax.text(q + 0.12, top * 0.80,
                f"the {0.90 * _ease(sweep) * 100:.0f}th percentile\nof the scores",
                color=palette.AMBER, fontsize=21, alpha=sweep)
        if sweep >= 1:
            ax.axvspan(-q, q, color=palette.AMBER, alpha=0.10)
            ax.text(0.5, 0.55, "interval = prediction  +/-  this one number",
                    transform=ax.transAxes, ha="center", color=palette.AMBER,
                    fontsize=26, family=MONO, weight="bold")

    _note(ax, "rank of a new score among the old ones is uniform -- that is combinatorics, "
              "not an assumption about returns", t, appear=0.85)


_RQ_VARIANTS = {
    "02_why_sizing": _rq_sizing,
    "03_nonconformity": _rq_scores,
}


def _residual_quantile(ax, scene, values, t):
    _RQ_VARIANTS.get(scene["id"], _rq_scores)(ax, scene, values, t)


# --- width scatter -------------------------------------------------------------------
#
# The brief drew this as scatter over dicts with "coverage"/"width_vs_oracle"/"in_band"
# keys. No such dict exists: every 12_width value is a float, so the brief's
# `if not isinstance(point, dict): continue` skipped all of them and produced a blank
# chart, silently. The honest methods have no per-method coverage in the refs -- being
# inside `band` IS the selection criterion of width_at_matched_coverage -- so plotting
# them against a coverage axis would mean inventing an x coordinate. Instead: widths as
# bars, and one coverage number line below for the only method that has a coverage ref,
# the parametric baseline, sitting outside the band.

_WIDTH_BARS = [
    ("split_abs", "Gaussian"),
    ("split_norm", "Gaussian"),
    ("cqr", "Gaussian"),
    ("split_abs_t", "Student t"),
    ("split_norm_t", "Student t"),
    ("cqr_t", "Student t"),
]


def _width_scatter(ax, scene, values, t):
    """Two stacked panels: what each method costs (top), and who is allowed to compete (bottom).

    The contrast only works if both halves are on screen at once. The parametric bar is
    the shortest one up top; the strip underneath is why that is not a win.
    """
    ax.axis("off")
    _title(ax, scene)

    bars = ax.inset_axes([0.07, 0.40, 0.90, 0.50])
    bars.set_facecolor(palette.BG)
    for side in ("top", "right"):
        bars.spines[side].set_visible(False)
    for side in ("left", "bottom"):
        bars.spines[side].set_color(palette.MUTED)
    bars.tick_params(colors=palette.MUTED, labelsize=15)

    keys = [(k, innov) for k, innov in _WIDTH_BARS if k in values]
    grow = _ease(t)
    base = 0.95

    labels = [f"{_label(k)}\n{innov}" for k, innov in keys]
    heights = [values[k] for k, _ in keys]
    colors = [palette.COVERED] * len(keys)

    has_param = "param_width" in values
    if has_param:
        labels.append(_label("param_width"))
        heights.append(values["param_width"])
        colors.append(palette.MISSED)

    xs = np.arange(len(labels), dtype=float)
    if has_param:
        xs[-1] += 0.7  # set the dishonest one apart from the honest group

    drawn = [base + (h - base) * grow for h in heights]
    bars.bar(xs, [d - base for d in drawn], bottom=base, color=colors, width=0.6)
    bars.set_xticks(xs)
    bars.set_xticklabels(labels, color=palette.FG, fontsize=15)
    bars.set_xlim(-0.7, xs[-1] + 0.7)

    bars.axhline(1.0, color=palette.NOMINAL, linestyle="--", linewidth=2)
    bars.text(-0.62, 1.003, "oracle width", color=palette.NOMINAL, fontsize=16)
    bars.set_ylim(base, 1.215)
    bars.set_ylabel("width vs oracle", color=palette.FG, fontsize=19)

    for i, h in enumerate(heights):
        alpha = _stagger(t, i, len(heights), hold=0.45)
        if h < 1.0:
            # Below the oracle line there is no room above the bar; go inside it.
            bars.text(xs[i], drawn[i] - 0.005, f"{h:.3f}x", ha="center", va="top",
                      color=palette.BG, fontsize=19, weight="bold", alpha=alpha)
        else:
            bars.text(xs[i], drawn[i] + 0.003, f"{h:.3f}x", ha="center", color=colors[i],
                      fontsize=19, weight="bold", alpha=alpha)

    if keys:
        alpha = float(np.clip((t - 0.35) * 4, 0, 1))
        if alpha > 0:
            honest = heights[:len(keys)]
            # split conformal is amber in 11_aci (its coverage breaks) and green here.
            # Both are true -- this chart is at matched coverage, so green means "allowed
            # to compete on width", not "coverage holds" -- but a viewer tracking colour
            # across two back-to-back scenes reads that as a contradiction unless the
            # chart says which question it is answering. So it says it.
            bars.text(np.mean(xs[:len(keys)]), 1.188,
                      "green = in the matched-coverage band, "
                      f"{(min(honest) - 1) * 100:.0f}-{(max(honest) - 1) * 100:.0f}% "
                      "wider than oracle.\nThat is the premium for a level that means what it says.",
                      ha="center", va="center", color=palette.COVERED, fontsize=17,
                      alpha=alpha)
    if has_param:
        alpha = float(np.clip((t - 0.5) * 4, 0, 1))
        if alpha > 0:
            bars.text(xs[-1], 1.075, "narrowest\non the chart", ha="center", va="center",
                      color=palette.MISSED, fontsize=18, weight="bold", alpha=alpha)

    if has_param and "param_cov" in values and "band" in values:
        _param_coverage_strip(ax, values, t)


def _param_coverage_strip(ax, values, t):
    """The parametric bar is the shortest above. This is why that is not efficiency."""
    alpha = float(np.clip((t - 0.6) * 4, 0, 1))
    if alpha <= 0:
        return
    lo, hi = float(values["band"][0]), float(values["band"][1])
    cov = float(values["param_cov"])

    strip = ax.inset_axes([0.07, 0.17, 0.90, 0.10])
    strip.set_facecolor(palette.BG)
    strip.set_yticks([])
    for side in ("top", "right", "left"):
        strip.spines[side].set_visible(False)
    strip.spines["bottom"].set_color(palette.MUTED)
    strip.spines["bottom"].set_alpha(alpha)
    strip.tick_params(colors=palette.MUTED, labelsize=14)

    # The parametric coverage sits below the band today. If a rerun ever puts it above,
    # (hi - cov) flips sign and the strip's x-axis silently inverts -- the marker would
    # read as over-covering while sitting on the left. Span whatever is actually there.
    left, right = min(cov, lo), max(cov, hi)
    pad = max((right - left) * 0.5, 0.005)
    strip.set_xlim(left - pad, right + pad)
    strip.set_ylim(0, 1)
    strip.axvspan(lo, hi, color=palette.COVERED, alpha=0.22 * alpha)
    strip.axvline(NOMINAL_LEVEL, color=palette.NOMINAL, linestyle="--", linewidth=1.6,
                  alpha=alpha)
    strip.text((lo + hi) / 2, 0.52,
               f"matched-coverage band [{lo:.3f}, {hi:.3f}]\nthe six honest methods qualify here",
               ha="center", va="center", color=palette.COVERED, fontsize=16, alpha=alpha)
    strip.scatter([cov], [0.5], s=340, marker="X", color=palette.MISSED, alpha=alpha,
                  zorder=5)
    strip.annotate(f"parametric Gaussian: {cov:.3f}\nit does not qualify",
                   xy=(cov, 0.5), xytext=(cov - pad * 0.08, 0.5), ha="right",
                   va="center", color=palette.MISSED, fontsize=17, weight="bold",
                   alpha=alpha)
    strip.set_xlabel("marginal coverage", color=palette.FG, fontsize=17)

    ax.text(0.5, 0.0, "Its narrowness is not efficiency. "
                        "It is under-coverage wearing efficiency's clothes.",
            transform=ax.transAxes, ha="center", va="bottom", color=palette.MISSED,
            fontsize=19, alpha=alpha)


_RENDERERS = {
    "title_card": _title_card,
    "bullets": _bullets,
    "coverage_bars": _coverage_bars,
    "tercile_drift": _tercile_drift,
    "break_trajectory": _break_trajectory,
    "residual_quantile": _residual_quantile,
    "width_scatter": _width_scatter,
}


def render_scene(scene, results, duration, out_dir, fps=30):
    """Render a scene to out_dir/frame_%05d.png. Returns the frame count."""
    visual = scene["visual"]
    if visual not in _RENDERERS:
        raise ValueError(f"unknown visual {visual!r}")
    if visual == "bullets" and not scene.get("lines"):
        raise ValueError(f"scene {scene['id']!r} has visual 'bullets' but no 'lines'")

    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    values = scene_values(scene, results)
    n_frames = round(duration * fps)
    render = _RENDERERS[visual]

    for i in range(n_frames):
        t = (i + 1) / n_frames
        fig, ax = _new_fig()
        render(ax, scene, values, t)
        fig.savefig(out_dir / f"frame_{i:05d}.png", facecolor=palette.BG)
        plt.close(fig)

    return n_frames
