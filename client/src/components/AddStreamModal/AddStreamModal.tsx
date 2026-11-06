import { useState } from 'react'
import { observer } from 'mobx-react-lite'
import { appStore } from '../../store/AppStore'
import { CloseIcon, PlusCircleIcon } from '../../icons/icons'

const AddStreamModal = observer(() => {
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAdd = async () => {
    if (!name.trim() || !url.trim() || loading) return

    setLoading(true)
    setError(null)

    try {
      await appStore.addStream(name.trim(), url.trim())
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
            <h3 className="modal-title">Add New RTSP Stream</h3>
            <p className="modal-sub">Enter the details of the RTSP stream you want to stream.</p>
          </div>
          <button className="icon-btn" onClick={() => appStore.closeModal()} aria-label="Close modal">
            <CloseIcon />
          </button>
        </div>

        {error && (
          <div className="modal-error-alert" style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#f87171',
            padding: '8px 12px',
            borderRadius: '6px',
            marginBottom: '14px',
            fontSize: '13px'
          }}>
            {error}
          </div>
        )}

        {/* Fields */}
        <div className="form-group">
          <label htmlFor="add-stream-name">Name</label>
          <input
            id="add-stream-name"
            type="text"
            placeholder="Living Room Camera"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
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
            disabled={loading}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
        </div>

        {/* Footer */}
        <div className="modal-actions">
          <button className="btn-secondary" onClick={() => appStore.closeModal()} disabled={loading}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handleAdd}
            disabled={!name.trim() || !url.trim() || loading}
          >
            <PlusCircleIcon /> {loading ? 'Adding Stream...' : 'Add Stream'}
          </button>
        </div>
      </div>
    </div>
  )
})

export default AddStreamModal
