import { observer } from 'mobx-react-lite'
import { appStore } from './store/AppStore'
import Topbar from './components/layout/Topbar'
import Sidebar from './components/layout/Sidebar'
import MainContent from './components/layout/MainContent'
import AddStreamModal from './components/AddStreamModal/AddStreamModal'
import './App.css'

const App = observer(() => {
  const { dark, modalOpen } = appStore

  return (
    <div className={`app ${dark ? 'dark' : 'light'}`}>
      <Topbar />

      <div className="layout">
        <Sidebar />
        <MainContent />
      </div>

      {modalOpen && <AddStreamModal />}
    </div>
  )
})

export default App
