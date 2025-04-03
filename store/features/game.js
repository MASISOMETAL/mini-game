import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  codeGame: "",
  hostName: "",
  isHost: null,
  isStart: null,
  id: null
}

export const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    setCode: (state, { payload }) => {
      state.codeGame = payload.codeId
      state.hostName = payload.hostName
      state.isHost = payload.isHost
      state.isStart = payload.isStart
      state.id = payload.id
    }
  }
})

export const { setCode } = gameSlice.actions

export default gameSlice.reducer