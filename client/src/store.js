import { configureStore } from '@reduxjs/toolkit'
import themeReducer from './redux/theme'

export const store = configureStore({
  reducer: {
    theme: themeReducer,
  },
})