# Project Overview: RTSP Video Stream Viewer

## 1. Purpose & Vision
The **RTSP Video Stream Viewer** is a full-stack web application designed to monitor and view live **Real-Time Streaming Protocol (RTSP)** video feeds directly within modern web browsers without requiring legacy browser plugins (such as ActiveX or Flash).

Browsers cannot natively render RTSP or raw RTP/H.264 streams via standard HTML5 `<video>` elements. To bridge this protocol barrier, this application accepts RTSP stream URLs, spawns backend transcoding processes (via FFmpeg) to convert video into a continuous sequence of MJPEG (Motion JPEG) frames, transmits these frames in real time over WebSockets (Socket.IO), and renders them onto HTML5 `<canvas>` elements on the client.

## 2. Business Domain & Use Cases
- **Surveillance & Security Monitoring**: Centralized viewing interface for IP cameras across premises, warehouses, or facilities.
- **Computer Vision & AI Ingestion Testing**: Tooling for engineers to preview and inspect live camera streams before or alongside AI inference pipelines.
- **IoT & Smart Infrastructure**: Monitoring feeds from embedded devices, drones, or automated machinery broadcasting RTSP streams.
- **Developer & Evaluator Sandboxing**: Includes a turnkey Dockerized test streaming setup (MediaMTX + FFmpeg) to simulate live RTSP camera feeds without physical hardware.

## 3. Target Users
- **System Administrators & Operators**: Monitoring multi-camera setups simultaneously in configurable grid views.
- **Full-Stack / Video Streaming Developers**: Integrating and testing RTSP camera endpoints and low-latency browser streaming pipelines.
- **Computer Vision Engineers**: Verifying feed stability, latency, frame integrity, and camera credentials.

## 4. Major Functionality
- **Stream Registration & Management**: Add, update, view, and delete RTSP camera feeds with optional authentication credentials (username/password).
- **Test Presets (MediaMTX)**: One-click addition and auto-population of pre-configured local test streams (Earth, Road & Trees, Watering Plant).
- **Real-Time MJPEG Canvas Player**: WebSocket-driven frame streaming rendering binary frames onto HTML5 `<canvas>` with live FPS counter.
- **Individual Stream Controls**: Play / Pause, reconnect/restart FFmpeg transcode, full-screen expansion, Picture-in-Picture (PiP), and configuration modal.
- **Adaptive Multi-Stream Layout**: Dynamic grid layout automatically transitioning between single-stream focus and two-column multi-camera layouts.
- **Sidebar Stream Filtering**: Quick toggle between "Active" and "All Streams" tabs with direct activate/deactivate toggles.
- **Theme Customization**: Global observable Dark and Light mode toggling.
- **Health Check & Diagnostics**: REST endpoint reporting server health, process uptime, and active stream metrics.
- **Enterprise Winston Logging**: Daily rotating log files (`combined-*.log`, `error-*.log`), request timing logs, credential redaction, and protected log access middleware.
- **Containerization & CI/CD**: Client multi-stage Docker build (`client/Dockerfile`) and GitHub Actions workflow deploying to AWS ECR and EC2.

## 5. Current Implementation Status
- **Status**: Functional prototype / MVP developed as a full-stack engineering solution (originally inspired by the Skylark Labs Full-Stack Engineer assessment).
- **Persistence**: **In-Memory Only**. Streams are stored in Node.js server memory (`Map<string, StreamItem>`) and client MobX store. No persistent database is attached yet.
- **Transcoding Engine**: Real-time server-side FFmpeg transcoding to MJPEG over pipe stdout.
- **Transport**: Socket.IO binary frame broadcasting over dedicated stream rooms (`stream:${id}`).
- **Local Relay Environment**: Docker Compose stack running MediaMTX and 3 FFmpeg infinite MP4 loop publishers.
- **Deployment Status**: Configured for local development with client Docker containerization and AWS ECR/EC2 deployment pipeline ([`.github/workflows/aws-deploy-client.yml`](file:///w:/shubham/personal/RTSP-Video-Stream-Viewer/.github/workflows/aws-deploy-client.yml)). Dedicated backend containerization is planned.

