# RTSP Stream Viewer — Client

React 19 + TypeScript Single-Page Application (SPA) powered by Vite, MobX, and HTML5 Canvas 2D context for decoding and rendering low-latency RTSP-to-MJPEG video streams.

---

## 🧰 Tech Stack

- **React 19** & **ReactDOM 19**
- **TypeScript 5.x** (Strict Mode)
- **Vite 8** (Build tool & HMR dev server)
- **MobX 7** & **mobx-react-lite 5** (Observable reactive state management)
- **Axios 1.x** (Typed REST API client with interceptors)
- **Socket.IO Client 4.8** (WebSocket real-time binary frame & event subscriber)
- **HTML5 Canvas 2D API** (`createImageBitmap` 20 FPS video frame renderer)
- **Docker** (Multi-stage container build served via `serve` on port 5001)

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

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:4000` | Base URL of the backend REST service |
| `VITE_WS_URL` | `ws://localhost:4000` | Base WebSocket connection string for Socket.IO |

### 3. Run Development Server
```bash
npm run dev
```
Client opens at **`http://localhost:5173`** (requires backend server running at `http://localhost:4000`).

### 4. Build & Preview Production
```bash
npm run build
npm run preview
```

---

## 📜 Available Scripts

| Script | Command | Description |
|---|---|---|
| `dev` | `npm run dev` | Starts Vite development server with Hot Module Replacement |
| `build` | `npm run build` | Runs `tsc -b` type-checking followed by `vite build` into `dist/` |
| `preview` | `npm run preview` | Spins up local static server serving production `dist/` bundle |
| `lint` | `npm run lint` | Runs ESLint across all TypeScript and React files |

---

## 📁 Architecture & File Layout

```
client/
├── src/
│   ├── assets/              # Static media assets (hero.png, svgs)
│   ├── components/          # React components
│   │   ├── layout/          # Topbar.tsx, Sidebar.tsx, MainContent.tsx
│   │   ├── AddStreamModal/  # Modal to register new streams or add presets
│   │   ├── StreamCard/      # Sidebar stream item with controls
│   │   └── StreamPlayer/    # Canvas video player with FPS badge & action buttons
│   ├── config/              # env.ts (environment variable mapping)
│   ├── constants/           # presets.ts (MediaMTX test stream definitions)
│   ├── hooks/               # useApi.ts custom hook
│   ├── icons/               # icons.tsx (SVG component definitions)
│   ├── services/            # api.ts, apiHandler.ts, socketService.ts
│   ├── store/               # AppStore.ts (MobX central singleton)
│   ├── types/               # index.ts (Stream, StreamStatus, Tab, DTOs)
│   ├── utils/               # error.ts (error extraction), url.ts (URL validation)
│   ├── App.css              # Design tokens, themes (dark/light), and layout classes
│   ├── App.tsx              # Application layout root
│   └── main.tsx             # DOM entry point
├── Dockerfile               # Multi-stage Docker container build
├── .dockerignore            # Docker build ignore patterns
├── .env.example             # Example client configuration
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🐳 Docker Deployment

To build and run the client in Docker:
```bash
docker build -t rtsp-client .
docker run -d -p 5001:5001 --name rtsp-client rtsp-client
```
Access the client at `http://localhost:5001`.
