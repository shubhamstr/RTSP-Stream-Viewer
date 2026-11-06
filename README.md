# 📡 RTSP Video Stream Viewer

A full-stack web application for viewing live **RTSP (Real-Time Streaming Protocol)** video streams in a browser. The backend transcodes RTSP streams in real time and delivers them to the frontend via **WebSockets** or **HLS**, while the React frontend renders a live, low-latency multi-stream video dashboard.

---

## 🏗️ Project Structure

```
RTSP-Video-Stream-Viewer/
├── client/                        # React + TypeScript frontend (Vite)
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Topbar.tsx     # App bar with title and theme toggle
│   │   │   │   ├── Sidebar.tsx    # Stream list with Active / All tabs
│   │   │   │   └── MainContent.tsx# Responsive player grid
│   │   │   ├── StreamCard/
│   │   │   │   └── StreamCard.tsx # Sidebar stream item (activate / delete)
│   │   │   ├── StreamPlayer/
│   │   │   │   └── StreamPlayer.tsx # Per-stream video player with controls
│   │   │   └── AddStreamModal/
│   │   │       └── AddStreamModal.tsx # Modal form to register new streams
│   │   ├── icons/
│   │   │   └── icons.tsx          # Inline SVG icon library
│   │   ├── store/
│   │   │   └── AppStore.ts        # MobX singleton store (streams, theme, modal)
│   │   ├── types/
│   │   │   └── index.ts           # Shared TypeScript types (Stream, Tab)
│   │   ├── App.tsx
│   │   ├── App.css
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── server/                        # Node.js + TypeScript backend (Express)
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   └── index.ts
│   ├── tsconfig.json
│   └── package.json
│
└── README.md
```

---

## 🧰 Tech Stack

| Layer         | Technology                                        |
|---------------|---------------------------------------------------|
| Frontend      | React 19, TypeScript 6, Vite 8                    |
| State Mgmt    | MobX 7 + mobx-react-lite 5 (observable singleton) |
| Backend       | Node.js, Express, TypeScript                      |
| Streaming     | FFmpeg (RTSP → HLS / WebSocket proxy)             |
| Protocol      | RTSP input → HLS / WebSocket output               |
| Dev Tools     | ESLint 10, TSConfig strict mode                   |

---

## ✨ Features

- 🎥 **Live RTSP stream ingestion** via FFmpeg on the server
- 🌐 **Browser-compatible playback** — no native RTSP support needed
- 📡 **Real-time delivery** over WebSocket or HLS segments
- 🔗 **Dynamic stream management** — add any RTSP URL via the modal UI
- 🗂️ **Sidebar with Active / All tabs** — filter streams by their state
- 🟩 **Multi-stream player grid** — single stream fills the view; two or more switch to a 2-column responsive grid
- ▶️ **Per-player controls** — fullscreen, picture-in-picture, refresh, settings, and close
- 🌙 **Dark / Light theme toggle** — persisted in observable state, applied app-wide
- 🧩 **MobX observable store** — all UI state (streams, theme, modal) in a single reactive singleton
- 🔒 **TypeScript end-to-end** — fully typed client and server code

---

## ⚙️ Prerequisites

Make sure the following are installed on your system:

- [Node.js](https://nodejs.org/) `>= 18.x`
- [npm](https://www.npmjs.com/) `>= 9.x`
- [FFmpeg](https://ffmpeg.org/download.html) — must be available in your system `PATH`

Verify FFmpeg installation:
```bash
ffmpeg -version
```

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/RTSP-Video-Stream-Viewer.git
cd RTSP-Video-Stream-Viewer
```

### 2. Install Dependencies

**Server:**
```bash
cd server
npm install
```

**Client:**
```bash
cd ../client
npm install
```

---

### 3. Configure Environment Variables

Create a `.env` file in the `server/` directory:

```env
PORT=4000
```

> You can optionally set a default RTSP URL here if needed.

---

### 4. Start the Development Servers

**Start the backend server:**
```bash
cd server
npm run dev
```

**In a separate terminal, start the frontend:**
```bash
cd client
npm run dev
```

The app will be available at: **http://localhost:5173**

The backend API runs at: **http://localhost:4000**

---

## 🖥️ UI Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│  Topbar: [📹 RTSP Stream Viewer]                     [🌙/☀️ Theme] │
├──────────────────┬──────────────────────────────────────────────────┤
│  Sidebar         │  Main Content                                     │
│  ┌────────────┐  │  ┌──────────────────────────────────────────┐    │
│  │Active│ All │  │  │  Displayed Streams (N)                   │    │
│  └────────────┘  │  │  ┌────────────┐  ┌────────────┐          │    │
│  [+ Add]         │  │  │ StreamPlayer│  │ StreamPlayer│          │    │
│                  │  │  │ [⛶][⧉][↺][⚙][✕]           │          │    │
│  ┌────────────┐  │  │  └────────────┘  └────────────┘          │    │
│  │ StreamCard │  │  └──────────────────────────────────────────┘    │
│  │ [name]     │  │                                                   │
│  │ [url]      │  │                                                   │
│  │ Active ●   │  │                                                   │
│  │[Deactivate]│  │                                                   │
│  │  [Delete]  │  │                                                   │
│  └────────────┘  │                                                   │
└──────────────────┴───────────────────────────────────────────────────┘
```

---

## 🗃️ State Management

The app uses a **MobX observable singleton** (`AppStore`) — no React Context or Redux needed.

| State field       | Type       | Description                                   |
|-------------------|------------|-----------------------------------------------|
| `dark`            | `boolean`  | Current theme (default: dark)                 |
| `tab`             | `Tab`      | Active sidebar filter: `'active'` \| `'all'`  |
| `modalOpen`       | `boolean`  | Whether the Add Stream modal is visible       |
| `streams`         | `Stream[]` | Full list of registered streams               |

**Computed views:**

| Getter             | Returns                                                |
|--------------------|--------------------------------------------------------|
| `listedStreams`     | Streams shown in the sidebar (respects tab filter)     |
| `displayedStreams`  | Streams that are both `active` and `displayed` (shown in player grid) |

**Actions:** `addStream`, `deleteStream`, `deactivateStream`, `hideStream`, `toggleDark`, `setTab`, `openModal`, `closeModal`.

---

## 🔄 How It Works

```
Browser (React)
     │
     │  Enter RTSP URL  →  POST /api/stream/start
     ▼
Node.js Server (Express)
     │
     │  Spawns FFmpeg subprocess
     │  FFmpeg connects to RTSP source
     │
     ├──► HLS mode: writes .m3u8 + .ts segments to disk
     │    React player polls /hls/<stream-id>/index.m3u8
     │
     └──► WebSocket mode: pipes raw MPEG-TS chunks over WS
          React player (e.g. JSMpeg) decodes in-browser
```

> **Note:** The `StreamPlayer` currently renders a demo MP4 fallback (`BigBuckBunny`) because browsers cannot decode raw RTSP directly. In production, wire the `src` to the HLS playlist URL served by the backend.

---

## 🌐 API Endpoints

| Method | Endpoint                        | Description                       |
|--------|---------------------------------|-----------------------------------|
| `POST` | `/api/stream/start`             | Start transcoding an RTSP stream  |
| `POST` | `/api/stream/stop/:id`          | Stop a running stream             |
| `GET`  | `/api/stream/status/:id`        | Get stream status                 |
| `GET`  | `/hls/:id/index.m3u8`           | HLS playlist (m3u8)               |
| `GET`  | `/hls/:id/:segment`             | HLS video segments (.ts)          |
| `WS`   | `/ws/stream/:id`                | WebSocket stream endpoint         |

---

## 📋 Available Scripts

### Client (`/client`)

| Script              | Description                              |
|---------------------|------------------------------------------|
| `npm run dev`       | Start Vite dev server with HMR           |
| `npm run build`     | Type-check and build for production      |
| `npm run preview`   | Preview the production build             |
| `npm run lint`      | Run ESLint on all source files           |

### Server (`/server`)

| Script          | Description                                      |
|-----------------|--------------------------------------------------|
| `npm run dev`   | Start server with hot-reload (ts-node / nodemon) |
| `npm run build` | Compile TypeScript to `dist/`                    |
| `npm start`     | Run compiled production build                    |

---

## 📦 Production Build

```bash
# Build client
cd client
npm run build

# Build server
cd ../server
npm run build

# Start server (serves client static files too)
npm start
```

---

## 🛠️ Troubleshooting

| Problem | Solution |
|---------|----------|
| `ffmpeg: command not found` | Install FFmpeg and ensure it's on your system PATH |
| RTSP stream not loading | Verify the stream URL is accessible from the server machine |
| CORS error in browser | Ensure the server has CORS configured for `http://localhost:5173` |
| Port already in use | Change `PORT` in `server/.env` or kill the conflicting process |
| Video shows demo clip | Backend HLS/WS relay not yet wired; connect `StreamPlayer` `src` to the HLS endpoint |

---

## 🗺️ Roadmap

- [x] Component-based layout (Topbar, Sidebar, MainContent)
- [x] MobX reactive state management
- [x] Add / deactivate / delete stream management
- [x] Multi-stream player grid (1-column → 2-column responsive)
- [x] Per-player controls (fullscreen, PiP, refresh, settings, close)
- [x] Dark / Light theme toggle
- [ ] Wire `StreamPlayer` to live HLS endpoint from the backend
- [ ] Stream authentication (username/password in RTSP URL)
- [ ] Stream recording to disk
- [ ] Docker support for easy deployment
- [ ] PTZ camera control integration

---

## 📄 License

This project is for evaluation / demonstration purposes.

---

## 👤 Author

**Shubham**  
Built as part of the Skylark Labs Full Stack Engineer Coding Test.

