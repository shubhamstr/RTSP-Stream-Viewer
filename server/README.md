# RTSP Stream Viewer — Server

Node.js + Express backend service equipped with Socket.IO and child process FFmpeg transcoders for real-time RTSP to MJPEG video streaming.

---

## 🧰 Tech Stack

- **Node.js** (`>= 18.x`) & **TypeScript** (`5.x`)
- **Express 4.21** (REST API)
- **Socket.IO 4.8** (WebSocket server for binary video frames & status events)
- **ffmpeg-static** (Bundled cross-platform FFmpeg binaries)
- **Winston 3.19** & **winston-daily-rotate-file 5.0** (Structured logging with automatic daily rotation)

---

## 🚀 Setup & Execution

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env`:
```bash
# Windows PowerShell
Copy-Item .env.example .env

# Linux / macOS
cp .env.example .env
```

### 3. Run Development Server
```bash
npm run dev
```
- API server listens on: `http://localhost:4000`
- Health check: `http://localhost:4000/api/health`
- WebSocket server on: `ws://localhost:4000`

### 4. Build & Run Production
```bash
npm run build
npm start
```

---

## 📜 Available Scripts

| Script | Command | Description |
|---|---|---|
| `dev` | `npm run dev` | Runs server with `nodemon` + `ts-node` watching `src/` |
| `build` | `npm run build` | Compiles TypeScript into JavaScript in `dist/` |
| `start` | `npm start` | Executes compiled production server (`node dist/index.js`) |

---

## ⚙️ Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `4000` | Port for Express HTTP listener and Socket.IO server |
| `CLIENT_ORIGIN` | `http://localhost:5173` | Allowed frontend origin for CORS |
| `FFMPEG_PATH` | *(unset)* | Custom FFmpeg binary path (falls back to `ffmpeg-static` or system `ffmpeg`) |
| `LOG_LEVEL` | `debug` | Minimum logging level (`debug`, `info`, `warn`, `error`) |
| `LOGS_DIR` | `./logs` | Directory path where rotational log files are stored |
| `LOG_MAX_FILES` | `14d` | Retention window for rotated logs before deletion |
| `LOG_MAX_SIZE` | `20m` | Size threshold before rotating active log file |
| `LOG_ZIPPED_ARCHIVE` | `false` | Whether to gzip archived log files |

---

## 📁 Architecture & File Layout

```
server/
├── logs/                   # Rotational logs (combined-*.log, error-*.log)
├── src/
│   ├── routes/
│   │   ├── health.ts       # Health endpoint (/api/health)
│   │   └── streams.ts      # Stream CRUD and controls (/api/streams)
│   ├── services/
│   │   ├── logger.ts       # Winston logger, request logging & protection middleware
│   │   ├── socketService.ts# Socket.IO room and event handlers
│   │   └── streamManager.ts# FFmpeg spawn, MJPEG frame demuxing & process lifecycle
│   ├── types/
│   │   └── stream.ts       # TypeScript interfaces (StreamItem, DTOs)
│   └── index.ts            # Server entry point & graceful shutdown
├── .env.example
├── nodemon.json
├── package.json
└── tsconfig.json
```

---

## 🔒 Security & Logging

- **Credential Redaction**: Stream URLs with embedded credentials (`rtsp://user:pass@host`) are automatically sanitized to `rtsp://user:***@host` across all console and file log outputs.
- **Log Protection**: `protectLogsMiddleware` strictly blocks direct HTTP requests to `/logs` or `*.log` files with `403 Forbidden`.
- **Command Injection Prevention**: FFmpeg processes are spawned using `child_process.spawn()` with parameter arrays without an OS shell wrapper (`shell: false`).

