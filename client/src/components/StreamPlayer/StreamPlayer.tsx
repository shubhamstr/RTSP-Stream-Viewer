import { useEffect, useRef, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { appStore } from '../../store/AppStore'
import {
  CloseIcon,
  FullscreenIcon,
  GearIcon,
  PauseIcon,
  PipIcon,
  PlayIcon,
  RefreshIcon,
} from '../../icons/icons'
import type { Stream, StreamStatus } from '../../types'
import getSocket from '../../services/socketService'

interface StreamPlayerProps {
  stream: Stream
}

const StreamPlayer = observer(({ stream }: StreamPlayerProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isMountedRef = useRef(true)

  const [hasFrame, setHasFrame] = useState(false)
  const [isPlaying, setIsPlaying] = useState(true)
  const [fps, setFps] = useState<number>(0)
  const [localError, setLocalError] = useState<string | null>(null)

  const frameCountRef = useRef(0)
  const lastFpsCalcRef = useRef(Date.now())

  const streamStatus: StreamStatus = stream.status || (stream.error ? 'error' : hasFrame ? 'streaming' : 'starting')
  const streamError = stream.error || localError

  useEffect(() => {
    isMountedRef.current = true
    const socket = getSocket()

    // Subscribe to this stream room
    socket.emit('stream:join', { streamId: stream.id })

    // Frame receiver over WebSocket
    const handleFrame = (data: { streamId: string; frame: ArrayBuffer; timestamp: number }) => {
      if (data.streamId !== stream.id || !isMountedRef.current) return

      frameCountRef.current++
      const now = Date.now()
      if (now - lastFpsCalcRef.current >= 1000) {
        setFps(frameCountRef.current)
        frameCountRef.current = 0
        lastFpsCalcRef.current = now
      }

      const blob = new Blob([data.frame], { type: 'image/jpeg' })

      if (window.createImageBitmap) {
        window.createImageBitmap(blob).then((bitmap) => {
          if (!isMountedRef.current || !canvasRef.current) {
            bitmap.close()
            return
          }
          const canvas = canvasRef.current
          if (canvas.width !== bitmap.width || canvas.height !== bitmap.height) {
            canvas.width = bitmap.width
            canvas.height = bitmap.height
          }
          const ctx = canvas.getContext('2d')
          if (ctx) {
            ctx.drawImage(bitmap, 0, 0)
          }
          bitmap.close()
          setHasFrame(true)
          setLocalError(null)
        }).catch(() => {
          // Fallback to Image() if bitmap creation fails
          renderViaImage(blob)
        })
      } else {
        renderViaImage(blob)
      }
    }

    const renderViaImage = (blob: Blob) => {
      const url = URL.createObjectURL(blob)
      const img = new Image()
      img.onload = () => {
        if (!isMountedRef.current || !canvasRef.current) {
          URL.revokeObjectURL(url)
          return
        }
        const canvas = canvasRef.current
        if (canvas.width !== img.width || canvas.height !== img.height) {
          canvas.width = img.width
          canvas.height = img.height
        }
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(img, 0, 0)
        }
        URL.revokeObjectURL(url)
        setHasFrame(true)
        setLocalError(null)
      }
      img.onerror = () => {
        URL.revokeObjectURL(url)
      }
      img.src = url
    }

    const handleError = (data: { streamId: string; error: string }) => {
      if (data.streamId !== stream.id) return
      console.warn(`[StreamPlayer] Stream ${stream.id} error:`, data.error)
      setLocalError(data.error)
    }

    const handleStatus = (data: { streamId: string; status: StreamStatus; error?: string }) => {
      if (data.streamId !== stream.id) return
      if (data.error) setLocalError(data.error)
      if (data.status === 'streaming') setLocalError(null)
    }

    socket.on('stream:frame', handleFrame)
    socket.on('stream:error', handleError)
    socket.on('stream:status', handleStatus)

    return () => {
      isMountedRef.current = false
      socket.emit('stream:leave', { streamId: stream.id })
      socket.off('stream:frame', handleFrame)
      socket.off('stream:error', handleError)
      socket.off('stream:status', handleStatus)
    }
  }, [stream.id])

  const handleTogglePlay = async () => {
    if (isPlaying && streamStatus === 'streaming') {
      setIsPlaying(false)
      await appStore.stopStream(stream.id)
    } else {
      setIsPlaying(true)
      setLocalError(null)
      await appStore.startStream(stream.id)
    }
  }

  const handleRefresh = async () => {
    setLocalError(null)
    setHasFrame(false)
    await appStore.startStream(stream.id)
  }

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen().catch((err) => {
          console.warn('Fullscreen error:', err)
        })
      } else {
        document.exitFullscreen().catch(() => {})
      }
    }
  }

  const handlePiP = async () => {
    try {
      if (canvasRef.current && 'captureStream' in canvasRef.current) {
        const streamMedia = (canvasRef.current as any).captureStream()
        const video = document.createElement('video')
        video.srcObject = streamMedia
        video.muted = true
        await video.play()
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture()
        } else if (document.pictureInPictureEnabled) {
          await video.requestPictureInPicture()
        }
      }
    } catch (e) {
      console.warn('Picture-in-Picture not supported or failed:', e)
    }
  }

  return (
    <div className="player" ref={containerRef}>
      {/* Header */}
      <div className="player-header">
        <div className="player-meta">
          <span className="player-name">{stream.name}</span>
          <span className="player-desc" title={stream.url}>
            {stream.url}
          </span>
        </div>

        <div className="player-controls">
          {streamStatus === 'streaming' && (
            <span className="badge badge--active">
              ● Live {fps > 0 ? `(${fps} fps)` : ''}
            </span>
          )}
          {streamStatus === 'starting' && (
            <span className="badge badge--starting">Connecting...</span>
          )}
          {streamStatus === 'error' && (
            <span className="badge badge--error">Error</span>
          )}
          {streamStatus === 'stopped' && (
            <span className="badge badge--stopped">Paused</span>
          )}

          {/* Play / Pause Toggle */}
          <button
            className="icon-btn"
            title={isPlaying && streamStatus === 'streaming' ? 'Pause' : 'Play'}
            onClick={handleTogglePlay}
          >
            {isPlaying && streamStatus === 'streaming' ? <PauseIcon /> : <PlayIcon />}
          </button>

          {/* Refresh stream */}
          <button
            className="icon-btn"
            title="Restart FFmpeg stream"
            onClick={handleRefresh}
          >
            <RefreshIcon />
          </button>

          {/* Picture in picture */}
          <button
            className="icon-btn"
            title="Picture-in-picture"
            onClick={handlePiP}
          >
            <PipIcon />
          </button>

          {/* Fullscreen */}
          <button
            className="icon-btn"
            title="Fullscreen"
            onClick={handleFullscreen}
          >
            <FullscreenIcon />
          </button>

          {/* Stream settings */}
          <button
            className="icon-btn"
            title="Stream settings"
            onClick={() => appStore.openModal(stream)}
          >
            <GearIcon />
          </button>

          {/* Close / Hide */}
          <button
            className="icon-btn icon-btn--close"
            title="Hide from view"
            onClick={(e) => {
              e.stopPropagation()
              appStore.hideStream(stream.id)
            }}
          >
            <CloseIcon />
          </button>
        </div>
      </div>

      {/* Video Canvas Area */}
      <div className="player-video-wrap">
        <canvas
          id={`canvas-${stream.id}`}
          ref={canvasRef}
          style={{
            display: hasFrame && streamStatus !== 'error' ? 'block' : 'none',
          }}
        />

        {/* Error overlay */}
        {streamStatus === 'error' && (
          <div className="player-overlay player-overlay--error">
            <div className="player-error-title">⚠️ Stream Connection Error</div>
            <p className="player-error-msg">
              {streamError || 'Failed to connect to RTSP stream via FFmpeg'}
            </p>
            <button className="btn-primary" onClick={handleRefresh}>
              <RefreshIcon /> Reconnect Stream
            </button>
          </div>
        )}

        {/* Starting / Connecting overlay */}
        {streamStatus === 'starting' && !hasFrame && !streamError && (
          <div className="player-overlay">
            <div className="player-spinner" />
            <p>Processing stream with FFmpeg & WebSockets...</p>
          </div>
        )}

        {/* Stopped / Paused overlay */}
        {streamStatus === 'stopped' && (
          <div className="player-overlay">
            <p style={{ color: '#94a3b8' }}>Stream paused</p>
            <button className="btn-primary" onClick={handleTogglePlay}>
              <PlayIcon /> Resume Stream
            </button>
          </div>
        )}
      </div>
    </div>
  )
})

export default StreamPlayer
