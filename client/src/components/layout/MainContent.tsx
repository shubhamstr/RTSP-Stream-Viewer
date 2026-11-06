import { observer } from 'mobx-react-lite'
import { appStore } from '../../store/AppStore'
import { PlusCircleIcon } from '../../icons/icons'
import StreamPlayer from '../StreamPlayer/StreamPlayer'

const MainContent = observer(() => {
  const { streams, displayedStreams, openModal } = appStore

  if (displayedStreams.length === 0) {
    return (
      <main className="main">
        <div className="main-empty">
          <div className="main-empty-box">
            <p className="main-empty-title">No streams are being displayed.</p>
            <p className="main-empty-sub">
              Select a stream from the sidebar to view it, or add a new one.
            </p>
            <button className="btn-primary" onClick={() => openModal()}>
              <PlusCircleIcon /> Add New Stream
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="main">
      <div className="main-content">
        <div className="main-header">
          Displayed Streams ({displayedStreams.length}/{streams.length})
        </div>
        <div
          className={`players-grid ${
            displayedStreams.length === 1 ? 'players-grid--1' : 'players-grid--2'
          }`}
        >
          {displayedStreams.map((s) => (
            <StreamPlayer key={s.id} stream={s} />
          ))}
        </div>
      </div>
    </main>
  )
})

export default MainContent
