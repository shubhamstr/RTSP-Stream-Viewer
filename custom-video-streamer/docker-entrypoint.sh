#!/usr/bin/env bash
set -e

# ==============================================================================
# Custom RTSP Video Streamer Entrypoint
# Starts MediaMTX RTSP relay and spawns FFmpeg publishers in continuous loops.
# ==============================================================================

CONFIG_FILE="${MTX_CONF:-/etc/mediamtx/mediamtx.yml}"
RTSP_PORT="${RTSP_PORT:-8554}"
PUBLISH_USER="${PUBLISH_USER:-publisher}"
PUBLISH_PASS="${PUBLISH_PASS:-publish_password_123}"

cleanup() {
    echo ""
    echo "================================================"
    echo "Shutting down custom video streamer services..."
    echo "================================================"
    kill $(jobs -p) 2>/dev/null || true
    wait $(jobs -p) 2>/dev/null || true
    echo "Shutdown complete."
    exit 0
}

trap cleanup SIGINT SIGTERM SIGHUP

echo "================================================"
echo "Starting MediaMTX RTSP Server..."
echo "Configuration: $CONFIG_FILE"
echo "================================================"

mediamtx "$CONFIG_FILE" &
MEDIAMTX_PID=$!

# Wait for MediaMTX RTSP port to be available
echo "Waiting for MediaMTX to bind on port $RTSP_PORT..."
READY=0
for i in $(seq 1 30); do
    if nc -z 127.0.0.1 "$RTSP_PORT" 2>/dev/null || (echo > "/dev/tcp/127.0.0.1/$RTSP_PORT") 2>/dev/null; then
        echo "MediaMTX is ready and listening on port $RTSP_PORT."
        READY=1
        break
    fi
    sleep 0.5
done

if [ "$READY" -ne 1 ]; then
    echo "Warning: MediaMTX port check timed out. Proceeding with stream publishers..."
fi

echo "================================================"
echo "Launching continuous FFmpeg stream publishers..."
echo "================================================"

# Helper function to launch an FFmpeg continuous loop stream
run_publisher() {
    local stream_name="$1"
    local video_file="$2"
    local video_bitrate="$3"
    local audio_args="$4"
    local target_url="rtsp://${PUBLISH_USER}:${PUBLISH_PASS}@127.0.0.1:${RTSP_PORT}/${stream_name}"

    (
        while true; do
            if [ ! -f "$video_file" ]; then
                echo "Error: Video file $video_file not found for stream [$stream_name]. Retrying in 5s..."
                sleep 5
                continue
            fi

            echo "Publishing stream [$stream_name] -> $target_url"
            # shellcheck disable=SC2086
            ffmpeg -re -stream_loop -1 -i "$video_file" \
                -c:v libx264 -pix_fmt yuv420p -preset ultrafast -tune zerolatency \
                -b:v "$video_bitrate" -g 25 $audio_args \
                -f rtsp -rtsp_transport tcp "$target_url" || true

            echo "Stream [$stream_name] publisher disconnected. Reconnecting in 2 seconds..."
            sleep 2
        done
    ) &
}

# Stream 1: Earth (1000k video, AAC audio)
run_publisher "earth" "/videos/earth.mp4" "1000k" "-c:a aac -b:a 64k"

# Stream 2: Road & Trees (1200k video, AAC audio)
run_publisher "road_and_trees" "/videos/road_and_trees.mp4" "1200k" "-c:a aac -b:a 64k"

# Stream 3: Watering Plant (1000k video, no audio)
run_publisher "watering_plant" "/videos/watering_plant.mp4" "1000k" "-an"

echo "================================================"
echo "All publishers started in background!"
echo "Available RTSP Streams (viewer:viewer_password_123):"
echo " - rtsp://<host>:8554/earth"
echo " - rtsp://<host>:8554/road_and_trees"
echo " - rtsp://<host>:8554/watering_plant"
echo "Available HLS Streams:"
echo " - http://<host>:8888/earth/index.m3u8"
echo " - http://<host>:8888/road_and_trees/index.m3u8"
echo " - http://<host>:8888/watering_plant/index.m3u8"
echo "MediaMTX REST API:"
echo " - http://<host>:9997/v3/paths/list"
echo "================================================"

# Keep container running and wait for MediaMTX
wait "$MEDIAMTX_PID"

