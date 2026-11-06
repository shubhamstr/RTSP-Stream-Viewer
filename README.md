# 📡 RTSP Video Stream Viewer

A modern full-stack web application for monitoring and viewing live **RTSP (Real-Time Streaming Protocol)** video streams directly in the browser.

The repository includes a **React + Vite** frontend with **MobX** state management, a **Node.js + Express** backend equipped with **Socket.IO** for real-time communication, and a **Dockerized test streaming stack** using **MediaMTX** and **FFmpeg** to simulate live RTSP video feeds out of the box without requiring physical IP cameras.

---

## 🏗️ Project Structure

```
RTSP-Video-Stream-Viewer/
├── client/                          # React + TypeScript frontend (Vite)
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Topbar.tsx       # Top navigation bar with theme toggle
│   │   │   │   ├── Sidebar.tsx      # Stream list with Active / All tabs
│   │   │   │   └── MainContent.tsx  # Responsive multi-stream player grid
│   │   │   ├── StreamCard/
│   │   │   │   └── StreamCard.tsx   # Sidebar stream item (activate / delete)
│   │   │   ├── StreamPlayer/
│   │   │   │   └── StreamPlayer.tsx # Video player card with fullscreen, PiP, reload
│   │   │   └── AddStreamModal/
│   │   │       └── AddStreamModal.tsx # Modal dialog to register new streams
│   │   ├── icons/
│   │   │   └── icons.tsx            # Inline SVG icons
│   │   ├── store/
│   │   │   └── AppStore.ts          # MobX singleton store (streams, theme, modal)
│   │   ├── types/
│   │   │   └── index.ts             # Shared TypeScript interfaces (Stream, Tab)
│   │   ├── App.tsx
│   │   ├── App.css
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── package.json
│   └── README.md
│
├── server/                          # Node.js + TypeScript backend (Express + Socket.IO)
│   ├── src/
│   │   ├── routes/
│   │   │   ├── health.ts            # Server health check (/api/health)
│   │   │   └── streams.ts           # Stream API endpoints (/api/streams)
│   │   ├── services/
│   │   │   └── socketService.ts     # Socket.IO connection and event handlers
│   │   └── index.ts                 # Express app initialization & HTTP/WS server listener
│   ├── .env.example                 # Environment variables template
│   ├── nodemon.json                 # Hot-reloading configuration
│   ├── tsconfig.json                # TypeScript compiler configuration
│   └── package.json
│
├── custom-video-streamer/           # Local RTSP test stream environment (Docker)
│   ├── docker-compose.yml           # MediaMTX RTSP relay + 3 FFmpeg video publishers
│   ├── mediamtx/
│   │   └── mediamtx.yml             # MediaMTX configuration (RTSP, HLS, WebRTC, API)
│   ├── scripts/
│   │   ├── start.bat / start.sh     # Quick start scripts (Windows & Unix)
│   │   └── stop.bat / stop.sh       # Stop scripts (Windows & Unix)
│   └── README.md                    # Streamer documentation & sample URLs
│
├── Skylark Labs - Full Stack Engineer Coding Test.pdf
└── README.md
```

---

## 🧰 Tech Stack

| Layer | Technologies | Description |
|---|---|---|
| **Frontend** | React 19, TypeScript, Vite 8 | Fast, modern client UI with HMR |
| **State Management** | MobX 7 + mobx-react-lite 5 | Reactive observable singleton pattern |
| **Backend** | Node.js, Express 4.21, TypeScript | REST API service with modular routing |
| **Real-Time** | Socket.IO 4.8 | Bidirectional event-driven communication |
| **Stream Server** | MediaMTX (`bluenviron/mediamtx`) | Zero-dependency RTSP/HLS/WebRTC streaming relay |
| **Transcoder / Feeds** | FFmpeg (`linuxserver/ffmpeg`) | Generates infinite live RTSP test loops in Docker |
| **Dev Tools** | nodemon, ts-node, ESLint 10, Docker Compose | Rapid local development and testing |

---

## ✨ Features

- ⚡ **Express + Socket.IO Backend**: Clean modular architecture with health status checks, stream route placeholders, and real-time Socket.IO connection management.
- 🎬 **Custom RTSP Stream Generator**: Docker Compose setup featuring MediaMTX and 3 synthetic live video feeds (Big Buck Bunny, Elephants Dream, Tears of Steel) looping continuously.
- 🌐 **HLS & RTSP Support**: MediaMTX provides both native RTSP (`rtsp://localhost:8554/...`) and browser-friendly HLS (`http://localhost:8888/.../index.m3u8`).
- 🔗 **Stream Management UI**: Add custom RTSP or HLS stream URLs with names via a clean modal interface.
- 🗂️ **Sidebar Filters**: Easily toggle between **Active** and **All** registered streams.
- 🟩 **Responsive Player Grid**: Dynamically adapts from single-camera focus to multi-stream 2-column layouts.
- ▶️ **Per-Player Controls**: Fullscreen mode, Picture-in-Picture (PiP), stream reload, settings, and one-click dismiss.
- 🌙 **Theme Support**: Seamless Dark and Light theme switching with app-wide observable styling.
- 🔒 **End-to-End TypeScript**: Strict typing across both client and server source files.

---

## 🎬 Out-of-the-Box Test Streams

The `custom-video-streamer` package provides 3 live test streams ready for development:

| Stream Name | RTSP Stream URL (Port 8554) | HLS Stream URL (Port 8888) |
|---|---|---|
| **Big Buck Bunny** | `rtsp://localhost:8554/bbb` | `http://localhost:8888/bbb/index.m3u8` |
| **Elephants Dream** | `rtsp://localhost:8554/elephants` | `http://localhost:8888/elephants/index.m3u8` |
| **Tears of Steel** | `rtsp://localhost:8554/tears` | `http://localhost:8888/tears/index.m3u8` |

- **MediaMTX REST API**: `http://localhost:9997/v3/paths/list`

---

## ⚙️ Prerequisites

Ensure you have the following installed on your machine:

- [Node.js](https://nodejs.org/) (`>= 18.x`)
- [npm](https://www.npmjs.com/) (`>= 9.x`)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) *(recommended, to run the test RTSP video streamer)*
- [FFmpeg](https://ffmpeg.org/download.html) *(required for local stream transcoding and inspection)*

---

### 📦 Installing FFmpeg on Windows (Recommended via Winget)

For local development and stream handling on Windows, installing FFmpeg via **Winget** is the simplest method—it automatically configures environment PATH variables and works seamlessly across PowerShell, Command Prompt, and Git Bash.

#### Step 1: Open PowerShell
Press <kbd>Win</kbd> + <kbd>X</kbd> and select **Terminal** or **PowerShell**. Verify Winget is present:
```powershell
winget --version
```

#### Step 2: Install FFmpeg
Run the official Gyan build package:
```powershell
winget install -e --id Gyan.FFmpeg
```

#### Step 3: Restart Terminal & Verify Installation
Close and reopen your terminal session, then verify:
```powershell
ffmpeg -version
```

#### Step 4: Verify Additional Utilities
Verify the bundled inspection and playback tools:
```powershell
ffprobe -version
ffplay -version
```

| Utility | Primary Purpose |
|---|---|
| `ffmpeg` | Core CLI engine to transcode, convert, demux, and stream video/audio |
| `ffprobe` | Inspect media metadata, stream codecs, framerates, and packet headers |
| `ffplay` | Simple media player to test and monitor raw streams and RTSP feeds |

---

## 🚀 Getting Started

Follow the steps below to run the complete environment locally.

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/RTSP-Video-Stream-Viewer.git
cd RTSP-Video-Stream-Viewer
```

---

### 2. Start the Test RTSP Video Streamer *(Optional but Recommended)*

Spin up the local MediaMTX RTSP relay and the 3 live FFmpeg video publishers:

**Windows:**
```bat
cd custom-video-streamer
scripts\start.bat
```

**Linux / macOS:**
```bash
cd custom-video-streamer
chmod +x scripts/start.sh
./scripts/start.sh
```

**Or directly via Docker Compose:**
```bash
cd custom-video-streamer
docker compose up -d
```

> **Note:** On the initial run, Docker will download the sample MP4s and start publishing them as infinite RTSP loops to MediaMTX.

---

### 3. Start the Backend Server

Open a new terminal:

```bash
cd server

# Install dependencies
npm install

# Configure environment variables
# Copy .env.example to .env
cp .env.example .env     # On Linux/macOS
copy .env.example .env   # On Windows PowerShell: Copy-Item .env.example .env

# Run server with hot-reload
npm run dev
```

- The server will start at: **http://localhost:4000**
- Health endpoint: **http://localhost:4000/api/health**
- Socket.IO server: listening on **ws://localhost:4000**

---

### 4. Start the Frontend Client

Open another terminal:

```bash
cd client

# Install dependencies
npm install

# Run Vite development server
npm run dev
```

- The web UI will open at: **http://localhost:5173**

---

## 🔧 Environment Variables

### Server (`server/.env`)

| Variable | Default Value | Description |
|---|---|---|
| `PORT` | `4000` | Port on which the Express and Socket.IO server listens |
| `CLIENT_ORIGIN` | `http://localhost:5173` | Allowed frontend origin for CORS policies |

---

## 🌐 API & Socket.IO Specification

### REST Endpoints

| Method | Endpoint | Description | Sample Response |
|---|---|---|---|
| `GET` | `/` | API status check | `{ "name": "RTSP Video Stream Viewer API", "version": "1.0.0", "status": "running" }` |
| `GET` | `/api/health` | Health and uptime | `{ "status": "ok", "uptime": 12.34, "timestamp": "2026-11-06T..." }` |
| `GET` | `/api/streams` | Streams endpoint | `{ "message": "Streams endpoint ready", "streams": [] }` |

### Socket.IO Events

The backend exposes a Socket.IO server on `ws://localhost:4000` (or `http://localhost:4000/socket.io/`).

| Event Name | Direction | Payload | Description |
|---|---|---|---|
| `connection` | Server | Socket instance | Triggered when a frontend client connects |
| `ping` | Client → Server | none / optional payload | Client health check request |
| `pong` | Server → Client | `{ timestamp: number }` | Server response to ping |
| `disconnect` | Server | Reason string | Triggered when client disconnects |

---

## 📋 Available Scripts

### Client (`/client`)

| Command | Description |
|---|---|
| `npm run dev` | Runs the Vite development server with Hot Module Replacement (HMR) |
| `npm run build` | Type-checks with `tsc` and creates a production bundle in `dist/` |
| `npm run preview` | Locally previews the production build output |
| `npm run lint` | Runs ESLint across all TypeScript and React files |

### Server (`/server`)

| Command | Description |
|---|---|
| `npm run dev` | Starts the Express + Socket.IO server with `nodemon` and `ts-node` |
| `npm run build` | Compiles TypeScript files to JavaScript in `dist/` |
| `npm start` | Runs the compiled server from `dist/index.js` |

### Custom Video Streamer (`/custom-video-streamer`)

| Command | Description |
|---|---|
| `scripts/start.bat` / `start.sh` | Starts MediaMTX and the 3 video loops in background containers |
| `scripts/stop.bat` / `stop.sh` | Stops all containers |
| `docker compose logs -f` | Follows logs from MediaMTX and FFmpeg publishers |

---

## 🗃️ State Management (MobX)

The client application utilizes a central **MobX observable singleton** (`AppStore`):

| Property / Method | Type | Description |
|---|---|---|
| `dark` | `boolean` | Current active theme (dark/light) |
| `tab` | `Tab` (`'active'` \| `'all'`) | Active filter in the sidebar |
| `modalOpen` | `boolean` | Visibility toggle for the "Add Stream" dialog |
| `streams` | `Stream[]` | Array of registered stream objects |
| `listedStreams` | *Getter* | Returns streams filtered by active tab |
| `displayedStreams` | *Getter* | Returns active and currently displayed streams for the grid |
| `addStream(name, url)` | *Action* | Adds a new stream and closes the modal |
| `deactivateStream(id)` | *Action* | Sets stream active/displayed status to `false` |
| `hideStream(id)` | *Action* | Hides stream from the active view grid |
| `deleteStream(id)` | *Action* | Removes a stream from the store entirely |

---

## 🛠️ Troubleshooting

| Problem | Cause | Solution |
|---|---|---|
| `connect ECONNREFUSED 127.0.0.1:4000` | Backend server not running | Ensure `npm run dev` is running inside the `server/` directory. |
| CORS policy error in browser | Origin mismatch | Verify `CLIENT_ORIGIN=http://localhost:5173` in `server/.env`. |
| Port 4000 or 8554 already in use | Conflicting service | Change `PORT` in `server/.env` or ports in `custom-video-streamer/docker-compose.yml`. |
| RTSP stream not opening | Test stream containers not running | Run `docker compose ps` inside `custom-video-streamer/` or start using `scripts/start.bat`. |
| Docker pull or MP4 download fails | Network/proxy issue | Ensure Docker Desktop has internet access to pull images and fetch sample clips. |

---

## 🗺️ Development Roadmap

- [x] **Component-based Layout**: Topbar, Sidebar, Responsive Main Grid, Add Stream Modal
- [x] **MobX State Store**: Observable reactive state management for streams, filters, and theme
- [x] **Theme Toggle**: Dark / Light theme support
- [x] **Express Backend**: Initial TypeScript server setup with CORS and Dotenv
- [x] **Socket.IO Integration**: WebSocket server initialization with heartbeat / ping-pong support
- [x] **Dockerized RTSP Stream Generator**: MediaMTX + FFmpeg stack for 3 synthetic video feeds
- [ ] **Stream Synchronization**: Sync streams between client and backend over Socket.IO / REST
- [ ] **Live RTSP Relay Player**: Transcode RTSP directly to low-latency HLS/WebSockets for in-browser playback
- [ ] **Stream Recording**: Record streams on demand to server disk storage
- [ ] **Authentication**: Support basic/digest auth for secure RTSP camera endpoints

---

## 📄 License

This project is created for demonstration and evaluation purposes.
