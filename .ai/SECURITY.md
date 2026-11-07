# Security Architecture & Risk Analysis

## 1. Authentication & Authorization

| Domain | Current Implementation | Risk Level |
|---|---|---|
| **Frontend Application** | None. No login, session cookie, or token-based auth. | Medium (suitable for internal dev, not public web) |
| **Backend REST API** | None. All endpoints (`/api/streams`, `/api/health`) are open. | Medium |
| **Server Log Files** | Protected via `protectLogsMiddleware` (returns `403 Forbidden` on any HTTP access to `/logs` or `*.log`). | Low / Protected |
| **Socket.IO Server** | None. Any client can connect and join any stream room. | Medium |
| **RTSP Stream Sources** | Basic/Digest auth via URL credentials (`rtsp://user:pass@host:port/path`). | Low / Standard for RTSP |
| **MediaMTX Relay** | Internal YAML credentials: `viewer:viewer_password_123` (read), `publisher:publish_password_123` (publish), `apiuser:api_password_123` (API). | Low (local demo) |

---

## 2. Secrets Management & Credentials Handling

### 2.1 Passwords in URLs
- **Current Practice**: RTSP streams often require credentials formatted as `rtsp://<user>:<password>@<host>:<port>/<path>`.
- **Backend Log Sanitization**: Both [`server/src/services/streamManager.ts`](file:///w:/shubham/personal/RTSP-Video-Stream-Viewer/server/src/services/streamManager.ts#L21-L23) and the enterprise logging service [`server/src/services/logger.ts`](file:///w:/shubham/personal/RTSP-Video-Stream-Viewer/server/src/services/logger.ts) sanitize all logged strings and metadata. Passwords in URLs are automatically masked to `rtsp://$1:***@` and Bearer tokens are redacted via regular expression transforms before any log is written to console or disk.
- **Log Files Protection**: Direct public HTTP requests to the server's `/logs` directory or any `*.log` files are intercepted by `protectLogsMiddleware` in `server/src/index.ts` and rejected with `403 Forbidden`.
- **Known Risk (Frontend Exposure)**: In [`client/src/components/StreamPlayer/StreamPlayer.tsx`](file:///w:/shubham/personal/RTSP-Video-Stream-Viewer/client/src/components/StreamPlayer/StreamPlayer.tsx) and [`client/src/components/StreamCard/StreamCard.tsx`](file:///w:/shubham/personal/RTSP-Video-Stream-Viewer/client/src/components/StreamCard/StreamCard.tsx), `stream.url` is rendered in DOM text and `title="..."` attributes. If credentials are included in `stream.url`, they are visible in plaintext in the browser DOM and hover tooltips.

### 2.2 Environment Variables
- `server/.env` contains `PORT=4000`, `CLIENT_ORIGIN=http://localhost:5173`, and logging configurations (`LOG_LEVEL`, `LOGS_DIR`, `LOG_MAX_FILES`, `LOG_MAX_SIZE`, `LOG_ZIPPED_ARCHIVE`).
- `client/.env` contains `VITE_API_URL=http://localhost:4000` and `VITE_WS_URL=ws://localhost:4000`.
- No sensitive production secrets or private API keys are checked into source control (`.gitignore` protects local `.env` and `.log` files).

---

## 3. Input Validation & Injection Risks

### 3.1 Child Process Execution (`child_process.spawn`)
- In [`server/src/services/streamManager.ts`](file:///w:/shubham/personal/RTSP-Video-Stream-Viewer/server/src/services/streamManager.ts#L171), the backend invokes FFmpeg using `spawn(FFMPEG_BIN, args)`.
- **Security Posture**: Because `spawn` is used without `shell: true`, shell command injection (e.g., `rtsp://localhost; rm -rf /`) is prevented by default at the OS shell level.
- **FFmpeg Protocol Injection Risk**: FFmpeg has numerous internal demuxers and protocols (e.g., `file://`, `concat:`, `pipe:`, `gopher:`). While [`server/src/routes/streams.ts`](file:///w:/shubham/personal/RTSP-Video-Stream-Viewer/server/src/routes/streams.ts#L13-L22) restricts URLs to protocols starting with `rtsp://`, `rtsps://`, `http://`, or `https://`, an attacker could potentially supply crafted RTSP URLs with query parameters or complex header injections.

---

## 4. Denial of Service (DoS) & Resource Exhaustion

1. **Unbounded FFmpeg Process Spawning**:
   - Each active stream spawns a dedicated OS FFmpeg process that continuously decodes H.264 video and encodes MJPEG frames at 20 FPS.
   - There is currently **no limit on the number of concurrent streams** that can be created via `POST /api/streams`.
   - *Risk*: A malicious client could create dozens of streams, saturating server CPU and memory.
2. **Memory Buffer in MJPEG Chunk Parsing**:
   - In `streamManager.ts`, incoming stdout chunks are accumulated in a Node.js `Buffer`.
   - *Mitigation implemented*: The codebase guards against buffer runaway:
     ```typescript
     if (frameBuffer.length > 4 * 1024 * 1024) {
       frameBuffer = Buffer.alloc(0);
     }
     ```
3. **Socket.IO Buffer Size**:
   - `maxHttpBufferSize` is set to `1e7` (10 MB). High numbers of connected clients receiving 20 FPS binary frames simultaneously could exhaust Node.js event loop capacity and network egress.

---

## 5. Network & Cross-Origin Policies (CORS)

- In [`server/src/index.ts`](file:///w:/shubham/personal/RTSP-Video-Stream-Viewer/server/src/index.ts#L19-L28):
  ```typescript
  app.use(
    cors({
      origin: (origin, callback) => callback(null, true),
      credentials: true,
    })
  );
  ```
- **Risk**: Setting origin callback to unconditionally return `true` effectively allows any origin to make authenticated cross-origin requests.
- **Remediation for Production**: Restrict `origin` strictly to validated values from `CLIENT_ORIGIN`.

