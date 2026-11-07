# ==============================================================================
# Custom RTSP Video Streamer - Production Dockerfile
# Self-contained MediaMTX RTSP Server + FFmpeg publishers + loop videos
# ==============================================================================

# Stage 1: Retrieve compiled MediaMTX binary
FROM bluenviron/mediamtx:latest AS mediamtx-bin

# Stage 2: Runtime image with Alpine Linux and FFmpeg
FROM alpine:3.20

# Install FFmpeg, Bash, ca-certificates, and netcat for connectivity checks
RUN apk add --no-cache ffmpeg bash ca-certificates

# Copy MediaMTX executable
COPY --from=mediamtx-bin /mediamtx /usr/local/bin/mediamtx

# Set working directory
WORKDIR /app

# Copy MediaMTX configuration, sample videos, and entrypoint script
COPY mediamtx/mediamtx.yml /etc/mediamtx/mediamtx.yml
COPY videos /videos
COPY docker-entrypoint.sh /app/docker-entrypoint.sh

# Normalize CRLF line endings to LF and grant execution permissions
RUN sed -i 's/\r$//' /app/docker-entrypoint.sh && \
    chmod +x /app/docker-entrypoint.sh

# Expose ports:
# 8554 - RTSP TCP/UDP
# 8888 - HLS HTTP
# 9997 - MediaMTX REST API
EXPOSE 8554 8888 9997

ENTRYPOINT ["/app/docker-entrypoint.sh"]

