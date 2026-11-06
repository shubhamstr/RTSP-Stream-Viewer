import { useEffect, useState } from 'react'
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
    name: 'Earth (MediaMTX)',
    url: 'rtsp://viewer:viewer_password_123@localhost:8554/earth',
    tag: 'MediaMTX RTSP',
  },
  {
    name: 'Road & Trees (MediaMTX)',
    url: 'rtsp://viewer:viewer_password_123@localhost:8554/road_and_trees',
    tag: 'MediaMTX RTSP',
  },
  {
    name: 'Watering Plant (MediaMTX)',
    url: 'rtsp://viewer:viewer_password_123@localhost:8554/watering_plant',
    tag: 'MediaMTX RTSP',
  },
]

const AddStreamModal = observer(() => {
  const isEditing = Boolean(appStore.editingStream)
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [addingUrl, setAddingUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (appStore.editingStream) {
      const s = appStore.editingStream
      setName(s.name)
      const credMatch = s.url.match(/^([a-zA-Z0-9+.-]+:\/\/)([^:]+):([^@]+)@(.*)$/)
      if (credMatch) {
        setUrl(`${credMatch[1]}${credMatch[4]}`)
        setUsername(decodeURIComponent(credMatch[2]))
        setPassword(decodeURIComponent(credMatch[3]))
      } else {
        setUrl(s.url)
        setUsername('')
        setPassword('')
      }
      setError(null)
    } else {
      setName('')
      setUrl('')
      setUsername('')
      setPassword('')
      setError(null)
    }
  }, [appStore.editingStream])

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

  // Pre-fill form from a preset option
  const handlePopulateForm = (preset: DefaultStreamOption) => {
    setName(preset.name)
    setError(null)

    // Parse out credentials if encoded as rtsp://user:pass@host...
    const credMatch = preset.url.match(/^([a-zA-Z0-9+.-]+:\/\/)([^:]+):([^@]+)@(.*)$/)
    if (credMatch) {
      setUrl(`${credMatch[1]}${credMatch[4]}`)
      setUsername(decodeURIComponent(credMatch[2]))
      setPassword(decodeURIComponent(credMatch[3]))
    } else {
      setUrl(preset.url)
      setUsername('')
      setPassword('')
    }
  }

  const handleClearForm = () => {
    setName('')
    setUrl('')
    setUsername('')
    setPassword('')
    setError(null)
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

  // Form submission: updates existing stream if in edit mode, otherwise adds new stream
  const handleAddCustom = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!name.trim() || !url.trim() || loading || addingUrl) return

    const finalUrl = formatStreamUrl(url, username, password)

    setLoading(true)
    setError(null)

    try {
      if (appStore.editingStream) {
        await appStore.updateStream(appStore.editingStream.id, {
          name: name.trim(),
          url: finalUrl,
        })
      } else {
        await appStore.addStream(name.trim(), finalUrl)
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } }; message?: string }
      const msg =
        axiosErr.response?.data?.message ||
        axiosErr.message ||
        (isEditing ? 'Failed to update stream' : 'Failed to connect to stream')
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const isFormDirty = Boolean(name.trim() || url.trim() || username.trim() || password.trim())

  return (
    <div className="modal-overlay" onClick={() => appStore.closeModal()}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h3 className="modal-title">
              {isEditing ? 'Stream Settings' : 'Add RTSP Stream'}
            </h3>
            <p className="modal-sub">
              {isEditing
                ? `Update configuration and RTSP feed for "${appStore.editingStream?.name}".`
                : 'Select a preconfigured stream on the left or configure a custom RTSP feed on the right.'}
            </p>
          </div>
          <button className="icon-btn" onClick={() => appStore.closeModal()} aria-label="Close modal">
            <CloseIcon />
          </button>
        </div>

        {error && (
          <div className="modal-error-alert">
            <span className="modal-error-text">{error}</span>
            <button
              type="button"
              className="modal-error-dismiss"
              onClick={() => setError(null)}
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        )}

        {/* 2 Columns: Left = Default Options, Right = Custom Form */}
        <div className="modal-columns">
          {/* Left Column: Default Options */}
          <div className="modal-column modal-column-left">
            <div className="modal-column-header">
              <div>
                <span className="modal-section-title">Default Options</span>
                <p className="modal-column-sub">Quick-connect preconfigured MediaMTX feeds</p>
              </div>
              {unaddedDefaults.length > 0 ? (
                <button
                  type="button"
                  className="btn-link-action"
                  onClick={handleAddAllDefaults}
                  disabled={loading || !!addingUrl}
                >
                  + Add All ({unaddedDefaults.length})
                </button>
              ) : (
                <span className="badge-all-added">✓ All Added</span>
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
                  >
                    <div className="default-stream-info">
                      <div className="default-stream-title-row">
                        <span className="default-stream-name" title={preset.name}>
                          {preset.name}
                        </span>
                        <span className="default-stream-badge">{preset.tag}</span>
                      </div>
                      <span className="default-stream-url" title={preset.url}>
                        {preset.url}
                      </span>
                    </div>

                    <div className="default-stream-card-footer">
                      <div className="default-stream-actions">
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
                            <PlusCircleIcon size={13} /> {isAddingThis ? 'Adding...' : 'Add Stream'}
                          </button>
                        )}
                      </div>

                      <button
                        type="button"
                        className="btn-card-fill"
                        onClick={() => handlePopulateForm(preset)}
                        disabled={loading || !!addingUrl}
                        title="Copy this stream's settings into the custom form on the right"
                      >
                        Use in Form →
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Helper Callout Box */}
            <div className="modal-info-box">
              <span className="modal-info-icon">💡</span>
              <div className="modal-info-text">
                Demo streams broadcast via local <code>MediaMTX</code> on port <code>8554</code> with credentials <code>viewer:viewer_password_123</code>.
              </div>
            </div>
          </div>

          {/* Column Divider */}
          <div className="modal-column-divider" aria-hidden="true">
            <span className="divider-badge">or</span>
          </div>

          {/* Right Column: Custom Stream / Edit Form */}
          <div className="modal-column modal-column-right">
            <div className="modal-column-header">
              <div>
                <span className="modal-section-title">
                  {isEditing ? 'Stream Configuration' : 'Custom Stream'}
                </span>
                <p className="modal-column-sub">
                  {isEditing
                    ? 'Modify the stream name, address, or credentials'
                    : 'Enter details for any RTSP camera or server'}
                </p>
              </div>
              {isFormDirty && (
                <button
                  type="button"
                  className="btn-link-action"
                  onClick={handleClearForm}
                  disabled={loading || !!addingUrl}
                >
                  Clear Form
                </button>
              )}
            </div>

            <form onSubmit={handleAddCustom} className="modal-form">
              <div className="form-group">
                <label htmlFor="add-stream-name">
                  Stream Name <span className="field-required">*</span>
                </label>
                <input
                  id="add-stream-name"
                  type="text"
                  placeholder="e.g. Living Room Camera"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading || !!addingUrl}
                  autoComplete="off"
                />
              </div>

              <div className="form-group">
                <label htmlFor="add-stream-url">
                  RTSP URL <span className="field-required">*</span>
                </label>
                <input
                  id="add-stream-url"
                  type="text"
                  placeholder="rtsp://localhost:8554/earth or rtsp://ip:port/stream"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={loading || !!addingUrl}
                  autoComplete="off"
                />
              </div>

              {/* Optional Credentials */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="add-stream-username">
                    Username <span className="field-optional">(Optional)</span>
                  </label>
                  <input
                    id="add-stream-username"
                    type="text"
                    placeholder="e.g. viewer"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loading || !!addingUrl}
                    autoComplete="off"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="add-stream-password">
                    Password <span className="field-optional">(Optional)</span>
                  </label>
                  <input
                    id="add-stream-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading || !!addingUrl}
                    autoComplete="off"
                  />
                </div>
              </div>

              <p className="modal-form-note">
                If provided separately, credentials are safely formatted into the RTSP connection URL.
              </p>

              {/* Footer Actions */}
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
                  type="submit"
                  className="btn-primary"
                  disabled={!name.trim() || !url.trim() || loading || !!addingUrl}
                >
                  {isEditing ? (
                    <>
                      <CheckIcon /> {loading ? 'Saving Changes...' : 'Save Settings'}
                    </>
                  ) : (
                    <>
                      <PlusCircleIcon /> {loading ? 'Adding Stream...' : 'Add Custom Stream'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
})

export default AddStreamModal
