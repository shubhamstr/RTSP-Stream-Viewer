import { observer } from 'mobx-react-lite'
import { appStore } from '../../store/AppStore'
import { PlusCircleIcon } from '../../icons/icons'
import StreamCard from '../StreamCard/StreamCard'

const Sidebar = observer(() => {
  const { tab, setTab, listedStreams, openModal } = appStore

  return (
    <aside className="sidebar">

      {/* Tab bar */}
      <div className="sidebar-tabs">
        <button
          className={`tab ${tab === 'active' ? 'tab--on' : ''}`}
          onClick={() => setTab('active')}
        >
          Active
        </button>
        <button
          className={`tab ${tab === 'all' ? 'tab--on' : ''}`}
          onClick={() => setTab('all')}
        >
          All Streams
        </button>
        <button className="add-btn" onClick={() => openModal()}>
          <PlusCircleIcon /> Add
        </button>
      </div>

      {/* Stream list */}
      <div className="sidebar-list">
        {listedStreams.length === 0 ? (
          <div className="sidebar-empty">
            <p>No streams available</p>
            <button className="btn-primary" onClick={() => openModal()}>
              <PlusCircleIcon /> Add Stream
            </button>
          </div>
        ) : (
          listedStreams.map((s) => <StreamCard key={s.id} stream={s} />)
        )}
      </div>

    </aside>
  )
})

export default Sidebar
