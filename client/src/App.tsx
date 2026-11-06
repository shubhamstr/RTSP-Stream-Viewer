import { observer } from 'mobx-react-lite'
import { appStore } from './store/AppStore'
import Topbar from './components/layout/Topbar'
import Sidebar from './components/layout/Sidebar'
import MainContent from './components/layout/MainContent'
import AddStreamModal from './components/AddStreamModal/AddStreamModal'
import './App.css'

const App = observer(() => {
  const { dark, modalOpen, errorMessage, clearErrorMessage } = appStore

  return (
    <div className={`app ${dark ? 'dark' : 'light'}`}>
      <Topbar />

      {errorMessage && (
        <div className="global-error-banner" role="alert">
          <div className="global-error-content">
            <span aria-hidden="true">⚠️</span>
            <span className="global-error-text">{errorMessage}</span>
          </div>
          <button
            type="button"
            className="global-error-close"
            onClick={() => clearErrorMessage()}
            aria-label="Dismiss error"
          >
            ✕
          </button>
        </div>
      )}

      <div className="layout">
        <Sidebar />
        <MainContent />
      </div>

      {modalOpen && <AddStreamModal />}
    </div>
  )
})

export default App
