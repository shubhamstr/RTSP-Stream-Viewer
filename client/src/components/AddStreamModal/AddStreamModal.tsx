import { useState } from 'react'
import { observer } from 'mobx-react-lite'
import { appStore } from '../../store/AppStore'
import { CheckIcon, CloseIcon, PlusCircleIcon } from '../../icons/icons'

export interface DefaultStreamOption {
  name: string
  url: string
  tag: string
}

export const DEFAULT_STREAMS: DefaultStreamOption[] = [
  {
    name: 'Big Buck Bunny (MediaMTX)',
    url: 'rtsp://viewer:viewer_password_123@localhost:8554/bbb',
    tag: 'MediaMTX RTSP',
  },
  {
    name: 'Elephants Dream (MediaMTX)',
    url: 'rtsp://viewer:viewer_password_123@localhost:8554/elephants',
    tag: 'MediaMTX RTSP',
  },
  {
    name: 'Tears of Steel (MediaMTX)',
    url: 'rtsp://viewer:viewer_password_123@localhost:8554/tears',
    tag: 'MediaMTX RTSP',
  },
]

const AddStreamModal = observer(() => {
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [addingUrl, setAddingUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const isStreamInList = (streamUrl: string) => {
    const target = streamUrl.trim().toLowerCase()
    return appStore.streams.some((s) => s.url.trim().toLowerCase() === target)
  }

  const unaddedDefaults = DEFAULT_STREAMS.filter((d) => !isStreamInList(d.url))

  // Direct 1-click addition of a default streaming option
  const handleAddPreset = async (preset: DefaultStreamOption) => {
    if (loading || addingUrl) return
    if (isStreamInList(preset.url)) return

    setAddingUrl(preset.url)
    setError(null)

    try {
      await appStore.addStream(preset.name, preset.url)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } }; message?: string }
      const msg = axiosErr.response?.data?.message || axiosErr.message || 'Failed to add stream'
      setError(msg)
    } finally {
      setAddingUrl(null)
    }
  }

  // Quick action to add all unadded default streams
  const handleAddAllDefaults = async () => {
    if (loading || addingUrl || unaddedDefaults.length === 0) return

    setLoading(true)
    setError(null)

    try {
      for (const item of unaddedDefaults) {
        if (!isStreamInList(item.url)) {
          await appStore.addStream(item.name, item.url, false)
        }
      }
      appStore.closeModal()
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } }; message?: string }
      const msg = axiosErr.response?.data?.message || axiosErr.message || 'Failed to add default streams'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  // Helper to inject credentials into URL if entered separately
  const formatStreamUrl = (rawUrl: string, u: string, p: string): string => {
    let finalUrl = rawUrl.trim()
    const user = u.trim()
    const pass = p.trim()

    if ((user || pass) && !finalUrl.includes('@')) {
      const schemeMatch = finalUrl.match(/^([a-zA-Z0-9+.-]+:\/\/)(.*)$/)
      if (schemeMatch) {
        const scheme = schemeMatch[1]
        const rest = schemeMatch[2]
        const userPart = encodeURIComponent(user)
        const passPart = encodeURIComponent(pass)
        finalUrl = `${scheme}${userPart}${pass ? `:${passPart}` : ''}@${rest}`
      }
    }
    return finalUrl
  }

  // Custom stream addition from form fields
  const handleAddCustom = async () => {
    if (!name.trim() || !url.trim() || loading || addingUrl) return

    const finalUrl = formatStreamUrl(url, username, password)

    setLoading(true)
    setError(null)

    try {
      await appStore.addStream(name.trim(), finalUrl)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } }; message?: string }
      const msg = axiosErr.response?.data?.message || axiosErr.message || 'Failed to connect to stream'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={() => appStore.closeModal()}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Add RTSP Stream</h3>
            <p className="modal-sub">Select a default stream below or enter a custom RTSP stream URL.</p>
          </div>
          <button className="icon-btn" onClick={() => appStore.closeModal()} aria-label="Close modal">
            <CloseIcon />
          </button>
        </div>

        {error && (
          <div
            className="modal-error-alert"
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#f87171',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '13px',
            }}
          >
            {error}
          </div>
        )}

        {/* Default Streaming Options */}
        <div className="modal-section">
          <div className="modal-section-header">
            <span className="modal-section-title">Default Streaming Options</span>
            {unaddedDefaults.length > 0 && (
              <button
                type="button"
                className="btn-link-action"
                onClick={handleAddAllDefaults}
                disabled={loading || !!addingUrl}
              >
                + Add All ({unaddedDefaults.length})
              </button>
            )}
          </div>

          <div className="default-streams-list">
            {DEFAULT_STREAMS.map((preset) => {
              const inList = isStreamInList(preset.url)
              const isAddingThis = addingUrl === preset.url

              return (
                <div
                  key={preset.url}
                  className={`default-stream-card ${inList ? 'is-added' : ''} ${loading || addingUrl ? 'is-disabled' : ''}`}
                  onClick={() => {
                    if (!inList && !loading && !addingUrl) {
                      handleAddPreset(preset)
                    }
                  }}
                  title={inList ? 'Stream is already in your list' : `Click to add ${preset.name} to stream list`}
                >
                  <div className="default-stream-info">
                    <div className="default-stream-title-row">
                      <span className="default-stream-name">{preset.name}</span>
                      <span className="default-stream-badge">{preset.tag}</span>
                    </div>
                    <span className="default-stream-url">{preset.url}</span>
                  </div>

                  <div className="default-stream-actions" onClick={(e) => e.stopPropagation()}>
                    {inList ? (
                      <span className="badge-in-list">
                        <CheckIcon /> In List
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="btn-card-add"
                        disabled={loading || !!addingUrl}
                        onClick={() => handleAddPreset(preset)}
                      >
                        {isAddingThis ? 'Adding...' : '+ Add'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="modal-divider">
          <span>or custom stream</span>
        </div>

        {/* Custom Stream Inputs */}
        <div className="form-group">
          <label htmlFor="add-stream-name">Name</label>
          <input
            id="add-stream-name"
            type="text"
            placeholder="e.g. Living Room Camera"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading || !!addingUrl}
            onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
          />
        </div>

        <div className="form-group">
          <label htmlFor="add-stream-url">RTSP URL</label>
          <input
            id="add-stream-url"
            type="text"
            placeholder="rtsp://localhost:8554/bbb or rtsp://ip:port/stream"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading || !!addingUrl}
            onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
          />
        </div>

        {/* Optional Credentials */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="add-stream-username">Username (Optional)</label>
            <input
              id="add-stream-username"
              type="text"
              placeholder="e.g. viewer"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading || !!addingUrl}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
            />
          </div>
          <div className="form-group">
            <label htmlFor="add-stream-password">Password (Optional)</label>
            <input
              id="add-stream-password"
              type="password"
              placeholder="e.g. viewer_password_123"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading || !!addingUrl}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="modal-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => appStore.closeModal()}
            disabled={loading || !!addingUrl}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={handleAddCustom}
            disabled={!name.trim() || !url.trim() || loading || !!addingUrl}
          >
            <PlusCircleIcon /> {loading ? 'Adding Stream...' : 'Add Custom Stream'}
          </button>
        </div>
      </div>
    </div>
  )
})

export default AddStreamModal
