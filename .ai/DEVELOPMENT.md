# Development & Operational Guide

## 1. System Requirements & Prerequisites

Ensure the following tools are installed on your host system:
- **Node.js**: `v18.x` or higher (verified with Node 18+ / 20+ / 22+)
- **npm**: `v9.x` or higher
- **Docker & Docker Desktop**: Required if running the local test RTSP video streamer
- **FFmpeg**: Optional for host (the backend includes `ffmpeg-static`), but recommended for inspecting streams via `ffprobe` or `ffplay`.

---

## 2. Quickstart: Step-by-Step Local Setup

### Step 1: Clone Repository
```bash
git clone https://github.com/your-username/RTSP-Video-Stream-Viewer.git
cd RTSP-Video-Stream-Viewer
```

### Step 2: Start Mock Video Streamer (Docker)
This provides 3 live looping RTSP feeds (`earth`, `road_and_trees`, `watering_plant`).

- **On Windows**:
  ```cmd
  cd custom-video-streamer
  scripts\start.bat
  ```
- **On Linux / macOS**:
  ```bash
  cd custom-video-streamer
  chmod +x scripts/start.sh
  ./scripts/start.sh
  ```
- **Direct Docker Compose alternative**:
  ```bash
  cd custom-video-streamer
  docker compose up -d
  ```

### Step 3: Setup & Run Backend Server
In a new terminal window:
```bash
cd server
npm install

# Copy environment template if .env does not exist
copy .env.example .env    # Windows PowerShell: Copy-Item .env.example .env
cp .env.example .env      # Linux/macOS

npm run dev
```
- Server API listens at: `http://localhost:4000`
- Health check: `http://localhost:4000/api/health`
- Socket.IO listening on: `ws://localhost:4000`

### Step 4: Setup & Run Frontend Client
In a third terminal window:
```bash
cd client
npm install

# Copy environment template if .env does not exist
copy .env.example .env    # Windows PowerShell: Copy-Item .env.example .env
cp .env.example .env      # Linux/macOS

npm run dev
```
- Web Application opens at: `http://localhost:5173`

---

## 3. Environment Variables Reference

### Backend (`server/.env`)
| Variable | Default Value | Description |
|---|---|---|
| `PORT` | `4000` | Port for Express HTTP listener and Socket.IO server. |
| `CLIENT_ORIGIN` | `http://localhost:5173` | Allowed frontend origin for CORS policies. |
| `FFMPEG_PATH` | *Unset* | Optional absolute path to a custom FFmpeg binary. If omitted, falls back to `ffmpeg-static` or system `ffmpeg`. |
| `LOG_LEVEL` | `debug` | Minimum logging severity (`debug`, `info`, `warn`, `error`). |
| `LOGS_DIR` | `./logs` | Directory path where rotational log files are written. |
| `LOG_MAX_FILES` | `14d` | Log retention window before automated purging (e.g. `14d`). |
| `LOG_MAX_SIZE` | `20m` | Maximum individual log file size before triggering rotation. |
| `LOG_ZIPPED_ARCHIVE` | `false` | Whether to gzip archived rotated log files (`true` / `false`). |

### Frontend (`client/.env`)
| Variable | Default Value | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:4000` | Base URL of the backend REST service used by Axios. |
| `VITE_WS_URL` | `ws://localhost:4000` | Base WebSocket connection string used by Socket.IO. |

---

## 4. Available Commands & Scripts

### Client (`/client`)
| Script | Command | Action |
|---|---|---|
| Dev Server | `npm run dev` | Starts Vite dev server with Hot Module Replacement on port `5173`. |
| Production Build | `npm run build` | Runs `tsc -b` type checking followed by `vite build` into `dist/`. |
| Linting | `npm run lint` | Runs ESLint across all TypeScript and React files. |
| Preview Build | `npm run preview` | Spins up a local static server serving the production `dist/` bundle. |

### Backend (`/server`)
| Script | Command | Action |
|---|---|---|
| Dev Server | `npm run dev` | Runs server with `nodemon` and `ts-node` watching `src/`. |
| TypeScript Build | `npm run build` | Compiles TypeScript files into JavaScript in `dist/`. |
| Production Start | `npm start` | Executes the compiled production bundle via `node dist/index.js`. |

### Mock RTSP Streamer (`/custom-video-streamer`)
| Script / Command | Action |
|---|---|
| `scripts\start.bat` / `start.sh` | Pulls images and launches MediaMTX and 3 FFmpeg video publisher containers in background. |
| `scripts\stop.bat` / `stop.sh` | Tears down all 4 containers. |
| `docker compose ps` | Lists active streaming containers and mapped ports. |
| `docker compose logs -f` | Tails output logs from MediaMTX and FFmpeg publisher processes. |

---

## 5. Automated Testing Status

| Area | Status | Notes |
|---|---|---|
| **Unit Tests** | **Not implemented** | Neither `client/package.json` nor `server/package.json` contains a `"test"` script. |
| **Integration Tests** | **Not implemented** | No automated tests validating REST API endpoints or WebSocket events currently exist. |
| **Linting** | **Implemented** | ESLint (`npm run lint` in `client`) is configured and functional. |
| **Type Checking** | **Implemented** | TypeScript builds (`npm run build` in both `client` and `server`) validate types strictly. |

---

## 6. Deployment Considerations (Production Readiness)

1. **Frontend Deployment & CI/CD**:
   - Containerized with [`client/Dockerfile`](file:///w:/shubham/personal/RTSP-Video-Stream-Viewer/client/Dockerfile) using a multi-stage `node:20-alpine` build served via `serve` on port `5001`.
   - Automated deployment pipeline configured in [`.github/workflows/aws-deploy-client.yml`](file:///w:/shubham/personal/RTSP-Video-Stream-Viewer/.github/workflows/aws-deploy-client.yml): builds and pushes Docker image to Amazon ECR, then executes SSH commands on target AWS EC2 host to restart the container.
   - Alternatively, can be statically hosted on Vercel, Netlify, Cloudflare Pages, or AWS S3 + CloudFront.
   - Configure `VITE_API_URL` and `VITE_WS_URL` to point to the deployed backend domain.
2. **Custom Video Streamer Deployment & CI/CD**:
   - Containerized with [`custom-video-streamer/Dockerfile`](file:///w:/shubham/personal/RTSP-Video-Stream-Viewer/custom-video-streamer/Dockerfile) using a multi-stage build combining `bluenviron/mediamtx:latest` binary, Alpine Linux, and FFmpeg.
   - Continuous stream loops managed by [`custom-video-streamer/docker-entrypoint.sh`](file:///w:/shubham/personal/RTSP-Video-Stream-Viewer/custom-video-streamer/docker-entrypoint.sh) for `earth`, `road_and_trees`, and `watering_plant`.
   - Automated deployment pipeline configured in [`.github/workflows/aws-deploy-custom-video-streamer.yml`](file:///w:/shubham/personal/RTSP-Video-Stream-Viewer/.github/workflows/aws-deploy-custom-video-streamer.yml): triggered manually via `workflow_dispatch`, builds and pushes Docker image to Amazon ECR (`custom-video-streamer`), then logs in and restarts the container on AWS EC2 exposing RTSP (`8554`), HLS (`8888`), and REST API (`9997`).
3. **Backend Deployment**:
   - Requires an environment supporting persistent OS child processes and WebSockets (e.g., Render Background Worker/Web Service, Railway, AWS ECS, or DigitalOcean Droplet).
   - Serverless platforms (e.g., AWS Lambda, Vercel Serverless Functions) **cannot** run persistent FFmpeg streaming or long-lived WebSockets.
4. **Containerization**:
   - Creating a root `Dockerfile` for the Node.js backend with FFmpeg installed via Alpine/Debian package manager is recommended for consistent containerized deployments alongside the client container.

