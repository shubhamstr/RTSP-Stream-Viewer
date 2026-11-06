#!/usr/bin/env bash
# ============================================================
# start.sh – Bring up the custom RTSP video streamer stack
# ============================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

echo "🚀 Starting Custom RTSP Video Streamer..."
echo "   Working dir: $ROOT_DIR"

cd "$ROOT_DIR"

# Pull latest images silently
echo "📦 Pulling Docker images..."
docker compose pull --quiet

# Start the stack
echo "▶️  Starting services..."
docker compose up -d

echo ""
echo "✅ All services are up!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  RTSP Streams (viewer:viewer_password_123)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🌍 Earth          : rtsp://viewer:viewer_password_123@localhost:8554/earth"
echo "  🌲 Road & Trees   : rtsp://viewer:viewer_password_123@localhost:8554/road_and_trees"
echo "  🌱 Watering Plant : rtsp://viewer:viewer_password_123@localhost:8554/watering_plant"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  HLS Streams (play in browser / VLC)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🌐 http://localhost:8888/earth/index.m3u8"
echo "  🌐 http://localhost:8888/road_and_trees/index.m3u8"
echo "  🌐 http://localhost:8888/watering_plant/index.m3u8"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  MediaMTX REST API"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  📡 http://localhost:9997/v3/paths/list"
echo ""
echo "Run './scripts/stop.sh' to tear down."

