import { observer } from 'mobx-react-lite'
import { appStore } from '../../store/AppStore'
import { PlusCircleIcon } from '../../icons/icons'
import StreamCard from '../StreamCard/StreamCard'

const Sidebar = observer(() => {
  const { tab, setTab, streams, activeStreams, listedStreams, openModal } = appStore

  return (
    <aside className="sidebar">

      {/* Tab bar */}
      <div className="sidebar-tabs" role="tablist" aria-label="Stream filters">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'active'}
          className={`tab ${tab === 'active' ? 'tab--on' : ''}`}
          onClick={() => setTab('active')}
        >
          Active <span className="tab-count">{activeStreams.length}</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'all'}
          className={`tab ${tab === 'all' ? 'tab--on' : ''}`}
          onClick={() => setTab('all')}
        >
          All Streams <span className="tab-count">{streams.length}</span>
        </button>
        <button type="button" className="add-btn" onClick={() => openModal()}>
          <PlusCircleIcon /> Add
        </button>
      </div>

      {/* Stream list */}
      <div className="sidebar-list">
        {listedStreams.length === 0 ? (
          <div className="sidebar-empty">
            {tab === 'active' && streams.length > 0 ? (
              <>
                <p>No active streams</p>
                <button className="btn-primary" onClick={() => setTab('all')}>
                  View All Streams
                </button>
              </>
            ) : (
              <>
                <p>No streams available</p>
                <button className="btn-primary" onClick={() => openModal()}>
                  <PlusCircleIcon /> Add Stream
                </button>
              </>
            )}
          </div>
        ) : (
          listedStreams.map((s) => <StreamCard key={s.id} stream={s} />)
        )}
      </div>

    </aside>
  )
})

export default Sidebar
