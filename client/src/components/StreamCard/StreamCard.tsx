import { observer } from 'mobx-react-lite'
import { appStore } from '../../store/AppStore'
import { PlusCircleIcon, TrashIcon } from '../../icons/icons'
import type { Stream } from '../../types'

interface StreamCardProps {
  stream: Stream
}

const StreamCard = observer(({ stream }: StreamCardProps) => {
  return (
    <div className={`stream-card ${stream.displayed ? 'stream-card--on' : ''}`}>

      {/* Top row: info + badge */}
      <div className="stream-card-top">
        <div className="stream-card-info">
          <span className="stream-name">{stream.name}</span>
          <span className="stream-url">{stream.url}</span>
        </div>
        {stream.active && <span className="badge badge--active">Active</span>}
      </div>

      {/* Action row */}
      <div className="stream-card-actions">
        <button
          className="text-btn"
          onClick={() => appStore.deactivateStream(stream.id)}
          title="Deactivate stream"
        >
          <PlusCircleIcon /> Deactivate
        </button>
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
