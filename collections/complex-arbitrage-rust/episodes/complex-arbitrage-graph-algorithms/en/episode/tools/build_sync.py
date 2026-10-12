#!/usr/bin/env python3
"""Precompute narration sync data for the episode (deterministic, numpy only).

usage: python3 tools/build_sync.py [--audio PATH] [--subs PATH] [--out data/sync.json]

Writes data/sync.json:
  fps        30
  dur        audio duration (s)
  env        loudness envelope, one char per 1/30 s frame, "0".."9a".."z" (36 levels, 0 = silence)
  spk        speaker per frame: "c" crab (host A), "p" parrot (host B), "." nobody
  words      [[start, end, text, speaker]]  (speaker "c" / "p"), Whisper word timings
  phrases    [[start, end, speaker, first_word_index, last_word_index]]
  hosts      {"c": {...stats}, "p": {...}}

Diarization is deliberately simple: the two NotebookLM hosts differ in pitch,
so each phrase (words joined by gaps < 0.35 s inside one Whisper segment,
also split after . ? !)
gets the median F0 of its voiced frames and is split by 2-means on log F0.
The host who speaks more words is the crab (host A, the on-screen narrator).
"""
import argparse, json, math, os, subprocess, sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
EP = os.path.dirname(HERE)
EN = os.path.dirname(EP)
VM = os.path.abspath(os.path.join(EN, "..", "..", "..", "..", ".."))
DEF_AUDIO = os.path.join(VM, "input", "notebooklm-sources", "complex-arbitrage-graph-algorithms", "en", "audio.m4a")
DEF_SUBS = os.path.join(EN, "prep", "subtitles.json")
SR, FPS = 16000, 30
ALPH = "0123456789abcdefghijklmnopqrstuvwxyz"


def decode(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32)


def envelope(x):
    hop = SR // FPS  # 533 samples (16000/30 = 533.3 -> drift corrected by index math)
    n = int(len(x) * FPS / SR)
    out = np.zeros(n)
    for i in range(n):
        a = int(i * SR / FPS); b = int((i + 1) * SR / FPS)
        seg = x[a:b]
        out[i] = math.sqrt(float(np.mean(seg * seg)) + 1e-12)
    db = 20 * np.log10(out + 1e-9)
    lo, hi = np.percentile(db, 12), np.percentile(db, 99)
    v = np.clip((db - lo) / (hi - lo), 0, 1)
    # light smoothing (attack fast, release ~3 frames) so mouths do not flicker
    sm = np.zeros_like(v); acc = 0.0
    for i, q in enumerate(v):
        acc = q if q > acc else acc * 0.55 + q * 0.45
        sm[i] = acc
    return sm, hop


def f0_track(x):
    """10 ms hop, 40 ms window, normalised autocorrelation pitch 70..400 Hz. returns (f0 or 0, rms)."""
    win, hop = 640, 160
    lag_min, lag_max = SR // 400, SR // 70
    n = (len(x) - win) // hop
    f0 = np.zeros(n); rms = np.zeros(n)
    w = np.hanning(win).astype(np.float32)
    for i in range(n):
        s = x[i * hop: i * hop + win] * w
        r = math.sqrt(float(np.mean(s * s)))
        rms[i] = r
        if r < 0.01:
            continue
        spec = np.fft.rfft(s, 2 * win)
        ac = np.fft.irfft(spec * np.conj(spec))[:win]
        if ac[0] <= 0:
            continue
        ac = ac / ac[0]
        seg = ac[lag_min:lag_max]
        k = int(np.argmax(seg)); peak = seg[k]
        if peak > 0.45:
            f0[i] = SR / (k + lag_min)
    return f0, rms, hop


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--audio", default=DEF_AUDIO)
    ap.add_argument("--subs", default=DEF_SUBS)
    ap.add_argument("--out", default=os.path.join(EP, "data", "sync.json"))
    a = ap.parse_args()
    x = decode(a.audio)
    dur = len(x) / SR
    print("audio", round(dur, 3), "s", file=sys.stderr)
    env, _ = envelope(x)
    f0, rms, hop = f0_track(x)
    subs = json.load(open(a.subs, encoding="utf-8"))
    words = []
    for si, seg in enumerate(subs["segments"]):
        for w in seg.get("words", []):
            words.append([round(w["start"], 3), round(w["end"], 3), w["word"].strip(), si])
    # phrases
    phrases = []; cur = None
    for wi, (s, e, txt, si) in enumerate(words):
        prev_end_sentence = wi > 0 and words[wi - 1][2][-1:] in ".?!"
        if cur and si == cur[3] and s - cur[1] < 0.35 and not prev_end_sentence:
            cur[1] = e; cur[5] = wi
        else:
            if cur: phrases.append(cur)
            cur = [s, e, None, si, wi, wi]
        if cur[4] == wi: cur[1] = e
    if cur: phrases.append(cur)
    # median F0 per phrase
    meds = []
    for ph in phrases:
        i0, i1 = int(ph[0] * SR / hop), int(ph[1] * SR / hop)
        v = f0[i0:i1]; v = v[v > 0]
        meds.append(float(np.median(np.log(v))) if len(v) >= 5 else None)
    vals = np.array([m for m in meds if m is not None])
    c0, c1 = np.percentile(vals, 25), np.percentile(vals, 75)
    for _ in range(30):
        lab = np.abs(vals - c0) > np.abs(vals - c1)
        c0, c1 = vals[~lab].mean(), vals[lab].mean()
    thr = (c0 + c1) / 2
    labs = []
    for m in meds:
        labs.append(None if m is None else int(m > thr))
    # fill unknowns from neighbours (short "Right." phrases without enough voicing)
    for i in range(len(labs)):
        if labs[i] is None:
            j = i - 1
            while j >= 0 and labs[j] is None: j -= 1
            labs[i] = labs[j] if j >= 0 else 0
    # who talks more = crab
    cnt = [0, 0]
    for ph, l in zip(phrases, labs): cnt[l] += ph[5] - ph[4] + 1
    crab = 0 if cnt[0] >= cnt[1] else 1
    sp = lambda l: "c" if l == crab else "p"
    out_words, out_phr = [], []
    for ph, l in zip(phrases, labs):
        ph[2] = sp(l)
        out_phr.append([round(ph[0], 3), round(ph[1], 3), ph[2], ph[4], ph[5]])
        for wi in range(ph[4], ph[5] + 1):
            words[wi].append(ph[2])
    for s, e, txt, si, who in words:
        out_words.append([s, e, txt, who])
    nF = len(env)
    spk = ["."] * nF
    for s, e, who, _, _ in out_phr:
        for f in range(int(s * FPS), min(nF, int(math.ceil(e * FPS)) + 2)):
            spk[f] = who
    hosts = {}
    for k, l in (("c", crab), ("p", 1 - crab)):
        hz = math.exp(c1 if l == 1 else c0)
        hosts[k] = {"words": cnt[l], "medianF0Hz": round(hz, 1)}
    data = {
        "fps": FPS, "dur": round(dur, 3),
        "env": "".join(ALPH[int(round(v * 35))] for v in env),
        "spk": "".join(spk),
        "words": out_words, "phrases": out_phr, "hosts": hosts,
        "note": "generated by tools/build_sync.py; do not edit by hand",
    }
    os.makedirs(os.path.dirname(a.out), exist_ok=True)
    with open(a.out, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))
    print("words", len(out_words), "phrases", len(out_phr), "hosts", hosts, "->", a.out, os.path.getsize(a.out) // 1024, "KB", file=sys.stderr)


if __name__ == "__main__":
    main()
