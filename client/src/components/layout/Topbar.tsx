import { observer } from 'mobx-react-lite'
import { appStore } from '../../store/AppStore'
import { MoonIcon, SunIcon, VideoIcon } from '../../icons/icons'

const Topbar = observer(() => {
  const { dark, toggleDark } = appStore

  return (
    <header className="topbar">
      <div className="topbar-left">
        <span className="topbar-icon">
          <VideoIcon />
        </span>
        <span className="topbar-title">RTSP Stream Viewer</span>
      </div>

      <button
        className="icon-btn icon-btn--theme"
        onClick={() => toggleDark()}
        title={dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        aria-label="Toggle theme"
      >
        {dark ? <SunIcon /> : <MoonIcon />}
      </button>
    </header>
  )
})

export default Topbar
