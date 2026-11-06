#!/usr/bin/env bash
# ============================================================
# stop.sh – Tear down the custom RTSP video streamer stack
# ============================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

echo "🛑 Stopping Custom RTSP Video Streamer..."
cd "$ROOT_DIR"
docker compose down

echo "✅ All services stopped."

