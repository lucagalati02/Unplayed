import { configureStore } from '@reduxjs/toolkit'
import themeReducer from './redux/theme'
import authenticationReducer from './redux/authentication'
import musicReducer from './redux/music'

export const store = configureStore({
  reducer: {
    authentication: authenticationReducer,
    theme: themeReducer,
    music: musicReducer,
  },
})