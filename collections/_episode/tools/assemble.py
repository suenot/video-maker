#!/usr/bin/env python3
"""Assemble an episode: intro -> scene renders + narration -> end card.

usage: assemble.py [episode_dir] [--preview | --only <scene_id>] [--intro PATH|none] [--endcard PATH|none]

  (default)        full episode -> renders/episode_<lang>.mp4 (every scene must be rendered)
  --preview        intro + the rendered scenes from the start (contiguous prefix), narration cut to
                   that length, no end card unless --endcard is given -> renders/preview_<lang>.mp4
  --only <id>      one scene with its slice of the narration, no intro/end card -> renders/only_<id>.mp4
  --intro PATH     default <collection>/intro/renders/intro_<lang>.mp4 (any length; "none" to skip)
  --endcard PATH   default collections/_endcard/renders/endcard_<lang>.mp4 ("none" to skip)

Steps: concat the silent scene mp4s (stream copy) after checking each duration against scenes.json;
join intro -> body -> end card with 0.6 s wave wipes (ffmpeg xfade custom expression: a wavy foam
front sweeps left to right); audio = intro song, then the NotebookLM narration (starts when the
first wipe starts), then the end card's own audio; two-pass loudnorm to -14 LUFS / -1.5 dBTP;
H.264 CRF 18 + AAC 192k, 1920x1080, 30 fps; contact sheet next to the output.
"""
import json, os, subprocess, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from epcommon import COLLECTIONS, episode_from_args

XF = 0.6


def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        sys.exit("FAILED: " + " ".join(cmd[:8]) + " ...\n" + r.stderr[-2500:])
    return r


def dur(path):
    return float(run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path]).stdout.strip())


def has_audio(path):
    return "audio" in run(["ffprobe", "-v", "error", "-show_entries", "stream=codec_type", "-of", "csv=p=0", path]).stdout


def measure(inputs, afilt):
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats"] + inputs + ["-filter_complex", afilt + ",loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"], capture_output=True, text=True)
    m = json.loads(r.stderr[r.stderr.rfind("{"): r.stderr.rfind("}") + 1])
    return ("loudnorm=I=-14:TP=-1.5:LRA=11:linear=true:measured_I={input_i}:measured_TP={input_tp}:measured_LRA={input_lra}:"
            "measured_thresh={input_thresh}:offset={target_offset}").format(**m)


def opt(args, name):
    return args[args.index(name) + 1] if name in args else None


def main():
    ep, args = episode_from_args(sys.argv[1:])
    preview, only = "--preview" in args, opt(args, "--only")
    man = ep.manifest(); scenes = man["scenes"]
    sdir = os.path.join(ep.renders, "scenes")
    have = lambda s: os.path.exists(os.path.join(sdir, s["id"] + ".mp4"))
    intro_p = opt(args, "--intro") or os.path.join(ep.collection_dir, "intro", "renders", f"intro_{ep.lang}.mp4")
    end_p = opt(args, "--endcard") or (os.path.join(COLLECTIONS, "_endcard", "renders", f"endcard_{ep.lang}.mp4") if not preview else "none")
    if only:
        use = [s for s in scenes if s["id"] == only or s["id"].startswith(only + "_")]
        intro_p = end_p = "none"
    else:
        use = []
        for s in scenes:
            if not have(s): break
            use.append(s)
        if not preview and len(use) != len(scenes):
            sys.exit("missing scene renders: " + ", ".join(s["id"] for s in scenes if not have(s)) + "  (use --preview for a partial cut)")
    if not use: sys.exit("no rendered scenes")
    for p in (intro_p, end_p):
        if p != "none" and not os.path.exists(p): sys.exit("missing: " + p + "  (pass --intro/--endcard PATH or none)")
    # 1. body: check durations, concat
    os.makedirs(ep.renders, exist_ok=True)
    lst = os.path.join(ep.renders, "concat.txt")
    with open(lst, "w") as f:
        for s in use:
            p = os.path.join(sdir, s["id"] + ".mp4"); d = dur(p); want = s["end"] - s["start"]
            print(f"{s['id']:40s} {d:8.3f} s (want {want:.3f}){'' if abs(d - want) < 0.05 else '  <-- duration mismatch'}")
            f.write(f"file '{p}'\n")
    body = os.path.join(ep.renders, "body_silent.mp4")
    run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-an", "-c", "copy", body])
    a0, a1, bd = use[0]["start"], use[-1]["end"], dur(body)
    name = f"only_{use[0]['id']}.mp4" if only else (f"preview_{ep.lang}.mp4" if preview else f"episode_{ep.lang}.mp4")
    out = os.path.join(ep.renders, name)
    # 2. segments: (path, duration, kind)
    segs = []
    if intro_p != "none": segs.append((intro_p, dur(intro_p), "intro"))
    segs.append((body, bd, "body"))
    if end_p != "none": segs.append((end_p, dur(end_p), "end"))
    inputs, vf, af, alabels = [], [], [], []
    for p, d, kind in segs: inputs += ["-i", p]
    inputs += ["-ss", f"{a0:.3f}", "-t", f"{bd:.3f}", "-i", ep.audio]
    nar = len(segs)
    fr = "((W+240)*(1-P)-120+0.03*W*sin(Y/H*19+P*8)+0.015*W*sin(Y/H*47))"
    expr = f"if(lt(X,{fr}),B,if(lt(X,{fr}+0.014*W),if(eq(PLANE,0),235,128),A))"
    for i in range(len(segs)): vf.append(f"[{i}:v]fps=30,scale=1920:1080,format=yuv420p,setsar=1[v{i}]")
    cur, t, starts = "v0", segs[0][1], [0.0]
    for i in range(1, len(segs)):
        off = t - XF; starts.append(off)
        vf.append(f"[{cur}][v{i}]xfade=transition=custom:duration={XF}:offset={off:.3f}:expr='{expr}'[x{i}]"); cur = f"x{i}"
        t = off + segs[i][1]
    total = t
    for i, (p, d, kind) in enumerate(segs):
        st, ms = starts[i], int(starts[i] * 1000)
        src = f"[{nar}:a]" if kind == "body" else (f"[{i}:a]" if has_audio(p) else None)
        if src is None: continue
        chain = f"{src}aresample=48000,aformat=channel_layouts=stereo"
        if i > 0 and kind != "body": chain += f",afade=t=in:d={XF}"
        if i < len(segs) - 1: chain += f",afade=t=out:st={max(0, d - XF):.3f}:d={XF}" if kind != "body" else ""
        if ms: chain += f",adelay={ms}|{ms}"
        af.append(chain + f"[a{i}]"); alabels.append(f"[a{i}]")
    amix = ";".join(af) + ";" + "".join(alabels) + f"amix=inputs={len(alabels)}:normalize=0:duration=longest,atrim=0:{total:.3f}"
    vchain = ";".join(vf)
    ln = measure(inputs, amix)
    venc = ["-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", "-r", "30", "-movflags", "+faststart"]
    run(["ffmpeg", "-v", "error", "-y"] + inputs + ["-filter_complex", vchain + ";" + amix + "," + ln + "[a]", "-map", f"[{cur}]", "-map", "[a]"] + venc + ["-c:a", "aac", "-b:a", "192k", "-ar", "48000", out])
    od = dur(out)
    sheet = out.replace(".mp4", "_sheet.jpg")
    run(["ffmpeg", "-v", "error", "-y", "-i", out, "-vf", f"fps=1/{max(2, od / 48):.3f},scale=320:180,tile=8x6:padding=4:color=black", "-frames:v", "1", sheet])
    print(f"-> {out}  {od:.2f} s  ({' + '.join(f'{k} {d:.1f}s' for _, d, k in segs)}, audio {a0:.1f}-{a1:.1f} s)\n-> {sheet}")


if __name__ == "__main__":
    main()
