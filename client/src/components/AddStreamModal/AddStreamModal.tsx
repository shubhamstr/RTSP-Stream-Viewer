import { useState } from 'react'
import { observer } from 'mobx-react-lite'
import { appStore } from '../../store/AppStore'
import { CloseIcon, PlusCircleIcon } from '../../icons/icons'

const AddStreamModal = observer(() => {
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')

  const handleAdd = () => {
    if (name.trim() && url.trim()) {
      appStore.addStream(name.trim(), url.trim())
    }
  }

  return (
    <div className="modal-overlay" onClick={() => appStore.closeModal()}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Add New RTSP Stream</h3>
            <p className="modal-sub">Enter the details of the RTSP stream you want to add.</p>
          </div>
          <button className="icon-btn" onClick={() => appStore.closeModal()} aria-label="Close modal">
            <CloseIcon />
          </button>
        </div>

        {/* Fields */}
        <div className="form-group">
          <label htmlFor="add-stream-name">Name</label>
          <input
            id="add-stream-name"
            type="text"
            placeholder="Living Room Camera"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
        </div>

        <div className="form-group">
          <label htmlFor="add-stream-url">RTSP URL</label>
          <input
            id="add-stream-url"
            type="text"
            placeholder="rtsp://username:password@camera-ip:port/path"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
        </div>

        {/* Footer */}
        <div className="modal-actions">
          <button className="btn-secondary" onClick={() => appStore.closeModal()}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handleAdd}
            disabled={!name.trim() || !url.trim()}
          >
            <PlusCircleIcon /> Add Stream
          </button>
        </div>

      </div>
    </div>
  )
})

export default AddStreamModal
