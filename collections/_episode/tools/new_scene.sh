#!/bin/bash
# usage: new_scene.sh [episode_dir] <scene_id>   (the id must already be in scenes.json)
# Copies the collection's scene template (<collection>/style/episode/template/50_scene.js),
# or the engine's generic one, into scenes/<id>/src/.
set -e
T="$(cd "$(dirname "$0")" && pwd)"
if [ -f "$1/scenes.json" ]; then cd "$1"; shift; fi
[ -f scenes.json ] || { echo "run inside an episode dir or pass it first"; exit 1; }
ID="$1"
python3 -c "import json,sys;ids=[s['id'] for s in json.load(open('scenes.json'))['scenes']];sys.exit(0 if '$ID' in ids else 'not in scenes.json: $ID')"
[ -d "scenes/$ID/src" ] && { echo "scenes/$ID/src exists"; exit 1; }
COLL="$(cd ../../../.. && pwd)"
TPL="$COLL/style/episode/template/50_scene.js"; [ -f "$TPL" ] || TPL="$T/../template/src/50_scene.js"
mkdir -p "scenes/$ID/src" && cp "$TPL" "scenes/$ID/src/50_scene.js"
echo "created scenes/$ID/src/50_scene.js from $TPL"
