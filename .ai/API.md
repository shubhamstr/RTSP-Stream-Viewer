# API & Socket.IO Specification

## 1. API Architecture Overview

The system provides a hybrid communication interface:
- **HTTP REST API**: Used for deterministic CRUD operations, status inspection, and lifecycle commands (`start`, `stop`).
- **WebSocket (Socket.IO)**: Used for high-frequency binary MJPEG frame transmission, stream room subscription (`join`, `leave`), and reactive broadcast updates (`stream:list`, `stream:status`, `stream:item_updated`).

- **Default Server Base URL**: `http://localhost:4000`
- **Default WebSocket Endpoint**: `ws://localhost:4000` (or `http://localhost:4000/socket.io/`)

---

## 2. REST Endpoints

### 2.1 System & Health

#### `GET /`
Returns high-level system information and current stream counts.
- **Request**: None
- **Response** (`200 OK`):
  ```json
  {
    "name": "RTSP Video Stream Viewer API",
    "version": "1.0.0",
    "status": "running",
    "activeStreams": 2,
    "totalStreams": 3
  }
  ```

#### `GET /api/health`
Health probe indicating server uptime and current server timestamp.
- **Request**: None
- **Response** (`200 OK`):
  ```json
  {
    "status": "ok",
    "uptime": 128.452,
    "timestamp": "2026-11-06T17:15:00.000Z"
  }
  ```

---

### 2.2 Streams Resource (`/api/streams`)

#### `GET /api/streams`
Fetches all currently registered streams.
- **Request**: None
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "streams": [
      {
        "id": "1",
        "name": "Earth (MediaMTX)",
        "url": "rtsp://viewer:viewer_password_123@localhost:8554/earth",
        "status": "streaming",
        "active": true,
        "displayed": true,
        "createdAt": 1730913300000,
        "lastActive": 1730913310000
      }
    ],
    "count": 1
  }
  ```

#### `GET /api/streams/:id`
Retrieves a specific stream by its ID.
- **URL Parameters**: `id` (string)
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "stream": {
      "id": "1",
      "name": "Earth (MediaMTX)",
      "url": "rtsp://viewer:viewer_password_123@localhost:8554/earth",
      "status": "streaming",
      "active": true,
      "displayed": true,
      "createdAt": 1730913300000
    }
  }
  ```
- **Error Response** (`404 Not Found`):
  ```json
  { "success": false, "message": "Stream 1 not found" }
  ```

#### `POST /api/streams`
Registers a new stream. If `active` and `displayed` are `true` (default), the server immediately starts transcoding.
- **Request Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "name": "Front Door Camera",
    "url": "rtsp://localhost:8554/earth",
    "active": true,
    "displayed": true
  }
  ```
- **Validation**:
  - `url` is required, non-empty string.
  - `url` must start with `rtsp://`, `rtsps://`, `http://`, or `https://`.
- **Response** (`201 Created`):
  ```json
  {
    "success": true,
    "message": "Stream added successfully",
    "stream": {
      "id": "2",
      "name": "Front Door Camera",
      "url": "rtsp://localhost:8554/earth",
      "status": "starting",
      "active": true,
      "displayed": true,
      "createdAt": 1730913350000
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: `{ "success": false, "message": "Stream URL is required" }`
  - `400 Bad Request`: `{ "success": false, "message": "Invalid stream URL format..." }`
  - `500 Internal Server Error`: `{ "success": false, "message": "..." }`

#### `POST /api/streams/:id/start`
Starts or restarts the backend FFmpeg transcoding process for the stream.
- **URL Parameters**: `id` (string)
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Stream 1 started",
    "stream": { ... }
  }
  ```
- **Error Response** (`400 Bad Request`):
  ```json
  { "success": false, "message": "Stream 1 not found" }
  ```

#### `POST /api/streams/:id/stop`
Stops the FFmpeg child process associated with this stream.
- **URL Parameters**: `id` (string)
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Stream 1 stopped",
    "stream": { ... }
  }
  ```
- **Error Response** (`404 Not Found`):
  ```json
  { "success": false, "message": "Stream 1 not found" }
  ```

#### `PATCH /api/streams/:id`
Updates stream properties (name, url, active status, displayed status).
- **URL Parameters**: `id` (string)
- **Request Body** (Partial `UpdateStreamDto`):
  ```json
  {
    "name": "Updated Name",
    "active": false,
    "displayed": false
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Stream updated successfully",
    "stream": { ... }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Invalid URL format if URL provided.
  - `404 Not Found`: Stream does not exist.

#### `DELETE /api/streams/:id`
Removes a stream from the registry and terminates any active FFmpeg processes.
- **URL Parameters**: `id` (string)
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Stream 1 removed",
    "id": "1"
  }
  ```
- **Error Response** (`404 Not Found`):
  ```json
  { "success": false, "message": "Stream 1 not found" }
  ```

---

## 3. Socket.IO Events

The Socket.IO server is initialized on the same HTTP server port (`4000`) with rooms scoped per stream (`stream:${id}`).

### 3.1 Client-to-Server Events

| Event Name | Payload Format | Description |
|---|---|---|
| `ping` | *None* | Heartbeat health check. Server replies with `pong`. |
| `stream:get_all` | *None* | Requests full array of all registered streams. Server replies with `stream:list`. |
| `stream:join` | `{ streamId: string }` | Joins the socket room `stream:${streamId}`. If the stream is active and stopped, the server automatically triggers `startStream()`. |
| `stream:leave` | `{ streamId: string }` | Leaves the socket room `stream:${streamId}`. Halts frame delivery to this client. |
| `stream:start` | `{ streamId: string }` | Requests explicit start of FFmpeg transcoding for `streamId`. |
| `stream:stop` | `{ streamId: string }` | Requests explicit stop of FFmpeg transcoding for `streamId`. |

### 3.2 Server-to-Client Events

| Event Name | Scope | Payload Format | Description |
|---|---|---|---|
| `pong` | Direct Caller | `{ timestamp: number }` | Heartbeat pong response containing current timestamp. |
| `stream:list` | Broadcast / Direct | `StreamItem[]` | Complete array of registered streams sent on connect or list change. |
| `stream:status` | Room `stream:${id}` | `{ streamId: string, status: StreamStatus, error?: string, active?: boolean, displayed?: boolean }` | Emitted when a stream changes status (`starting`, `streaming`, `stopped`, `error`). |
| `stream:item_updated` | Global Broadcast | `StreamItem` | Emitted whenever a single stream's metadata or status changes. |
| `stream:frame` | Room `stream:${id}` | `{ streamId: string, frame: Buffer / ArrayBuffer, timestamp: number }` | Binary MJPEG frame payload emitted at ~20 FPS. |
| `stream:error` | Room `stream:${id}` | `{ streamId: string, error: string }` | Emitted when FFmpeg fails to spawn, encounters an error, or stream times out. |

---

## 4. Authentication, Authorization & Security Notes
- **Current State**: Neither the REST API nor the Socket.IO server requires authentication tokens (e.g., Bearer JWT or API keys).
- **CORS Configuration**: In [`server/src/index.ts`](file:///w:/shubham/personal/RTSP-Video-Stream-Viewer/server/src/index.ts), CORS origin is dynamically permitted for all origins: `origin: (origin, callback) => callback(null, true)`.
- **RTSP Authentication**: Camera credentials can be passed inside the RTSP URL (`rtsp://user:pass@host...`). The backend sanitizes these credentials when logging to console (`sanitizeStreamUrl`).

