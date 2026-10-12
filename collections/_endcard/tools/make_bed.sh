#!/bin/bash
# Builds assets/bed.m4a (19.0 s instrumental bed) from the channel song
# collections/marketmaker-general/intro/song_raw.mp4 (git-ignored, regenerable via gaia).
# Song grid (measured by the intro build, see marketmaker-general/intro/src/10_setup.js):
# ~153.5 BPM, bar = 1.5636 s, bar n starts at 0.095 + n * 1.5636 s.
# Vocal-free sections, cross-checked with `hyperframes transcribe` (parakeet):
#   A  bars  0-4   0.000 -  6.349  ska intro, before "Buy low, sell high" (bar 4)
#   B  bars 28-32 43.876 - 50.130  instrumental break (last word ends 43.36)
#   C  bars 28-31 43.876 - 48.567  the break again, three bars
#   E  bar  40    62.639 - 64.000  final hit after "...of the sand" (ends 62.16)
# Every join sits on a downbeat with 15 ms fades; loudness -16 LUFS, -1.5 dBTP.
cd "$(dirname "$0")/.." || exit 1
SRC="${1:-../marketmaker-general/intro/song_raw.mp4}"
ffmpeg -y -loglevel error -i "$SRC" -filter_complex "
[0:a]aresample=48000,asplit=4[a][b][c][d];
[a]atrim=0:6.349,asetpts=PTS-STARTPTS,afade=t=out:st=6.334:d=0.015[s1];
[b]atrim=43.876:50.130,asetpts=PTS-STARTPTS,afade=t=in:d=0.015,afade=t=out:st=6.239:d=0.015[s2];
[c]atrim=43.876:48.567,asetpts=PTS-STARTPTS,afade=t=in:d=0.015,afade=t=out:st=4.676:d=0.015[s3];
[d]atrim=62.639:64.0,asetpts=PTS-STARTPTS,afade=t=in:d=0.015[s4];
[s1][s2][s3][s4]concat=n=4:v=0:a=1,
loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000,
afade=t=in:d=0.5,afade=t=out:st=18.0:d=0.9,apad=whole_dur=19.0,atrim=0:19.0[out]" \
  -map "[out]" -ac 2 -c:a aac -b:a 192k assets/bed.m4a && echo "assets/bed.m4a"
