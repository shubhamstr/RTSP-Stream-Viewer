# 📡 Custom RTSP Video Streamer

A self-contained Docker stack that spins up a local **RTSP server** (MediaMTX) and three **FFmpeg publishers** that loop public, royalty-free MP4 videos as live RTSP streams — perfect for testing your RTSP Video Stream Viewer without a physical IP camera.

---

## 🏗️ Stack Overview

| Service | Image | Role |
|---|---|---|
| `mediamtx` | `bluenviron/mediamtx:latest` | RTSP relay server + HLS remuxer |
| `ffmpeg-earth` | `linuxserver/ffmpeg:latest` | Publishes Earth MP4 loop (`videos/earth.mp4`) |
| `ffmpeg-road-and-trees` | `linuxserver/ffmpeg:latest` | Publishes Road & Trees loop (`videos/road_and_trees.mp4`) |
| `ffmpeg-watering-plant` | `linuxserver/ffmpeg:latest` | Publishes Watering Plant loop (`videos/watering_plant.mp4`) |

---

## 🎬 Test Streams

### RTSP (use in your app / VLC)

Authentication is enabled. Credentials: username `viewer`, password `viewer_password_123`.

| Stream | Authenticated URL |
|---|---|
| Earth | `rtsp://viewer:viewer_password_123@localhost:8554/earth` |
| Road & Trees | `rtsp://viewer:viewer_password_123@localhost:8554/road_and_trees` |
| Watering Plant | `rtsp://viewer:viewer_password_123@localhost:8554/watering_plant` |

### HLS (browser-friendly fallback)

| Stream | URL |
|---|---|
| Earth | `http://localhost:8888/earth/index.m3u8` |
| Road & Trees | `http://localhost:8888/road_and_trees/index.m3u8` |
| Watering Plant | `http://localhost:8888/watering_plant/index.m3u8` |

### MediaMTX REST API

```
http://localhost:9997/v3/paths/list
```

---

## 🚀 Quick Start

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (with Compose v2)
- Internet access on first run (to pull images and download the MP4 files)

### Start

**Windows (PowerShell / CMD):**
```bat
scripts\start.bat
```

**Linux / macOS / WSL:**
```bash
chmod +x scripts/start.sh
./scripts/start.sh
```

**Manual (from this folder):**
```bash
docker compose up -d
```

### Stop

```bash
# Windows
scripts\stop.bat

# Linux/macOS
./scripts/stop.sh

# Manual
docker compose down
```

### View Logs

```bash
# All services
docker compose logs -f

# Only FFmpeg publishers
docker compose logs -f ffmpeg-earth ffmpeg-road-and-trees ffmpeg-watering-plant

# Only MediaMTX
docker compose logs -f mediamtx
```

---

## 🗂️ Folder Structure

```
custom-video-streamer/
├── docker-compose.yml        # Defines all 4 services + bridge network
├── mediamtx/
│   └── mediamtx.yml          # MediaMTX server configuration
├── scripts/
│   ├── start.sh              # Linux/macOS start script
│   ├── start.bat             # Windows start script
│   ├── stop.sh               # Linux/macOS stop script
│   └── stop.bat              # Windows stop script
└── README.md
```

---

## ⚙️ How It Works

```
Google CDN (MP4 files)
       │
       │  HTTP download (loop)
       ▼
 ffmpeg-bbb / ffmpeg-elephants / ffmpeg-tears
       │
       │  RTSP publish  →  rtsp://mediamtx:8554/<path>
       ▼
   mediamtx (RTSP server)
       │
       ├──► RTSP consumers  →  rtsp://localhost:8554/<path>
       │
       └──► HLS remux       →  http://localhost:8888/<path>/index.m3u8
```

FFmpeg downloads each MP4 from Google's public sample bucket, encodes it with **H.264 + AAC** at 854×480/500 kbps, and loops it infinitely (`-stream_loop -1`). MediaMTX accepts the RTSP publish and re-serves it to any number of RTSP or HLS consumers.

---

## 🔧 Configuration

### Change video quality / resolution

Edit the FFmpeg entrypoint in [`docker-compose.yml`](docker-compose.yml):

| Flag | Default | Notes |
|---|---|---|
| `-b:v` | `500k` | Video bitrate |
| `-vf scale=` | `854:480` | Output resolution (W:H) |
| `-b:a` | `64k` | Audio bitrate |
| `-preset` | `ultrafast` | Encoding speed vs. quality |

### Add more streams

1. Add a new path in `mediamtx/mediamtx.yml` (under `paths:`).
2. Add a new `ffmpeg-<name>` service in `docker-compose.yml` pointing to any public MP4 URL.
3. Run `docker compose up -d`.

### Use a local MP4 file

Mount a local directory into the FFmpeg container and point `-i` at it:

```yaml
ffmpeg-local:
  ...
  volumes:
    - ./videos:/videos:ro
  entrypoint: >
    ffmpeg -re -stream_loop -1 -i /videos/my-clip.mp4 ... rtsp://mediamtx:8554/local
```

---

## 🛠️ Troubleshooting

| Problem | Solution |
|---|---|
| `connection refused` on RTSP | Wait 10-15 s for FFmpeg to download the MP4 and start publishing |
| `mediamtx` unhealthy | Check `docker compose logs mediamtx` |
| FFmpeg crashes immediately | Likely network issue; check internet access from the container |
| Port conflict | Change host-side ports in `docker-compose.yml` (left side of `port:`) |
| Slow to start | First run downloads the MP4 (100–300 MB); subsequent loops are instant |

---

## 📄 Video Sources (Public Domain / Creative Commons)

| Video | License |
|---|---|
| [Big Buck Bunny](https://peach.blender.org/) | Creative Commons 3.0 |
| [Elephants Dream](https://orange.blender.org/) | Creative Commons 3.0 |
| [Tears of Steel](https://mango.blender.org/) | Creative Commons 3.0 |

All served from Google's public GTV sample bucket.

