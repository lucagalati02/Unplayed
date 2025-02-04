import { configureStore } from '@reduxjs/toolkit'
import themeReducer from './redux/theme'
import authenticationReducer from './redux/authentication'

export const store = configureStore({
  reducer: {
    authentication: authenticationReducer,
    theme: themeReducer,
  },
})