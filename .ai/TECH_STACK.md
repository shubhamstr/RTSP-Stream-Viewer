# Technology Stack & Dependencies

## 1. Frontend Technologies (`/client`)

| Technology | Version | Purpose & Rationale |
|---|---|---|
| **React** | `^19.3.1` | Modern component-based view library used for building interactive UI layouts, modals, and player grids. |
| **ReactDOM** | `^19.3.1` | DOM renderer for React. |
| **TypeScript** | `~6.0.3` (runtime) / `^5.7.3` | Enforces compile-time type safety across UI components, MobX stores, and API contracts. Configured with `tsconfig.app.json` (target: `ES2022`). |
| **Vite** | `^8.3.6` | Ultra-fast build tool and frontend development server providing Hot Module Replacement (HMR) and optimized Rollup production builds. |
| **MobX** | `^7.1.5` | Transparent, reactive state management library. Powers `AppStore` with observables, computed getters, and actions. |
| **mobx-react-lite** | `^5.1.2` | Lightweight React bindings connecting MobX observables to React components via the `observer` HOC. |
| **Axios** | `^1.21.0` | Promise-based HTTP client for executing REST API requests (`/api/streams`, `/api/health`) with request/response interceptors. |
| **Socket.IO Client** | `^4.8.4` | WebSocket client enabling real-time bidirectional communication, room subscriptions, and binary frame reception. |
| **ESLint** | `^10.14.0` | Flat-config linter enforcing code consistency (`eslint.config.js` using `@eslint/js`, `typescript-eslint`, and `eslint-plugin-react-hooks`). |
| **HTML5 Canvas API** | Native Browser | High-performance 2D raster rendering surface used by `StreamPlayer` to draw 20 FPS MJPEG image bitmaps with low CPU overhead. |

---

## 2. Backend Technologies (`/server`)

| Technology | Version | Purpose & Rationale |
|---|---|---|
| **Node.js** | `>= 18.x` | JavaScript runtime powering the server-side API, child process execution, and event loop. |
| **Express** | `^4.21.2` | Fast, unopinionated web framework for Node.js. Serves REST endpoints (`/api/streams`, `/api/health`, `/`). |
| **Socket.IO** | `^4.8.1` | WebSocket abstraction server supporting rooms, binary payload broadcasting (`maxHttpBufferSize: 1e7`), and fallback transports. |
| **ffmpeg-static** | `^5.3.0` | Bundled static FFmpeg binaries for cross-platform execution (Windows, Linux, macOS) without requiring manual system FFmpeg installs. |
| **cors** | `^2.8.5` | Express middleware to enable Cross-Origin Resource Sharing between client (`http://localhost:5173`) and server (`http://localhost:4000`). |
| **dotenv** | `^16.4.7` | Loads environment variables from `.env` into `process.env`. |
| **nodemon** | `^3.1.9` | Development utility monitoring files in `src/` and restarting the server process on changes. |
| **ts-node** | `^10.9.2` | TypeScript execution engine for Node.js, allowing nodemon to run `.ts` files directly in development. |
| **TypeScript** | `^5.7.3` | Type system for backend routes, services, and DTOs (configured with `tsconfig.json` targeting `ES2022`). |

---

## 3. Streaming & Media Infrastructure (`/custom-video-streamer`)

| Technology | Version / Image | Purpose & Rationale |
|---|---|---|
| **MediaMTX** | `bluenviron/mediamtx:latest` | Ultra-lightweight, zero-dependency RTSP/RTMP/HLS/WebRTC media relay server written in Go. Listens on `:8554` (RTSP) and `:8888` (HLS) with internal authentication. |
| **FFmpeg (Docker)** | `linuxserver/ffmpeg:latest` | Containerized FFmpeg publishers reading sample videos (`earth.mp4`, `road_and_trees.mp4`, `watering_plant.mp4`) and looping them indefinitely as authenticated RTSP feeds. |
| **Docker Compose** | `3.8+` specification | Declarative orchestration defining the local media server network (`streamer-net`) and services. |
| **System FFmpeg** | Optional host install | Used as fallback if `ffmpeg-static` is omitted or overridden via the `FFMPEG_PATH` environment variable. |

---

## 4. Rationale for Core Architectural Choices

1. **Why MobX over Redux / Zustand?**
   - Stream state involves high-frequency status toggles and reactive computed properties (`listedStreams`, `displayedStreams`). MobX's `makeAutoObservable` minimizes boilerplate and eliminates unnecessary re-renders via fine-grained component subscription.
2. **Why Canvas over Native HTML `<video>`?**
   - Standard HTML5 `<video>` elements cannot parse RTSP streams or raw RTP payloads without complex media source extensions (MSE) or WebRTC signaling. Decoding incoming JPEG frames onto `<canvas>` via `createImageBitmap` provides low-latency, cross-browser compatibility with zero client-side decoder dependencies.
3. **Why `ffmpeg-static` in the backend?**
   - Eliminates the strict requirement that every developer must have FFmpeg pre-installed and added to their system PATH before running `npm run dev`. The codebase checks `process.env.FFMPEG_PATH`, then `ffmpeg-static`, and finally falls back to system `'ffmpeg'`.

