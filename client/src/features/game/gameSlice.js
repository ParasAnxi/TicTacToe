//** IMPORTS */
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  gameState: [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
  ],
  currentPlayer: "circle",
  finishedState: false,
  finishedArrayState: [],
  playOnline: false,
  socket: null,
  playerName: "",
  opponentName: null,
  playingAs: null,
};

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    setGameState: (state, action) => {
      state.gameState = action.payload;
    },
    setCurrentPlayer: (state, action) => {
      state.currentPlayer = action.payload;
    },
    setFinishedState: (state, action) => {
      state.finishedState = action.payload;
    },
    setFinishedArrayState: (state, action) => {
      state.finishedArrayState = action.payload;
    },
    setPlayOnline: (state, action) => {
      state.playOnline = action.payload;
    },
    setSocket: (state, action) => {
      state.socket = action.payload;
    },
    setPlayerName: (state, action) => {
      state.playerName = action.payload;
    },
    setOpponentName: (state, action) => {
      state.opponentName = action.payload;
    },
    setPlayingAs: (state, action) => {
      state.playingAs = action.payload;
    },
    resetGame: (state) => {
      Object.assign(state, initialState);
    },
  },
});

export const {
  setGameState,
  setCurrentPlayer,
  setFinishedState,
  setFinishedArrayState,
  setPlayOnline,
  setSocket,
  setPlayerName,
  setOpponentName,
  setPlayingAs,
  resetGame,
} = gameSlice.actions;

export default gameSlice.reducer;
