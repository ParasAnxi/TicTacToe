//** IMPORTS */
/** IMPORTS */
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";

import gameReducer from "../../features/game/gameSlice.js";

//** REDUCERS */
//** GAME */
const gamePersistConfig = {
  key: "game",
  storage: storage,
  // whitelist: ["playerName"],
};

//** COMBINE REDUCERS */
const reducers = combineReducers({
  game: persistReducer(gamePersistConfig,gameReducer),
});

//** CONFIG */
export const store = configureStore({
  reducer: reducers,
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: {
        ignoreActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    })
});
