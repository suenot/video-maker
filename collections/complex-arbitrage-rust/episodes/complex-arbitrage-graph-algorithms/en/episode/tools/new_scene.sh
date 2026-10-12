#!/bin/bash
# usage: tools/new_scene.sh <scene_id>   (the id must already be in scenes.json)
# Copies scenes/_template/src into scenes/<id>/src.
set -e
cd "$(dirname "$0")/.."
ID="$1"
python3 -c "import json,sys;ids=[s['id'] for s in json.load(open('scenes.json'))['scenes']];sys.exit(0 if '$ID' in ids else 'not in scenes.json: $ID')"
[ -d "scenes/$ID/src" ] && { echo "scenes/$ID/src exists"; exit 1; }
mkdir -p "scenes/$ID" && cp -R scenes/_template/src "scenes/$ID/src"
echo "created scenes/$ID/src/50_scene.js"
