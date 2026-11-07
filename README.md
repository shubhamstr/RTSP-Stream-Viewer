# 📡 RTSP Video Stream Viewer

A modern full-stack web application for monitoring and viewing live **RTSP (Real-Time Streaming Protocol)** video streams directly in the browser.

The repository includes a **React + Vite** frontend with **MobX** state management, a **Node.js + Express** backend equipped with **Socket.IO** for real-time communication, and a **Dockerized test streaming stack** using **MediaMTX** and **FFmpeg** to simulate live RTSP video feeds out of the box without requiring physical IP cameras.

---

## 🏗️ Project Structure

```
RTSP-Video-Stream-Viewer/
├── .ai/                             # AI knowledge base, rules & documentation
│   ├── AI_RULES.md                  # Permanent coding & operational rules
│   ├── AI_TASK_PROMPT.md            # Phased prompt template for AI tasks
│   ├── API.md                       # REST API & Socket.IO specifications
│   ├── ARCHITECTURE.md              # System design & video pipeline
│   ├── CODING_STANDARDS.md          # Coding style & implementation patterns
│   ├── DATABASE.md                  # In-memory data schema & roadmap
│   ├── DEVELOPMENT.md               # Setup, scripts, and deployment guide
│   ├── FEATURES.md                  # Feature inventory & implementation map
│   ├── NEW_FEATURE_PROMPT.md        # Prompt template for new features
│   ├── PROJECT.md                   # Purpose, use cases & scope
│   ├── SECURITY.md                  # Security posture & threat analysis
│   ├── TECH_STACK.md                # Dependencies & technology rationale
│   └── usage_guide.txt              # Example prompts for AI assistants
│
├── .github/
│   └── workflows/
│       └── aws-deploy-client.yml    # CI/CD pipeline for client on AWS ECR/EC2
│
├── client/                          # React + TypeScript frontend (Vite)
│   ├── public/
│   ├── src/
│   │   ├── assets/                  # Media assets (hero.png, svgs)
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Topbar.tsx       # Top navigation bar with theme toggle
│   │   │   │   ├── Sidebar.tsx      # Stream list with Active / All tabs
│   │   │   │   └── MainContent.tsx  # Responsive multi-stream player grid
│   │   │   ├── StreamCard/
│   │   │   │   └── StreamCard.tsx   # Sidebar stream item (activate / delete)
│   │   │   ├── StreamPlayer/
│   │   │   │   └── StreamPlayer.tsx # Canvas video player with FPS, PiP, fullscreen
│   │   │   └── AddStreamModal/
│   │   │       └── AddStreamModal.tsx # Modal dialog to register streams or presets
│   │   ├── config/                  # env.ts (environment variables)
│   │   ├── constants/               # presets.ts (MediaMTX test presets)
│   │   ├── hooks/                   # useApi.ts custom hook
│   │   ├── icons/                   # icons.tsx (inline SVG icons)
│   │   ├── services/                # api.ts, apiHandler.ts, socketService.ts
│   │   ├── store/                   # AppStore.ts (MobX central singleton)
│   │   ├── types/                   # index.ts (TypeScript interfaces)
│   │   ├── utils/                   # error.ts, url.ts
│   │   ├── App.tsx
│   │   ├── App.css
│   │   ├── main.tsx
│   │   └── index.css
│   ├── Dockerfile                   # Multi-stage production container build
│   ├── .dockerignore
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── package.json
│   └── README.md                    # Client documentation
│
├── server/                          # Node.js + TypeScript backend (Express + Socket.IO)
│   ├── logs/                        # Rotational logs (combined-*.log, error-*.log)
│   ├── src/
│   │   ├── routes/
│   │   │   ├── health.ts            # Server health check (/api/health)
│   │   │   └── streams.ts           # Stream API endpoints (/api/streams)
│   │   ├── services/
│   │   │   ├── logger.ts            # Winston logger & protection middleware
│   │   │   ├── socketService.ts     # Socket.IO connection & event handlers
│   │   │   └── streamManager.ts     # FFmpeg child process & MJPEG demuxer
│   │   ├── types/
│   │   │   └── stream.ts            # TypeScript interfaces (StreamItem, DTOs)
│   │   └── index.ts                 # Express app initialization & server listener
│   ├── .env.example                 # Environment variables template
│   ├── nodemon.json                 # Hot-reloading configuration
│   ├── tsconfig.json                # TypeScript compiler configuration
│   ├── package.json
│   └── README.md                    # Server documentation
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
| **Logging** | Winston 3.19 + winston-daily-rotate-file | Structured file/console logging with daily rotation & credential masking |
| **Stream Server** | MediaMTX (`bluenviron/mediamtx`) | Zero-dependency RTSP/HLS/WebRTC streaming relay |
| **Transcoder / Feeds** | FFmpeg (`linuxserver/ffmpeg`) | Generates infinite live RTSP test loops in Docker |
| **Dev & CI/CD Tools** | nodemon, ts-node, ESLint 10, Docker, GitHub Actions | Local development and automated AWS deployment pipeline |

---

## ✨ Features

- ⚡ **Express + Socket.IO Backend**: Clean modular architecture with health status checks, stream route placeholders, and real-time Socket.IO connection management.
- 🎬 **Custom RTSP Stream Generator**: Docker Compose setup featuring MediaMTX and 3 synthetic live video feeds (Earth, Road & Trees, Watering Plant) looping continuously from pre-bundled video assets.
- 🌐 **HLS & RTSP Support**: MediaMTX provides both native RTSP (`rtsp://localhost:8554/...`) and browser-friendly HLS (`http://localhost:8888/.../index.m3u8`).
- 🔗 **Stream Management UI**: Add custom RTSP or HLS stream URLs with names via a clean modal interface.
- 🗂️ **Sidebar Filters**: Easily toggle between **Active** and **All** registered streams.
- 🟩 **Responsive Player Grid**: Dynamically adapts from single-camera focus to multi-stream 2-column layouts.
- ▶️ **Per-Player Controls**: Fullscreen mode, Picture-in-Picture (PiP), stream reload, settings, and one-click dismiss.
- 🌙 **Theme Support**: Seamless Dark and Light theme switching with app-wide observable styling.
- 📝 **Structured Winston Logging**: Production-grade daily rotating logs (`combined-*.log`, `error-*.log`), request timing middleware, log protection (`403 Forbidden` for direct `/logs` access), and automatic credential masking.
- 🚀 **Docker & AWS Deployment**: Containerized client Dockerfile and GitHub Actions workflow targeting AWS ECR and EC2.
- 🔒 **End-to-End TypeScript**: Strict typing across both client and server source files.

---

## 🎬 Out-of-the-Box Test Streams

The `custom-video-streamer` package provides 3 live test streams ready for development (with authentication credentials: username `viewer`, password `viewer_password_123`):

| Stream Name | RTSP Stream URL (Port 8554) | HLS Stream URL (Port 8888) |
|---|---|---|
| **Earth** | `rtsp://viewer:viewer_password_123@localhost:8554/earth` | `http://localhost:8888/earth/index.m3u8` |
| **Road & Trees** | `rtsp://viewer:viewer_password_123@localhost:8554/road_and_trees` | `http://localhost:8888/road_and_trees/index.m3u8` |
| **Watering Plant** | `rtsp://viewer:viewer_password_123@localhost:8554/watering_plant` | `http://localhost:8888/watering_plant/index.m3u8` |

- **MediaMTX REST API**: `http://localhost:9997/v3/paths/list`

---

## ⚙️ Prerequisites

Ensure you have the following installed on your machine:

- [Node.js](https://nodejs.org/) (`>= 18.x`)
- [npm](https://www.npmjs.com/) (`>= 9.x`)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) *(recommended, to run the test RTSP video streamer)*
- [FFmpeg](https://ffmpeg.org/download.html) *(recommended for local stream transcoding and inspection; the backend also includes bundled `ffmpeg-static` as an automatic fallback)*

---

### 📦 Installing FFmpeg

#### Windows (Recommended via Winget or Chocolatey)
```powershell
# Using Windows Package Manager (Winget)
winget install -e --id Gyan.FFmpeg

# Or using Chocolatey
choco install ffmpeg
```

#### macOS (via Homebrew)
```bash
brew install ffmpeg
```

#### Linux (Debian / Ubuntu)
```bash
sudo apt update && sudo apt install -y ffmpeg
```

#### Verification
Verify the installation by running:
```bash
ffmpeg -version
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

Follow the steps below to run the complete environment locally from scratch.

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/RTSP-Video-Stream-Viewer.git
cd RTSP-Video-Stream-Viewer
```

---

### 2. Start the Test RTSP Video Streamer *(Optional but Recommended)*

Spin up the local MediaMTX RTSP relay and the 3 live FFmpeg video publishers (Earth, Road & Trees, and Watering Plant):

**Windows (CMD or PowerShell):**
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

> **Note:** The 3 looping test videos (`earth.mp4`, `road_and_trees.mp4`, `watering_plant.mp4`) are already pre-packaged in `custom-video-streamer/videos/`. MediaMTX and FFmpeg publishers will start broadcasting immediately.

---

### 3. Start the Backend Server

Open a new terminal window:

```bash
cd server

# 1. Install dependencies
npm install

# 2. Configure environment variables (copy template)
# On Linux / macOS:
cp .env.example .env

# On Windows (Command Prompt):
copy .env.example .env

# On Windows (PowerShell):
Copy-Item .env.example .env

# 3. Run server in development mode (hot-reloading)
npm run dev
```

- REST API server: **http://localhost:4000**
- Health endpoint: **http://localhost:4000/api/health**
- Socket.IO server: **ws://localhost:4000**

---

### 4. Start the Frontend Client

Open another terminal window:

```bash
cd client

# 1. Install dependencies
npm install

# 2. Configure environment variables (copy template)
# On Linux / macOS:
cp .env.example .env

# On Windows (Command Prompt):
copy .env.example .env

# On Windows (PowerShell):
Copy-Item .env.example .env

# 3. Run Vite development server
npm run dev
```

- The client web UI will open at: **http://localhost:5173**
- Connect to demo streams directly via the **"Default Options"** column in the **"Add RTSP Stream"** modal dialog.

---

## 🔧 Environment Variables

### Backend Server (`server/.env`)

| Variable | Default Value | Description |
|---|---|---|
| `PORT` | `4000` | Port on which the Express and Socket.IO server listens |
| `CLIENT_ORIGIN` | `http://localhost:5173` | Allowed frontend origin for CORS policies |
| `FFMPEG_PATH` | *(unset)* | Path to custom FFmpeg binary (optional fallback) |

### Frontend Client (`client/.env`)

| Variable | Default Value | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:4000` | Backend REST API base URL |
| `VITE_WS_URL` | `ws://localhost:4000` | Backend WebSocket connection string |

---

## 🌐 API & Socket.IO Specification

### REST Endpoints

All REST routes are prefixed with `/api` and return standardized JSON responses:

| Method | Endpoint | Description | Sample Response |
|---|---|---|---|
| `GET` | `/` | API status check & stream metrics | `{ "name": "RTSP Video Stream Viewer API", "version": "1.0.0", "status": "running", "activeStreams": 1, "totalStreams": 3 }` |
| `GET` | `/api/health` | Health and server uptime | `{ "status": "ok", "uptime": 12.34, "timestamp": "2026-11-06T..." }` |
| `GET` | `/api/streams` | Fetch all registered streams | `{ "success": true, "streams": [...], "count": 3 }` |
| `GET` | `/api/streams/:id` | Fetch details of a single stream | `{ "success": true, "stream": { "id": "1", "name": "Earth", ... } }` |
| `POST` | `/api/streams` | Register a new RTSP/HTTP stream | `{ "success": true, "message": "Stream added successfully", "stream": {...} }` |
| `POST` | `/api/streams/:id/start` | Start live FFmpeg transcode & pipe | `{ "success": true, "message": "Stream 1 started", "stream": {...} }` |
| `POST` | `/api/streams/:id/stop` | Stop streaming and terminate FFmpeg | `{ "success": true, "message": "Stream 1 stopped", "stream": {...} }` |
| `PATCH` | `/api/streams/:id` | Update stream metadata or active state | `{ "success": true, "message": "Stream updated successfully", "stream": {...} }` |
| `DELETE` | `/api/streams/:id` | Remove a stream from the server | `{ "success": true, "message": "Stream 1 removed", "id": "1" }` |

### Socket.IO Events

The backend exposes a Socket.IO WebSocket server on `ws://localhost:4000` (path `/socket.io/`):

| Event Name | Direction | Payload | Description |
|---|---|---|---|
| `connection` | Server | Socket instance | Triggered when a frontend client connects |
| `ping` | Client → Server | none | Client heartbeat / health ping |
| `pong` | Server → Client | `{ timestamp: number }` | Server heartbeat response |
| `stream:get_all` | Client → Server | none | Request snapshot of all streams |
| `stream:list` | Server → Client | `StreamItem[]` | Broadcast array of registered streams |
| `stream:join` | Client → Server | `{ streamId: string }` | Subscribe socket to room `stream:${id}` |
| `stream:leave` | Client → Server | `{ streamId: string }` | Unsubscribe socket from room `stream:${id}` |
| `stream:start` | Client → Server | `{ streamId: string }` | Request server to start transcoding feed |
| `stream:stop` | Client → Server | `{ streamId: string }` | Request server to stop transcoding feed |
| `stream:frame` | Server → Client | `{ streamId, frame: Buffer, timestamp }` | High-frequency binary Motion JPEG frame (20 FPS) |
| `stream:status` | Server → Client | `{ streamId, status, error?, active?, displayed? }` | Stream status change notification |
| `stream:error` | Server → Client | `{ streamId, error: string }` | Stream failure or FFmpeg crash notification |
| `stream:item_updated` | Server → Client | `StreamItem` | Broadcast stream configuration update |
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
| `editingStream` | `Stream \| null` | Stream currently being edited in the modal |
| `errorMessage` | `string \| null` | Global error notification message |
| `streams` | `Stream[]` | Array of registered stream objects |
| `listedStreams` | *Getter* | Returns streams filtered by active tab |
| `displayedStreams` | *Getter* | Returns active and currently displayed streams for the grid |
| `addStream(name, url)` | *Action* | Adds a new stream and closes the modal |
| `updateStream(id, payload)` | *Action* | Updates an existing stream's configuration |
| `selectStream(id)` | *Action* | Toggles stream visibility and live playback |
| `activateStream(id)` | *Action* | Sets stream active/displayed and begins playback |
| `deactivateStream(id)` | *Action* | Sets stream active/displayed status to `false` |
| `hideStream(id)` | *Action* | Hides stream from the active view grid |
| `deleteStream(id)` | *Action* | Removes a stream from the store and backend |
| `clearErrorMessage()` | *Action* | Clears global error banner |

---

## 🛠️ Troubleshooting

| Problem | Cause | Solution |
|---|---|---|
| `connect ECONNREFUSED 127.0.0.1:4000` | Backend server not running | Ensure `npm run dev` is running inside the `server/` directory. |
| CORS policy error in browser | Origin mismatch | Verify `CLIENT_ORIGIN=http://localhost:5173` in `server/.env`. |
| Port 4000 or 8554 already in use | Conflicting service | Change `PORT` in `server/.env` or ports in `custom-video-streamer/docker-compose.yml`. |
| RTSP stream not opening | Test stream containers not running | Run `docker compose ps` inside `custom-video-streamer/` or start using `scripts/start.bat`. |
| Docker pull fails | Network/proxy issue | Ensure Docker Desktop has internet access to pull images. |
| Stream shows authentication error | Incorrect credentials | Verify credentials `viewer:viewer_password_123` are provided in the RTSP URL or modal fields. |

---

## 🗺️ Development Roadmap

- [x] **Component-based Layout**: Topbar, Sidebar, Responsive Main Grid, Add Stream Modal
- [x] **MobX State Store**: Observable reactive state management for streams, filters, and theme
- [x] **Theme Toggle**: Dark / Light theme support
- [x] **Express Backend**: Modular TypeScript REST server setup with health checks and stream CRUD
- [x] **Socket.IO Integration**: Room-scoped WebSockets for high-frequency video frames and status sync
- [x] **Dockerized RTSP Stream Generator**: MediaMTX + FFmpeg stack for 3 synthetic video feeds
- [x] **Stream Synchronization**: Real-time two-way synchronization between client and backend
- [x] **Live RTSP Relay Player**: Transcodes RTSP to Motion JPEG frames over WebSockets decoded on HTML5 Canvas (20 FPS)
- [x] **Security & Credential Sanitization**: Password masking in UI headers, cards, tooltips, and server logs
- [x] **Comprehensive Error Handling**: Centralized error middleware on backend, global alert banners, and per-player reconnect
- [ ] **Stream Recording**: Record streams on demand to server disk storage
- [ ] **WebRTC Low Latency**: Optional WebRTC playback pipeline for sub-second latency

---

## 📄 License

This project is created for demonstration and evaluation purposes.
