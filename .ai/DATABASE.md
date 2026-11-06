# Database & Data Persistence

## 1. Database Technology: In-Memory Storage
The application **does not currently use a persistent external database** (such as PostgreSQL, MySQL, MongoDB, or SQLite). 

All stream metadata, active states, and runtime metrics exist **in-memory** within the Node.js process on the backend and within the MobX observable store on the client.

| Aspect | Current Implementation |
|---|---|
| **Database Engine** | None (In-Memory `Map`) |
| **Backend Storage** | `Map<string, StreamItem>` in [`server/src/services/streamManager.ts`](file:///w:/shubham/personal/RTSP-Video-Stream-Viewer/server/src/services/streamManager.ts) |
| **Client Storage** | Observable Array `streams: Stream[]` in [`client/src/store/AppStore.ts`](file:///w:/shubham/personal/RTSP-Video-Stream-Viewer/client/src/store/AppStore.ts) |
| **Persistence Lifecycle** | Ephemeral. Restarting the server or refreshing the frontend discards non-persisted user changes. |
| **ID Generation** | Simple incrementing integer counter converted to string (`String(this.nextId++)`). Starts at `1` on server boot. |

---

## 2. In-Memory Entities & Schemas

### `StreamItem` (Backend Entity)
Defined in [`server/src/types/stream.ts`](file:///w:/shubham/personal/RTSP-Video-Stream-Viewer/server/src/types/stream.ts):

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | Yes | Unique stream identifier (e.g., `"1"`, `"2"`). Key in the backend `Map`. |
| `name` | `string` | Yes | Human-readable label for the camera feed (e.g., `"Living Room Camera"`). |
| `url` | `string` | Yes | Target RTSP or HTTP stream URL (e.g., `rtsp://user:pass@host:8554/feed`). |
| `status` | `'stopped' \| 'starting' \| 'streaming' \| 'error'` | Yes | Current runtime state of the stream's transcoding process. |
| `active` | `boolean` | Yes | Flag indicating whether the stream is enabled/available in the system. |
| `displayed` | `boolean` | Yes | Flag indicating whether the stream is currently visible in the client grid. |
| `error` | `string` | No | Description of the last error encountered by FFmpeg or the network layer. |
| `fps` | `number` | No | Optional framerate indicator. |
| `lastActive` | `number` | No | Unix timestamp (ms) of the most recently decoded video frame. |
| `createdAt` | `number` | Yes | Unix timestamp (ms) when the stream was registered in the manager. |

### `Stream` (Frontend Entity)
Defined in [`client/src/types/index.ts`](file:///w:/shubham/personal/RTSP-Video-Stream-Viewer/client/src/types/index.ts):
Mirrors `StreamItem` with optionality on `status` and `createdAt` during initial client-side object hydration.

---

## 3. Indexes & Lookups

Since storage is backed by native JavaScript collections:
1. **Primary Key Lookup (`getById`)**: $O(1)$ complexity via `this.streams.get(id)` on `Map<string, StreamItem>`.
2. **All Streams Query (`getAll`)**: $O(N)$ complexity converting map values: `Array.from(this.streams.values())`.
3. **Delete Operation (`deleteStream`)**: $O(1)$ complexity via `this.streams.delete(id)`.
4. **Client-side filtering**:
   - `listedStreams`: $O(N)$ filter by `s.active` when tab is `'active'`.
   - `displayedStreams`: $O(N)$ filter by `s.active && s.displayed`.

---

## 4. Preset & Default Seed Data
The server starts with an **empty** stream map (`this.streams = new Map()`).

Default streams are defined on the frontend in [`client/src/components/AddStreamModal/AddStreamModal.tsx`](file:///w:/shubham/personal/RTSP-Video-Stream-Viewer/client/src/components/AddStreamModal/AddStreamModal.tsx):

| Stream Name | Pre-Configured URL | Protocol & Port |
|---|---|---|
| **Earth (MediaMTX)** | `rtsp://viewer:viewer_password_123@localhost:8554/earth` | RTSP (:8554) |
| **Road & Trees (MediaMTX)** | `rtsp://viewer:viewer_password_123@localhost:8554/road_and_trees` | RTSP (:8554) |
| **Watering Plant (MediaMTX)** | `rtsp://viewer:viewer_password_123@localhost:8554/watering_plant` | RTSP (:8554) |

Users can add them individually or in batch via "+ Add All", which issues `POST /api/streams` requests to the backend.

---

## 5. Technical Debt & Database Roadmap

- [ ] **No Persistence**: Restarting the Node backend terminates all streams and wipes out any custom streams added by users.
- [ ] **Sequential Integer IDs**: `nextId = 1` resets to 1 upon server restart, creating ID collisions if data were ever partially cached or logged across sessions. UUIDs (`crypto.randomUUID()`) should replace integer IDs.
- [ ] **Multi-User / Multi-Tenant Isolation**: All connected users share the exact same global stream list. No tenant, user, or organization scoping exists.
- [ ] **Recommended Database Engine**:
  - For local single-node: **SQLite** via `better-sqlite3` or **Prisma**.
  - For production distributed deployment: **PostgreSQL** or **MongoDB**.

