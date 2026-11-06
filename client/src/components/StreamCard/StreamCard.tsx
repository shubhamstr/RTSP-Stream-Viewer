import { observer } from 'mobx-react-lite'
import { appStore } from '../../store/AppStore'
import { PlusCircleIcon, TrashIcon } from '../../icons/icons'
import type { Stream } from '../../types'
import { sanitizeStreamUrl } from '../../utils/url'

interface StreamCardProps {
  stream: Stream
}

const StreamCard = observer(({ stream }: StreamCardProps) => {
  const handleClickCard = () => {
    appStore.selectStream(stream.id)
  }

  const renderStatusBadge = () => {
    if (stream.status === 'streaming') {
      return <span className="badge badge--active">● Live</span>
    }
    if (stream.status === 'starting') {
      return <span className="badge badge--starting">Connecting...</span>
    }
    if (stream.status === 'error') {
      return (
        <span className="badge badge--error" title={stream.error || 'Connection error'}>
          Error
        </span>
      )
    }
    if (!stream.active) {
      return <span className="badge badge--stopped">Inactive</span>
    }
    if (stream.displayed) {
      return <span className="badge badge--active">Displayed</span>
    }
    return <span className="badge badge--stopped">Stopped</span>
  }

  return (
    <div
      className={`stream-card ${stream.displayed ? 'stream-card--on' : ''}`}
      onClick={handleClickCard}
      title="Click to toggle/view stream"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClickCard()
        }
      }}
    >
      {/* Top row: info + badge */}
      <div className="stream-card-top">
        <div className="stream-card-info">
          <span className="stream-name">{stream.name}</span>
          <span className="stream-url" title={sanitizeStreamUrl(stream.url)}>
            {sanitizeStreamUrl(stream.url)}
          </span>
          {stream.error && (
            <span className="stream-card-error-hint" title={stream.error}>
              ⚠️ {stream.error}
            </span>
          )}
        </div>
        {renderStatusBadge()}
      </div>

      {/* Action row */}
      <div className="stream-card-actions" onClick={(e) => e.stopPropagation()}>
        {stream.active ? (
          <button
            className="text-btn"
            onClick={() => appStore.deactivateStream(stream.id)}
            title="Deactivate stream"
          >
            <PlusCircleIcon /> Deactivate
          </button>
        ) : (
          <button
            className="text-btn"
            onClick={() => appStore.activateStream(stream.id)}
            title="Activate stream"
          >
            <PlusCircleIcon /> Activate
          </button>
        )}
        <button
          className="text-btn text-btn--danger"
          onClick={() => appStore.deleteStream(stream.id)}
          title="Delete stream"
        >
          <TrashIcon /> Delete
        </button>
      </div>
    </div>
  )
})

export default StreamCard
