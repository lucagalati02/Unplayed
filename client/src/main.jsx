import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { store } from './store.js'
import { Provider } from 'react-redux'
import { Provider as CProvider } from "./components/provider.jsx"
import * as apple_music from './components/apple_music.js'

apple_music.configure()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CProvider>
      <Provider store={store}>
        <App />
      </Provider>
    </CProvider>
  </StrictMode>,
)
