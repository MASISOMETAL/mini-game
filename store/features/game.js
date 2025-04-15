import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  codeGame: null,
  userName: null,
  idUser: null,
  isHost: null,
  isStart: null,
}

export const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    setCode: (state, { payload }) => {
      state.codeGame = payload.codeGame
      state.userName = payload.userName
      state.idUser = payload.idUser
      state.isHost = payload.isHost
      state.isStart = payload.isStart
    },
    startGameState: (state, {payload}) => {
      state.isStart = payload
    }
  }
})

export const { setCode, startGameState } = gameSlice.actions

export default gameSlice.reducer