# AI Agent Rules & Engineering Standards

> **Permanent instructions for AI coding agents working on the RTSP Video Stream Viewer codebase.**  
> Every AI agent interacting with this repository MUST follow the rules, conventions, and operational directives detailed below.

---

## 1. Core Directives & Golden Rules

These rules are absolute and take precedence over default generative tendencies:

1. **Derive from Existing Codebase**: Adhere strictly to the patterns, architectures, and libraries already established in this repository. Never introduce foreign architectural styles or unapproved frameworks.
2. **Clearly Separate Existing Conventions from Recommended Improvements**:
   - Every rule in this document is labeled as **`[Current Convention]`** (how code is written today) or **`[Recommended Improvement]`** (targeted enhancement when touching or expanding that module).
   - Never replace a working current convention with an alternative pattern unless explicitly requested.
3. **Prefer Minimal, Maintainable Changes**: Make the smallest surgical change necessary to achieve the task. Avoid sprawling refactors or unsolicited stylistic rewrites.
4. **Never Modify Unrelated Functionality**: Confine edits solely to files and functions directly related to the task or issue.
5. **Never Expose Secrets or Credentials**:
   - RTSP URLs often contain embedded camera credentials (`rtsp://user:pass@host:port/path`).
   - Never log unmasked credentials to console, stdout, telemetry, or disk. Always sanitize via `sanitizeStreamUrl(url)`.
   - Never render plain authentication strings into client DOM attributes (`title`, raw text) without masking passwords.
   - Never commit `.env` files, production credentials, or test passwords to Git.
6. **Never Hardcode Environment-Specific Configuration**: Always resolve URLs, ports, and hosts from environment configuration (`process.env` on server, `import.meta.env` via `client/src/config/env.ts` on client).
7. **Check Existing Dependencies Before Adding New Ones**: Never install a package if an existing installed dependency (or native browser/Node API) provides equivalent functionality.
8. **Search Codebase Before Creating New Code**: Search existing components (`client/src/components/`), icons (`client/src/icons/icons.tsx`), services (`client/src/services/`), store methods (`client/src/store/AppStore.ts`), and backend utilities (`server/src/services/`) to maximize reuse before creating any new abstractions.
9. **Preserve Existing Public APIs**: Do not rename, remove, or modify existing REST endpoints (`/api/streams*`, `/api/health`), request/response contracts, or Socket.IO events (`stream:join`, `stream:frame`, `stream:status`, etc.) without explicit user instruction.
10. **Maintain & Update `.ai/` Documentation**: Whenever an agent alters architecture, endpoints, data contracts, database structures, or major behaviors, it must update the relevant files in `.ai/` (`API.md`, `ARCHITECTURE.md`, `CODING_STANDARDS.md`, `DATABASE.md`, `DEVELOPMENT.md`, `SECURITY.md`, `TECH_STACK.md`, `FEATURES.md`, `PROJECT.md`).

---

## 2. Architecture

### `[Current Convention]`
- **Three-Tier Architecture**:
  1. **Frontend Client (`/client`)**: React 19 SPA powered by Vite, MobX 7 for reactive state, HTML5 Canvas 2D context for decoding and rendering MJPEG binary streams at 20 FPS, and Axios for REST communication.
  2. **Backend Server (`/server`)**: Node.js with Express 4 (REST API) and Socket.IO 4 (WebSocket server). Spawns local FFmpeg child processes via `child_process.spawn` to pull RTSP streams, transcode them into MJPEG (`-c:v mjpeg -q:v 4 -r 20 -f image2pipe -`), demux discrete JPEG frames using SOI (`0xFFD8`) and EOI (`0xFFD9`) markers, and broadcast them to room-scoped clients (`stream:${id}`).
  3. **Mock Video Streamer (`/custom-video-streamer`)**: Docker Compose environment running MediaMTX (RTSP relay on `:8554`, HLS on `:8888`, REST API on `:9997`) and three containerized FFmpeg publishers reading loop videos from `videos/` (`earth.mp4`, `road_and_trees.mp4`, `watering_plant.mp4`).
- **Communication Protocol Split**:
  - REST API for deterministic CRUD operations and lifecycle actions (`POST /api/streams`, `POST /api/streams/:id/start`, `POST /api/streams/:id/stop`, `DELETE /api/streams/:id`).
  - WebSockets (Socket.IO) for high-frequency binary frames (`stream:frame`), live status notifications (`stream:status`), and broadcast metadata updates (`stream:item_updated`, `stream:list`).
- **State Storage**: In-memory storage only. Backend uses `Map<string, StreamItem>` inside the `StreamManager` singleton (`server/src/services/streamManager.ts`). Client uses observable state inside the `AppStore` singleton (`client/src/store/AppStore.ts`).

### `[Recommended Improvement]`
- Maintain clear boundaries between transport (routes/sockets), domain logic (`StreamManager`), and process control.
- If persistence is added, place data access behind a repository interface so `StreamManager` remains clean.
- Abstract transcode pipelines to support alternative outputs (e.g. HLS, WebRTC) without polluting REST route handlers.

---

## 3. Folder Structure

### `[Current Convention]`
Maintain the exact established directory layouts:

```
RTSP-Video-Stream-Viewer/
├── .ai/                            # Project knowledge base & AI rules
│   ├── AI_RULES.md                 # Permanent rules for AI agents (this file)
│   ├── API.md                      # REST & Socket.IO specification
│   ├── ARCHITECTURE.md             # System design & streaming pipeline
│   ├── CODING_STANDARDS.md         # Coding conventions & patterns
│   ├── DATABASE.md                 # In-memory schema & storage roadmap
│   ├── DEVELOPMENT.md              # Setup, commands & deployment
│   ├── FEATURES.md                 # Feature breakdown & roadmap
│   ├── PROJECT.md                  # Scope, purpose & use cases
│   ├── SECURITY.md                 # Security analysis & mitigations
│   └── TECH_STACK.md               # Libraries & technical rationale
├── client/                         # Frontend React 19 application
│   ├── public/                     # Static public assets
│   ├── src/
│   │   ├── assets/                 # Images and SVGs (hero.png, vite.svg)
│   │   ├── components/
│   │   │   ├── layout/             # Topbar.tsx, Sidebar.tsx, MainContent.tsx
│   │   │   ├── AddStreamModal/     # AddStreamModal.tsx
│   │   │   ├── StreamCard/         # StreamCard.tsx
│   │   │   └── StreamPlayer/       # StreamPlayer.tsx
│   │   ├── config/                 # env.ts (ENV.EXPRESS_URL, ENV.WS_URL)
│   │   ├── hooks/                  # Custom React hooks (e.g., useApi.ts)
│   │   ├── icons/                  # SVG icon components (icons.tsx)
│   │   ├── services/               # api.ts (axios), apiHandler.ts, socketService.ts
│   │   ├── store/                  # AppStore.ts (MobX singleton)
│   │   ├── types/                  # index.ts (Stream, StreamStatus, Tab, etc.)
│   │   ├── App.css                 # Global styles, variables, reset, BEM classes
│   │   ├── App.tsx                 # App layout & root composition
│   │   ├── main.tsx                # Client entry point
│   │   └── vite-env.d.ts           # Vite client type definitions
│   ├── .env                        # Local client environment
│   ├── .env.example                # Example client environment
│   ├── eslint.config.js            # ESLint flat configuration
│   ├── index.html                  # HTML template
│   ├── package.json                # Client dependencies & scripts
│   ├── tsconfig.json               # TypeScript project reference root
│   ├── tsconfig.app.json           # Client app compiler configuration
│   └── vite.config.ts              # Vite configuration
├── server/                         # Backend Express + Socket.IO server
│   ├── src/
│   │   ├── routes/                 # Express route modules (health.ts, streams.ts)
│   │   ├── services/               # streamManager.ts, socketService.ts
│   │   ├── types/                  # stream.ts (StreamItem, DTO interfaces)
│   │   └── index.ts                # Express app, server bootstrap & shutdown
│   ├── .env                        # Local server environment
│   ├── .env.example                # Example server environment
│   ├── nodemon.json                # Nodemon dev watcher config
│   ├── package.json                # Server dependencies & scripts
│   └── tsconfig.json               # Server TypeScript compiler config
└── custom-video-streamer/          # Mock RTSP Streaming Infrastructure
    ├── mediamtx/                   # mediamtx.yml configuration
    ├── scripts/                    # start.bat, start.sh, stop.bat, stop.sh
    ├── videos/                     # Looping test MP4 video files
    ├── docker-compose.yml          # Container topology (MediaMTX + 3 FFmpeg feeds)
    └── README.md                   # Setup guide for streaming sandbox
```

### `[Recommended Improvement]`
- Do not introduce arbitrary root folders.
- When creating a new client component, create a dedicated folder under `client/src/components/<ComponentName>/` containing `<ComponentName>.tsx` (and `<ComponentName>.module.css` or co-located subcomponents if complexity grows).

---

## 4. Naming Conventions

### `[Current Convention]`

| Element | Convention | Example |
|---|---|---|
| **React Components** | PascalCase | `StreamPlayer.tsx`, `AddStreamModal.tsx`, `Sidebar.tsx` |
| **Component Folders** | PascalCase | `client/src/components/StreamPlayer/` |
| **TypeScript Types & Interfaces** | PascalCase | `Stream`, `StreamItem`, `StreamStatus`, `CreateStreamDto` |
| **Type Aliases / Enums** | PascalCase | `Tab`, `StreamStatus` |
| **Functions & Methods** | camelCase | `getStreams()`, `startStream()`, `isValidStreamUrl()` |
| **Variables & Class Properties** | camelCase | `modalOpen`, `editingStream`, `streams`, `frameBuffer` |
| **Singleton Instances** | camelCase | `appStore`, `streamManager`, `apiClient`, `apiHandler` |
| **Classes** | PascalCase | `AppStore`, `StreamManager` |
| **Constants & Enums** | UPPER_SNAKE_CASE | `PORT`, `CLIENT_ORIGIN`, `DEFAULT_STREAMS`, `FFMPEG_BIN` |
| **Files (Utilities / Services)** | camelCase | `apiHandler.ts`, `socketService.ts`, `streamManager.ts`, `env.ts` |
| **Files (Routes)** | kebab-case or single-noun | `health.ts`, `streams.ts` |
| **Socket.IO Event Names** | `domain:action` (colon-delimited) | `stream:join`, `stream:leave`, `stream:frame`, `stream:status`, `stream:item_updated` |
| **CSS Classes** | Kebab-case / BEM-inspired | `.player`, `.player-header`, `.player-controls`, `.badge--active`, `.players-grid--2` |
| **CSS Variables** | `--kebab-case` | `--bg`, `--surface`, `--accent`, `--active-green`, `--text-muted` |

### `[Recommended Improvement]`
- When adding event constants, define them in a shared enum or const object to prevent string typo bugs across client and server.

---

## 5. Component Creation

### `[Current Convention]`
- **Functional Components with Hooks**: Write functional components using modern React 19 hooks (`useRef`, `useState`, `useEffect`, `useCallback`).
- **MobX Observer Wrapper**: Any component reading observable properties from `appStore` MUST be wrapped in `observer` from `mobx-react-lite`:
  ```tsx
  import { observer } from 'mobx-react-lite'
  import { appStore } from '../../store/AppStore'

  export const CustomComponent = observer(() => {
    const { streams, modalOpen } = appStore
    return <div>...</div>
  })
  ```
- **Props Typing**: Explicitly type props with TypeScript interfaces:
  ```tsx
  interface StreamCardProps {
    stream: Stream
    onSelect?: (stream: Stream) => void
  }
  ```
- **Canvas Rendering Rules** (Critical for `StreamPlayer` and any video components):
  - Do not trigger React state re-renders on incoming binary video frames (20 FPS).
  - Bind `<canvas>` via `useRef<HTMLCanvasElement>(null)`.
  - Maintain an `isMountedRef` flag (`useRef(true)`) and check it before drawing.
  - Decode binary JPEGs via `window.createImageBitmap(blob)`, draw directly using `ctx.drawImage(bitmap, 0, 0)`, and immediately invoke `bitmap.close()` to release GPU memory.
  - Provide fallback to `new Image()` with `URL.createObjectURL(blob)` and `URL.revokeObjectURL(...)` for environments lacking `createImageBitmap`.
- **Icons**: Reuse SVGs from `client/src/icons/icons.tsx`. Add new icons there as clean functional SVG components matching the existing design aesthetic.
- **Component Styling**: Reference CSS design tokens defined in `client/src/App.css` (`var(--surface)`, `var(--border)`, `var(--accent)`, `var(--text)`, etc.) to support both Dark and Light themes automatically.

### `[Recommended Improvement]`
- Extract complex component-local state or effects into custom hooks (`client/src/hooks/`).
- Clean up all event listeners, intervals, and socket room subscriptions in the `useEffect` cleanup return callback.

---

## 6. API Development

### `[Current Convention]`
- **REST Endpoints (`server/src/routes/streams.ts`)**:
  - Base prefix: `/api/streams`
  - Routes use Express `Router()`.
  - Consistent JSON response contract:
    - Success: `{ success: true, message?: string, stream?: StreamItem, streams?: StreamItem[], count?: number }`
    - Failure: `{ success: false, message: string }`
  - HTTP Status Codes:
    - `200 OK` for successful queries, updates, starts, stops, and deletes.
    - `201 Created` for successful resource creation (`POST /api/streams`).
    - `400 Bad Request` for invalid input parameters or unsupported URLs.
    - `404 Not Found` when a requested stream ID does not exist in `StreamManager`.
    - `500 Internal Server Error` for unexpected server exceptions.
- **Parameter Extraction**:
  - Always safely extract route params using the established helper:
    ```typescript
    const getIdParam = (req: Request): string => {
      const { id } = req.params;
      return Array.isArray(id) ? id[0] : id;
    };
    ```
- **Client API Integration (`client/src/services/apiHandler.ts`)**:
  - All client HTTP requests go through `apiHandler`. Never invoke `axios` or `fetch` directly inside React components.
  - `apiClient` (`client/src/services/api.ts`) sets a 10-second timeout, `Content-Type: application/json`, and logs errors with `[API Error]`.
- **Socket.IO Event Flow (`server/src/services/socketService.ts`)**:
  - All real-time messaging follows the `domain:action` convention (`stream:join`, `stream:leave`, `stream:start`, `stream:stop`, `stream:frame`, `stream:status`, `stream:item_updated`, `stream:list`).
  - Rooms are scoped by stream ID: `stream:${id}`.
  - Sockets join rooms explicitly; when leaving or disconnecting, remove listeners.

### `[Recommended Improvement]`
- Support standard `204 No Content` or `{ success: true, id }` on deletion.
- Standardize all controller handlers with explicit request body typing using generics: `Request<Params, ResBody, ReqBody>`.

---

## 7. Database & State Changes

### `[Current Convention]`
- **Storage Type**: The application is currently **in-memory only**.
  - Server storage: `Map<string, StreamItem>` managed by `streamManager` in `server/src/services/streamManager.ts`.
  - ID Generation: Sequential integer string incremented in memory (`String(this.nextId++)`).
  - Default Seeds: Hardcoded presets in `client/src/components/AddStreamModal/AddStreamModal.tsx` (`DEFAULT_STREAMS`). The backend boots with an empty `Map`.
- **Mutating Stream Data**:
  - In backend: All mutations must happen through `StreamManager` helper methods (`addStream`, `updateStream`, `deleteStream`, `startStream`, `stopStream`) so that status events and `stream:item_updated` broadcasts are fired reliably.
  - In client: All updates to `appStore.streams` must occur inside MobX actions, using `runInAction(() => { ... })` for asynchronous flows.

### `[Recommended Improvement]`
- When adding a persistence layer (e.g., SQLite via `better-sqlite3` or PostgreSQL via Prisma/Drizzle):
  - Replace sequential integer IDs with UUIDs (`crypto.randomUUID()`).
  - Isolate database queries into a `repositories/` or `dal/` directory.
  - Provide database migration scripts rather than altering in-memory structures ad-hoc.
  - Ensure server shutdown (`handleExit`) closes database pools cleanly alongside FFmpeg child processes.

---

## 8. Error Handling

### `[Current Convention]`
- **Backend Error Handling**:
  - Route handlers wrap asynchronous code in `try / catch (error: unknown)` blocks.
  - Safe error extraction pattern:
    ```typescript
    const message = error instanceof Error ? error.message : 'Fallback error message';
    res.status(statusCode).json({ success: false, message });
    ```
  - FFmpeg Child Processes:
    - Listen for `child.on('error', (err) => ...)` to catch spawn failures.
    - Listen for `child.stderr.on('data', (data) => ...)` to detect codec and network errors.
    - Listen for `child.on('exit', (code, signal) => ...)` to log crashes and mark stream status as `'error'` or `'stopped'`.
  - Process Graceful Shutdown:
    - Intercept `SIGINT` and `SIGTERM` in `server/src/index.ts` to execute `streamManager.cleanup()` and `server.close()`.
- **Frontend Error Handling**:
  - `apiClient` response interceptor catches HTTP errors, extracts `error.response?.data?.message`, and logs `[API Error]`.
  - `AppStore` methods catch errors and populate `this.errorMessage`.
  - UI components display user-friendly error banners (e.g., in `AddStreamModal`) or player error overlays with retry buttons (e.g., in `StreamPlayer`).
  - Frame decoding catches bitmap decoding failures and falls back to `Image()` element rendering.

### `[Recommended Improvement]`
- Introduce a centralized Express error handling middleware `(err, req, res, next)` at the bottom of `server/src/index.ts`.
- Introduce React Error Boundaries (`ErrorBoundary`) around `MainContent` and `StreamPlayer` to prevent single-player failures from unmounting the whole application.

---

## 9. Authentication & Authorization

### `[Current Convention]`
- **Application Level**:
  - No user authentication (no login, JWTs, cookies, or sessions) is currently enforced for the web UI or REST endpoints.
  - Socket.IO connection is unauthenticated.
- **RTSP Source Level**:
  - Authentication to external camera feeds is passed via URL basic credentials: `rtsp://<username>:<password>@<host>:<port>/<path>`.
  - The `AddStreamModal` component allows users to input credentials either as part of the full URL or via separate "Username" and "Password" fields, automatically formatting the URL.
- **MediaMTX Relay Credentials**:
  - Configured in `custom-video-streamer/mediamtx/mediamtx.yml`:
    - Read/view user: `viewer:viewer_password_123`
    - Publisher user: `publisher:publish_password_123`
    - API user: `apiuser:api_password_123`

### `[Recommended Improvement]`
- If user authentication is introduced:
  - Implement token-based authentication (e.g., JWT) via standard `Authorization: Bearer <token>` headers.
  - Add auth middleware for Express routes: `router.use(authMiddleware)`.
  - Add authentication middleware to Socket.IO: `io.use((socket, next) => { ... })`.
  - Separate camera credentials from client-visible URLs (store credentials securely on backend and pass sanitized URLs to client).

---

## 10. Validation

### `[Current Convention]`
- **Stream URL Validation**:
  - Enforced in both frontend (`AddStreamModal.tsx`) and backend (`server/src/routes/streams.ts`).
  - The URL must be a non-empty string and start with one of the allowed protocols:
    ```typescript
    const isValidStreamUrl = (url: string): boolean => {
      if (!url || typeof url !== 'string') return false;
      const trimmed = url.trim();
      return (
        trimmed.startsWith('rtsp://') ||
        trimmed.startsWith('rtsps://') ||
        trimmed.startsWith('http://') ||
        trimmed.startsWith('https://')
      );
    };
    ```
- **Stream Name**:
  - Optional; if empty or whitespace-only, default to `'New RTSP Stream'` on backend.
- **Payload Typing**:
  - Defined via DTOs (`CreateStreamDto`, `UpdateStreamDto` in backend; `CreateStreamPayload`, `UpdateStreamPayload` in client).

### `[Recommended Improvement]`
- Adopt runtime schema validation (e.g., Zod) on backend routes to automatically sanitize and type-validate request bodies, query parameters, and route parameters.

---

## 11. Security

### `[Current Convention]`
- **Credential Masking**:
  - Passwords in URLs must be masked before printing to logs:
    ```typescript
    const sanitizeStreamUrl = (url: string): string => {
      return url.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@');
    };
    ```
- **Child Process Command Injection Defense**:
  - Child processes are spawned using `child_process.spawn(FFMPEG_BIN, args)` with argument arrays and `shell: false`. **NEVER** use `child_process.exec()` or pass `{ shell: true }` when invoking FFmpeg.
- **Memory Buffer Runaway Guard**:
  - In `streamManager.ts`, rolling MJPEG frame buffers are capped at 4 MB:
    ```typescript
    if (frameBuffer.length > 4 * 1024 * 1024) {
      console.warn(`[StreamManager] Buffer overrun for stream ${id}, resetting`);
      frameBuffer = Buffer.alloc(0);
    }
    ```
- **CORS Configuration**:
  - Express currently enables `cors()` with origin callback returning `true` for development flexibility.

### `[Recommended Improvement]`
- Mask passwords in client-rendered UI (e.g., in `StreamCard` tooltip and `StreamPlayer` header) so credentials are not displayed in the browser DOM.
- Restrict `cors` origin in production to match `CLIENT_ORIGIN`.
- Sanitize stream URLs against SSRF or internal loopback attacks if exposed to untrusted external users.

---

## 12. Logging

### `[Current Convention]`
- **Prefixed Console Logging**:
  - All backend log entries use consistent module-identifying tags:
    - `[Server]` for server startup, shutdown, and route mounting.
    - `[StreamManager]` for stream creation, start, stop, exit, and frame statistics.
    - `[Socket]` for client connection, disconnection, and room joins.
    - `[API Error]` for client Axios interceptor error output.
    - `[AppStore]` for client state initialization or socket fallback warnings.
- **Log Levels**:
  - `console.log()` for operational lifecycle messages (start, stop, connect).
  - `console.warn()` for non-fatal irregularities (socket reconnection, buffer resets).
  - `console.error()` for process crashes, network failures, and 500 errors.
- **Credential Sanitization in Logs**:
  - Every log printing a stream URL must wrap it with `sanitizeStreamUrl(url)`.

### `[Recommended Improvement]`
- In production, integrate a structured JSON logger (such as Pino or Winston) with configurable log levels (`LOG_LEVEL=info|debug|warn|error`).

---

## 13. Testing

### `[Current Convention]`
- **Current State**: Automated test suites (`npm test`) are **not yet implemented** in either `client` or `server`.
- **Current Verification Mechanisms**:
  - Strict TypeScript type compilation:
    - Client: `npm run build` (`tsc -b && vite build`)
    - Server: `npm run build` (`tsc`)
  - Client linting: `npm run lint` (`eslint .`)
  - Integration testing via the mock streaming environment (`custom-video-streamer`).

### `[Recommended Improvement]`
- When adding tests:
  - Client: Install Vitest + React Testing Library for testing React components and MobX actions.
  - Server: Install Vitest or Jest + Supertest for testing REST routes (`/api/streams`, `/api/health`).
  - Unit tests for `isValidStreamUrl`, `sanitizeStreamUrl`, and the JPEG SOI/EOI demuxing algorithm.
  - Mock FFmpeg child process spawning during backend integration tests.

---

## 14. TypeScript & JavaScript Conventions

### `[Current Convention]`
- **Strict Typing**:
  - `tsconfig.json` and `tsconfig.app.json` configure `strict: true`. No implicit `any`.
  - Use `unknown` for caught errors: `catch (error: unknown)` and narrow with `error instanceof Error`.
- **Target & Module Resolution**:
  - Both client and server target modern ECMAScript (`ES2022`).
  - Use ES module syntax (`import` / `export`).
- **Type Definitions**:
  - Backend types belong in `server/src/types/stream.ts`.
  - Frontend types belong in `client/src/types/index.ts`.
  - Keep types synchronized across frontend and backend boundaries.
- **Explicit Return Types**:
  - Express routes and utility functions declare explicit return types (`Promise<void>`, `string`, `boolean`).

### `[Recommended Improvement]`
- Create a shared types package or module if the codebase moves to a monorepo structure, avoiding manual duplication between `client/src/types` and `server/src/types`.

---

## 15. React Conventions

### `[Current Convention]`
- **React 19 Compatibility**:
  - The client runs on React `19.3.1`. Avoid deprecated patterns (e.g., `defaultProps`, legacy context).
- **MobX React Lite**:
  - Use `observer` from `mobx-react-lite` on all observer components.
  - Keep state logic in `AppStore.ts` and keep components focused on presentation and UI events.
- **Hooks Rules**:
  - Keep effects clean and focused. Always return cleanup functions in `useEffect` when binding event listeners or timers.
  - Use `useRef` for values that persist across renders without causing re-renders (e.g., canvas elements, frame counters, mount indicators).
- **CSS & Theming**:
  - Root layout applies theme class (`dark` or `light`) on the outer `.app` container based on `appStore.dark`.
  - All components use semantic CSS classes and reference CSS custom properties.

### `[Recommended Improvement]`
- Use React `useId()` for generating unique form input IDs in modals.
- Split large components (such as `AddStreamModal.tsx` and `StreamPlayer.tsx`) into smaller sub-components if they exceed 250 lines.

---

## 16. Backend Conventions

### `[Current Convention]`
- **Express App Organization**:
  - Setup and middleware in `server/src/index.ts`.
  - Modular routers mounted via `app.use('/api/...', router)`.
  - Service singletons (`streamManager`, `socketService`) encapsulate operational state and child processes.
- **FFmpeg Execution Standard**:
  - Resolves binary path using priority:
    1. `process.env.FFMPEG_PATH`
    2. `ffmpeg-static` bundled binary
    3. System `'ffmpeg'` binary
  - Standard transcoding arguments:
    ```typescript
    const args = [
      '-rtsp_transport', 'tcp', // Enforce TCP for RTSP stability
      '-i', stream.url,
      '-an',                    // Disable audio
      '-c:v', 'mjpeg',          // Transcode video to MJPEG
      '-q:v', '4',              // JPEG quality factor (1-31, lower is better)
      '-r', '20',               // 20 frames per second
      '-f', 'image2pipe',       // Pipe discrete images to stdout
      '-',
    ];
    ```
- **Child Process Lifecycle**:
  - Store active processes in `Map<string, ActiveProcess>`:
    ```typescript
    interface ActiveProcess {
      child: ChildProcess;
      frameBuffer: Buffer;
    }
    ```
  - Kill processes on stream deletion, explicit stop, stream error, or server shutdown (`child.kill('SIGKILL')`).

### `[Recommended Improvement]`
- Add configurable max active streams limit (`MAX_CONCURRENT_STREAMS`) to prevent CPU exhaustion.
- Implement exponential backoff for auto-restarting crashed streams.

---

## 17. Git Practices

### `[Current Convention]`
- **Branch Strategy**: Development on `main` (or dedicated feature branches).
- **Commit Message Style**:
  - Short, descriptive, lowercase or sentence-case imperative messages summarizing the change directly:
    - `custom videos using in streaming`
    - `close stream btn fixes`
    - `pip icon fix, edit stream settings fixes`
    - `add stream modal UI refactored`
    - `authorization bug fixes`
- **Clean Diffs**:
  - Never stage build outputs (`dist/`), dependencies (`node_modules/`), or `.env` files.
  - Review `git status` and `git diff` before committing to ensure no unintended files or formatting changes are staged.

### `[Recommended Improvement]`
- Adopt Conventional Commits format when contributing major changes:
  - `feat: <description>`
  - `fix: <description>`
  - `refactor: <description>`
  - `docs: <description>`
  - `chore: <description>`

---

## 18. Environment Variables

### `[Current Convention]`
- **Server Variables (`server/.env`)**:

  | Variable | Default | Purpose |
  |---|---|---|
  | `PORT` | `4000` | Express HTTP and Socket.IO server listening port |
  | `CLIENT_ORIGIN` | `http://localhost:5173` | Allowed frontend origin for CORS |
  | `FFMPEG_PATH` | *(unset)* | Path to custom FFmpeg binary (optional fallback) |

- **Client Variables (`client/.env`)**:

  | Variable | Default | Purpose |
  |---|---|---|
  | `VITE_API_URL` | `http://localhost:4000` | Backend REST API base URL |
  | `VITE_WS_URL` | `ws://localhost:4000` | Backend WebSocket connection string |

- **Configuration Rules**:
  - Client accesses environment variables strictly through `client/src/config/env.ts` (`ENV.EXPRESS_URL`, `ENV.WS_URL`). Never spread raw `import.meta.env` throughout UI components.
  - Server loads environment variables at startup via `dotenv.config()` in `server/src/index.ts`.
  - Always provide `.env.example` templates matching `.env`.

### `[Recommended Improvement]`
- Validate environment variables at process launch using a lightweight schema validator, failing fast if required variables are invalid.

---

## 19. Dependency Management

### `[Current Convention]`
- **Package Managers**: Standard `npm` with `package-lock.json` committed in both `/client` and `/server`.
- **Existing Libraries**:
  - Client: `react`, `react-dom`, `mobx`, `mobx-react-lite`, `axios`, `socket.io-client`.
  - Server: `express`, `socket.io`, `cors`, `dotenv`, `ffmpeg-static`.
- **Pre-Installation Check**:
  - Before running `npm install <package>`, agents MUST verify whether an existing dependency or built-in language feature covers the need.
  - Examples:
    - Do NOT install `lodash` -> Use modern ES2022 array/object methods.
    - Do NOT install `uuid` -> Use Node's built-in `crypto.randomUUID()` or Web Crypto API.
    - Do NOT install UI icon libraries (like `lucide-react` or `react-icons`) -> Use `client/src/icons/icons.tsx`.
    - Do NOT install another state management tool (like Redux or Zustand) -> Use MobX `AppStore`.

---

## 20. Refactoring

### `[Current Convention]`
- **Scope Discipline**: Keep refactoring strictly scoped to the targeted module. Do not reformat adjacent functions or reorder imports across unrelated files.
- **Maintain Contracts**: Ensure class methods on `AppStore` and `StreamManager` retain their parameter and return signatures during internal refactoring.
- **Verification**: Run `npm run build` in both `client` and `server` after refactoring to confirm zero TypeScript compilation errors.

### `[Recommended Improvement]`
- When splitting large files, create private helper functions within the same directory before extracting them into global modules.

---

## 21. Performance

### `[Current Convention]`
- **Frame Decoding & Rendering**:
  - Decode binary JPEGs off the main React rendering loop using `window.createImageBitmap()`.
  - Close `ImageBitmap` instances immediately after `ctx.drawImage()` to avoid GPU and RAM leaks.
  - Rate limit incoming FPS calculation to once per second (`1000ms`).
- **Buffer Safety**:
  - Node stdout parser flushes frame buffers exceeding 4 MB to prevent unbounded memory growth from malformed streams.
- **Socket Efficiency**:
  - Binary frames are transmitted directly as `Buffer` objects over Socket.IO rooms (`stream:${id}`). Clients not subscribed to a stream's room do not receive its frames.
  - Only active and displayed streams should spawn transcode processes.

### `[Recommended Improvement]`
- Terminate backend FFmpeg processes when zero socket clients are subscribed to a stream room (on-demand transcoding).
- Implement client-side frame dropping if the browser falls behind the 20 FPS incoming rate.

---

## 22. Backward Compatibility

### `[Current Convention]`
- **Public API Stability**:
  - Retain all endpoints under `/api/streams` and `/api/health`.
  - Preserve the response shape `{ success: boolean, streams?: StreamItem[], stream?: StreamItem, message?: string }`.
- **Socket.IO Stability**:
  - Retain event names: `stream:join`, `stream:leave`, `stream:start`, `stream:stop`, `stream:frame`, `stream:status`, `stream:item_updated`, `stream:list`.
- **Client Fallbacks**:
  - If `window.createImageBitmap` is unsupported by a browser, `StreamPlayer` automatically falls back to `new Image()`.

---

## 23. AI Agent Workflow & Verification Checklist

When executing tasks in this codebase, every AI agent must execute this verification sequence before concluding work:

1. **Search Before Building**:
   - [ ] Searched existing components in `client/src/components/`?
   - [ ] Searched existing icons in `client/src/icons/icons.tsx`?
   - [ ] Searched store actions in `client/src/store/AppStore.ts`?
   - [ ] Searched routes and manager methods in `server/src/`?
2. **Minimal & Targeted Changes**:
   - [ ] Did you only touch files relevant to the user's prompt?
   - [ ] Are all unrelated files and comments intact?
3. **Security & Secrets Check**:
   - [ ] Are all logged URLs passed through `sanitizeStreamUrl()`?
   - [ ] Are passwords masked in UI renders?
   - [ ] No hardcoded passwords, API keys, or `.env` entries created?
4. **Build & Type Verification**:
   - [ ] Server builds cleanly: `cd server && npm run build`
   - [ ] Client builds cleanly: `cd client && npm run build`
   - [ ] Client passes linter: `cd client && npm run lint`
5. **Documentation Maintenance**:
   - [ ] If architecture, endpoints, data models, or behavior changed, were the corresponding documents updated in `.ai/`?

