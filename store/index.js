import { configureStore } from '@reduxjs/toolkit'
import gameReducer from './features/game'

export const store = configureStore({
  reducer: {
    game: gameReducer
  },
})