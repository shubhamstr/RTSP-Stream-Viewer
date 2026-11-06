import { useState } from 'react'
import { observer } from 'mobx-react-lite'
import { appStore } from '../../store/AppStore'
import {
  CloseIcon,
  FullscreenIcon,
  GearIcon,
  RefreshIcon,
  SideBySideIcon,
} from '../../icons/icons'
import type { Stream } from '../../types'

// Fallback demo video — RTSP cannot be played directly in a browser.
// In production, pipe RTSP → HLS / WebRTC via a server-side relay.
const DEMO_SRC =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'

interface StreamPlayerProps {
  stream: Stream
}

const StreamPlayer = observer(({ stream }: StreamPlayerProps) => {
  const [videoKey, setVideoKey] = useState(0)

  const handleFullscreen = () => {
    const el = document.getElementById(`vid-${stream.id}`) as HTMLVideoElement | null
    el?.requestFullscreen?.()
  }

  return (
    <div className="player">

      {/* Header */}
      <div className="player-header">
        <div className="player-meta">
          <span className="player-name">{stream.name}</span>
          <span className="player-desc">Sample video</span>
        </div>

        <div className="player-controls">
          <span className="badge badge--demo">Demo connected</span>

          <button className="icon-btn" title="Fullscreen" onClick={handleFullscreen}>
            <FullscreenIcon />
          </button>
          <button className="icon-btn" title="Picture-in-picture">
            <SideBySideIcon />
          </button>
          <button
            className="icon-btn"
            title="Refresh stream"
            onClick={() => setVideoKey((k) => k + 1)}
          >
            <RefreshIcon />
          </button>
          <button className="icon-btn" title="Settings">
            <GearIcon />
          </button>
          <button
            className="icon-btn icon-btn--close"
            title="Stop displaying"
            onClick={() => appStore.hideStream(stream.id)}
          >
            <CloseIcon />
          </button>
        </div>
      </div>

      {/* Video */}
      <div className="player-video-wrap">
        <video
          id={`vid-${stream.id}`}
          key={videoKey}
          src={DEMO_SRC}
          autoPlay
          muted
          loop
          playsInline
        />
      </div>

    </div>
  )
})

export default StreamPlayer
