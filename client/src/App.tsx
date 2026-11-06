import { useState, useCallback } from 'react'
import './App.css'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Stream {
  id: string
  name: string
  url: string
  active: boolean
  displayed: boolean
}

type Tab = 'active' | 'all'

// ─── Icons (inline SVG) ───────────────────────────────────────────────────────

const PlusCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
)

const FullscreenIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" />
    <line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" />
  </svg>
)

const SideBySideIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="18" rx="1" /><rect x="14" y="3" width="7" height="18" rx="1" />
  </svg>
)

const RefreshIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
)

const GearIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
)

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6M9 6V4h6v2" />
  </svg>
)

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
)

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
)

const VideoLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7" />
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </svg>
)

// ─── Demo video (fallback for RTSP which won't work in browser directly) ──────
const DEMO_SRC = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'

// ─── Add Stream Modal ─────────────────────────────────────────────────────────

function AddStreamModal({ onClose, onAdd }: { onClose: () => void; onAdd: (n: string, u: string) => void }) {
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Add New RTSP Stream</h3>
            <p className="modal-sub">Enter the details of the RTSP stream you want to add.</p>
          </div>
          <button className="icon-btn" onClick={onClose}><CloseIcon /></button>
        </div>
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            placeholder="Living Room Camera"
            value={name}
            onChange={e => setName(e.target.value)}
            autoFocus
          />
        </div>
        <div className="form-group">
          <label>RTSP URL</label>
          <input
            type="text"
            placeholder="rtsp://username:password@camera-ip:port/path"
            value={url}
            onChange={e => setUrl(e.target.value)}
          />
        </div>
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button
            className="btn-primary"
            disabled={!name.trim() || !url.trim()}
            onClick={() => { if (name.trim() && url.trim()) onAdd(name.trim(), url.trim()) }}
          >
            Add Stream
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Stream Sidebar Card ──────────────────────────────────────────────────────

function StreamCard({ stream, onDeactivate, onDelete }: {
  stream: Stream
  onDeactivate: (id: string) => void
  onDelete: (id: string) => void
}) {
  return (
    <div className={`stream-card ${stream.displayed ? 'stream-card--on' : ''}`}>
      <div className="stream-card-top">
        <div className="stream-card-info">
          <span className="stream-name">{stream.name}</span>
          <span className="stream-url">{stream.url}</span>
        </div>
        {stream.active && <span className="badge badge--active">Active</span>}
      </div>
      <div className="stream-card-actions">
        <button className="text-btn" onClick={() => onDeactivate(stream.id)}>
          <PlusCircleIcon /> Deactivate
        </button>
        <button className="text-btn text-btn--danger" onClick={() => onDelete(stream.id)}>
          <TrashIcon /> Delete
        </button>
      </div>
    </div>
  )
}

// ─── Stream Player ────────────────────────────────────────────────────────────

function StreamPlayer({ stream, onClose }: { stream: Stream; onClose: (id: string) => void }) {
  const [key, setKey] = useState(0)
  return (
    <div className="player">
      <div className="player-header">
        <div className="player-meta">
          <span className="player-name">{stream.name}</span>
          <span className="player-desc">Sample video</span>
        </div>
        <div className="player-controls">
          <span className="badge badge--demo">Demo connected</span>
          <button className="icon-btn" title="Fullscreen" onClick={() => {
            const v = document.getElementById(`vid-${stream.id}`) as HTMLVideoElement | null
            v?.requestFullscreen?.()
          }}><FullscreenIcon /></button>
          <button className="icon-btn" title="Picture-in-picture"><SideBySideIcon /></button>
          <button className="icon-btn" title="Refresh" onClick={() => setKey(k => k + 1)}><RefreshIcon /></button>
          <button className="icon-btn" title="Settings"><GearIcon /></button>
          <button className="icon-btn icon-btn--close" title="Stop display" onClick={() => onClose(stream.id)}><CloseIcon /></button>
        </div>
      </div>
      <div className="player-video-wrap">
        <video
          id={`vid-${stream.id}`}
          key={key}
          src={DEMO_SRC}
          autoPlay muted loop playsInline
        />
      </div>
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

let _id = 1

export default function App() {
  const [dark, setDark] = useState(true)
  const [tab, setTab] = useState<Tab>('all')
  const [streams, setStreams] = useState<Stream[]>([])
  const [modal, setModal] = useState(false)

  const addStream = useCallback((name: string, url: string) => {
    const id = String(_id++)
    setStreams(p => [...p, { id, name, url, active: true, displayed: true }])
    setModal(false)
  }, [])

  const deactivate = useCallback((id: string) => {
    setStreams(p => p.map(s => s.id === id ? { ...s, active: false, displayed: false } : s))
  }, [])

  const hideDisplay = useCallback((id: string) => {
    setStreams(p => p.map(s => s.id === id ? { ...s, displayed: false } : s))
  }, [])

  const deleteStream = useCallback((id: string) => {
    setStreams(p => p.filter(s => s.id !== id))
  }, [])

  const listStreams = tab === 'active' ? streams.filter(s => s.active) : streams
  const displayed = streams.filter(s => s.active && s.displayed)

  return (
    <div className={`app ${dark ? 'dark' : 'light'}`}>
      {/* Topbar */}
      <header className="topbar">
        <div className="topbar-left">
          <span className="topbar-icon"><VideoLogo /></span>
          <span className="topbar-title">RTSP Stream Viewer</span>
        </div>
        <button className="icon-btn icon-btn--theme" onClick={() => setDark(d => !d)} title="Toggle theme">
          {dark ? <SunIcon /> : <MoonIcon />}
        </button>
      </header>

      <div className="layout">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-tabs">
            <button className={`tab ${tab === 'active' ? 'tab--on' : ''}`} onClick={() => setTab('active')}>Active</button>
            <button className={`tab ${tab === 'all' ? 'tab--on' : ''}`} onClick={() => setTab('all')}>All Streams</button>
            <button className="add-btn" onClick={() => setModal(true)}><PlusCircleIcon /> Add</button>
          </div>

          <div className="sidebar-list">
            {listStreams.length === 0 ? (
              <div className="sidebar-empty">
                <p>No streams available</p>
                <button className="btn-primary" onClick={() => setModal(true)}>
                  <PlusCircleIcon /> Add Stream
                </button>
              </div>
            ) : (
              listStreams.map(s => (
                <StreamCard key={s.id} stream={s} onDeactivate={deactivate} onDelete={deleteStream} />
              ))
            )}
          </div>
        </aside>

        {/* Main */}
        <main className="main">
          {displayed.length === 0 ? (
            <div className="main-empty">
              <div className="main-empty-box">
                <p className="main-empty-title">No streams are being displayed.</p>
                <p className="main-empty-sub">Select a stream from the sidebar to view it, or add a new one.</p>
                <button className="btn-primary" onClick={() => setModal(true)}>
                  <PlusCircleIcon /> Add New Stream
                </button>
              </div>
            </div>
          ) : (
            <div className="main-content">
              <div className="main-header">Displayed Streams ({displayed.length}/{displayed.length})</div>
              <div className={`players-grid ${displayed.length === 1 ? 'players-grid--1' : 'players-grid--2'}`}>
                {displayed.map(s => <StreamPlayer key={s.id} stream={s} onClose={hideDisplay} />)}
              </div>
            </div>
          )}
        </main>
      </div>

      {modal && <AddStreamModal onClose={() => setModal(false)} onAdd={addStream} />}
    </div>
  )
}
