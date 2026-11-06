# Coding Standards & Project Conventions

## 1. General Principles
- **End-to-End TypeScript**: Every client and server file is written in TypeScript with strict type checking enabled (`strict: true` in tsconfig).
- **Separation of Concerns**: UI rendering is decoupled from business logic. State lives in MobX stores, network calls live in service modules, and child processes live in specialized managers.
- **Predictable Error Boundaries**: Graceful handling of streaming glitches, network failures, and process crashes without bringing down the application.

---

## 2. Directory & File Organization

```
RTSP-Video-Stream-Viewer/
├── client/
│   ├── src/
│   │   ├── assets/              # Static media (svg, png)
│   │   ├── components/          # Reusable and page-level React components
│   │   │   ├── layout/          # Global layout scaffolding (Topbar, Sidebar, MainContent)
│   │   │   └── <ComponentName>/ # Feature component folders containing <ComponentName>.tsx
│   │   ├── config/              # Environment config and constants (env.ts)
│   │   ├── hooks/               # Custom React hooks (useApi.ts)
│   │   ├── icons/               # SVG icon definitions (icons.tsx)
│   │   ├── services/            # Axios instance, typed handlers, and Socket client
│   │   ├── store/               # MobX singleton store (AppStore.ts)
│   │   ├── types/               # Shared TypeScript models and DTO interfaces
│   │   ├── App.css              # Global styles, CSS variables, and layout classes
│   │   └── App.tsx              # Root component
├── server/
│   ├── src/
│   │   ├── routes/              # Express Routers (streams.ts, health.ts)
│   │   ├── services/            # Core backend logic (streamManager.ts, socketService.ts)
│   │   ├── types/               # Backend DTOs and entity interfaces (stream.ts)
│   │   └── index.ts             # Express and Socket.IO entry point
```

---

## 3. Naming Conventions

| Category | Convention | Examples |
|---|---|---|
| **React Components** | PascalCase | `StreamPlayer.tsx`, `AddStreamModal.tsx`, `Topbar.tsx` |
| **Component Directories** | PascalCase | `components/StreamPlayer/`, `components/AddStreamModal/` |
| **TypeScript Types & Interfaces** | PascalCase | `StreamItem`, `CreateStreamDto`, `StreamStatus` |
| **Variables & Functions** | camelCase | `streamManager`, `handleTogglePlay`, `isValidStreamUrl` |
| **Classes** | PascalCase | `AppStore`, `StreamManager` |
| **Constants & Enums** | UPPER_SNAKE_CASE | `DEFAULT_STREAMS`, `FFMPEG_BIN`, `PORT` |
| **Socket.IO Event Names** | `domain:action` (colon-delimited) | `stream:join`, `stream:frame`, `stream:status` |
| **CSS Classes** | BEM-style / kebab-case | `player`, `player-header`, `badge--active`, `modal-column-left` |

---

## 4. Component & State Management Patterns

### 4.1 MobX State Usage
- The client uses a single observable class instantiated as a singleton: `export const appStore = new AppStore()`.
- State mutations are decorated with `makeAutoObservable(this, {}, { autoBind: true })`.
- Asynchronous updates must be wrapped in `runInAction(() => { ... })` to satisfy MobX strict mode:
  ```typescript
  runInAction(() => {
    this.streams = serverStreams
    this.isLoading = false
  })
  ```
- React components consuming store state are wrapped with `observer`:
  ```typescript
  import { observer } from 'mobx-react-lite'
  
  const StreamPlayer = observer(({ stream }: StreamPlayerProps) => {
    // ...
  })
  ```

### 4.2 Canvas Video Playback Pattern
In `StreamPlayer.tsx`, avoid re-rendering React trees on every frame:
1. Store references to the DOM canvas via `useRef<HTMLCanvasElement>(null)`.
2. Keep component mount state in `isMountedRef` to prevent memory leaks when components unmount.
3. Decode binary JPEG blobs via `createImageBitmap(blob)`:
   ```typescript
   window.createImageBitmap(blob).then((bitmap) => {
     if (!isMountedRef.current || !canvasRef.current) {
       bitmap.close()
       return
     }
     const ctx = canvasRef.current.getContext('2d')
     ctx?.drawImage(bitmap, 0, 0)
     bitmap.close()
   })
   ```
4. Clean up Socket.IO listeners in `useEffect` return cleanup callback.

---

## 5. Error Handling Patterns

### Backend
- All child processes (`spawn`) attach handlers for `'error'`, `'exit'`, and `stderr.on('data')`.
- Sanitization: In logs, passwords in stream URLs must always be masked using `sanitizeStreamUrl(url)`.
- Graceful exit: Intercept `SIGINT` and `SIGTERM` to kill spawned FFmpeg processes and close sockets:
  ```typescript
  process.on('SIGINT', handleExit);
  process.on('SIGTERM', handleExit);
  ```

### Frontend
- REST API calls are wrapped in `try / catch` blocks.
- Failed stream connections surface visual error overlays in the player card with actionable buttons ("Reconnect Stream").
- Form validations surface dismissible error banners in `AddStreamModal`.

