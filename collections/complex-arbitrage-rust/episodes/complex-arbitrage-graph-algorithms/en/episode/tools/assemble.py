#!/usr/bin/env python3
"""Assemble the episode from silent scene renders + the original narration audio.

usage:
  python3 tools/assemble.py              full episode -> renders/episode_en.mp4 (every scene must be rendered)
  python3 tools/assemble.py --preview    intro + the rendered scenes from the start (contiguous prefix),
                                         audio cut to that length -> renders/preview_en.mp4
  python3 tools/assemble.py --only <id>  one scene with its slice of the narration (no intro) -> renders/only_<id>.mp4

Steps: concat the scene mp4s (stream copy), check each duration against scenes.json,
put intro_en.mp4 in front with a 0.6 s wave wipe (ffmpeg xfade custom expression: a
wavy foam front sweeps left to right), mix the intro song with the narration
(narration starts when the wipe starts), two-pass loudnorm to -14 LUFS / -1.5 dBTP,
encode H.264 CRF 18 + AAC 192k, 1920x1080, 30 fps, and write a contact sheet.
"""
import json, os, subprocess, sys

EP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EN = os.path.dirname(EP)
VM = os.path.abspath(os.path.join(EN, "..", "..", "..", "..", ".."))
AUDIO = os.path.join(VM, "input", "notebooklm-sources", "complex-arbitrage-graph-algorithms", "en", "audio.m4a")
REN = os.path.join(EP, "renders")
XF = 0.6  # intro -> episode wipe


def run(cmd, **kw):
    r = subprocess.run(cmd, capture_output=True, text=True, **kw)
    if r.returncode != 0:
        sys.exit("FAILED: " + " ".join(cmd[:6]) + " ...\n" + r.stderr[-2000:])
    return r


def dur(path):
    return float(run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path]).stdout.strip())


def loudnorm_args(src_filter_inputs, filt):
    """first pass: measure; returns the second-pass loudnorm filter string"""
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats"] + src_filter_inputs + ["-filter_complex", filt + ",loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"], capture_output=True, text=True)
    txt = r.stderr[r.stderr.rfind("{"): r.stderr.rfind("}") + 1]
    m = json.loads(txt)
    return ("loudnorm=I=-14:TP=-1.5:LRA=11:linear=true:measured_I={input_i}:measured_TP={input_tp}:measured_LRA={input_lra}:"
            "measured_thresh={input_thresh}:offset={target_offset}").format(**m)


def main():
    args = sys.argv[1:]
    preview, only = "--preview" in args, None
    if "--only" in args: only = args[args.index("--only") + 1]
    man = json.load(open(os.path.join(EP, "scenes.json"), encoding="utf-8"))
    scenes = man["scenes"]
    sdir = os.path.join(REN, "scenes")
    have = lambda s: os.path.exists(os.path.join(sdir, s["id"] + ".mp4"))
    if only:
        use = [s for s in scenes if s["id"] == only or s["id"].startswith(only + "_")]
        intro = None
    else:
        use = []
        for s in scenes:
            if not have(s): break
            use.append(s)
        if not preview and len(use) != len(scenes):
            missing = [s["id"] for s in scenes if not have(s)]
            sys.exit("missing scene renders: " + ", ".join(missing) + "  (use --preview for a partial cut)")
        intro = os.path.normpath(os.path.join(EP, man["intro"]))
    if not use: sys.exit("no rendered scenes")
    # 1. check durations and concat (stream copy: every scene comes from the same renderer settings)
    lst = os.path.join(REN, "concat.txt")
    with open(lst, "w") as f:
        for s in use:
            p = os.path.join(sdir, s["id"] + ".mp4"); d = dur(p); want = s["end"] - s["start"]
            flag = "" if abs(d - want) < 0.05 else "  <-- duration mismatch"
            print(f"{s['id']:28s} {d:8.3f} s (want {want:.3f}){flag}")
            f.write(f"file '{p}'\n")
    body = os.path.join(REN, "body_silent.mp4")
    run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-an", "-c", "copy", body])
    a0, a1 = use[0]["start"], use[-1]["end"]
    bd = dur(body)
    name = f"only_{use[0]['id']}.mp4" if only else ("preview_en.mp4" if preview else "episode_en.mp4")
    out = os.path.join(REN, name)
    venc = ["-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", "-r", "30", "-movflags", "+faststart"]
    aenc = ["-c:a", "aac", "-b:a", "192k", "-ar", "48000"]
    if intro is None:
        inputs = ["-i", body, "-ss", f"{a0:.3f}", "-t", f"{bd:.3f}", "-i", AUDIO]
        afilt = "[1:a]aresample=48000,aformat=channel_layouts=stereo"
        ln = loudnorm_args(inputs, afilt)
        run(["ffmpeg", "-v", "error", "-y"] + inputs + ["-filter_complex", afilt + "," + ln + "[a]", "-map", "0:v", "-map", "[a]"] + venc + aenc + ["-shortest", out])
    else:
        idur = dur(intro); off = idur - XF
        inputs = ["-i", intro, "-i", body, "-ss", f"{a0:.3f}", "-t", f"{bd:.3f}", "-i", AUDIO]
        # wave wipe: foam front x = (W+240)*(1-P) - 120 + wobble; left of it = episode (B), a foam band, right = intro (A)
        fr = "((W+240)*(1-P)-120+0.03*W*sin(Y/H*19+P*8)+0.015*W*sin(Y/H*47))"
        expr = f"if(lt(X,{fr}),B,if(lt(X,{fr}+0.014*W),if(eq(PLANE,0),235,128),A))"
        vfilt = (f"[0:v]fps=30,format=yuv420p,setsar=1[iv];[1:v]fps=30,format=yuv420p,setsar=1[bv];"
                 f"[iv][bv]xfade=transition=custom:duration={XF}:offset={off:.3f}:expr='{expr}'[v]")
        afilt = (f"[0:a]aresample=48000,aformat=channel_layouts=stereo,afade=t=out:st={off:.3f}:d={XF}[ia];"
                 f"[2:a]aresample=48000,aformat=channel_layouts=stereo,adelay={int(off * 1000)}|{int(off * 1000)}[na];"
                 f"[ia][na]amix=inputs=2:normalize=0:duration=longest")
        ln = loudnorm_args(inputs, afilt)
        run(["ffmpeg", "-v", "error", "-y"] + inputs + ["-filter_complex", vfilt + ";" + afilt + "," + ln + "[a]", "-map", "[v]", "-map", "[a]"] + venc + aenc + [out])
    od = dur(out)
    sheet = out.replace(".mp4", "_sheet.jpg")
    step = max(2, od / 48)
    run(["ffmpeg", "-v", "error", "-y", "-i", out, "-vf", f"fps=1/{step:.3f},scale=320:180,tile=8x6:padding=4:color=black", "-frames:v", "1", sheet])
    print(f"-> {out}  {od:.2f} s  (audio {a0:.1f}-{a1:.1f} s)\n-> {sheet}")


if __name__ == "__main__":
    main()
