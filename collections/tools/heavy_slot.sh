#!/bin/bash
# Run a CPU-heavy command (whisper, hyperframes render) in one of N global slots.
# Usage: collections/tools/heavy_slot.sh <whisper|render> <command...>
# whisper: 2 slots, 4 threads each; render: 3 slots. Waits until a slot frees.
kind="$1"; shift
case "$kind" in
  whisper) n=2; export OMP_NUM_THREADS=4 MKL_NUM_THREADS=4 TORCH_NUM_THREADS=4 ;;
  render)  n=3 ;;
  *) echo "kind must be whisper|render" >&2; exit 2 ;;
esac
dir=/tmp/mm_heavy_slots; mkdir -p "$dir"
while true; do
  for i in $(seq 1 $n); do
    # lockf -t 0: fail immediately if busy; holds lock for the command's lifetime
    if lockf -s -t 0 "$dir/$kind.$i" "$@"; then exit 0; else rc=$?; [ $rc -ne 75 ] && exit $rc; fi
  done
  sleep 15
done
