import { combineReducers, configureStore } from '@reduxjs/toolkit'

import { realtokensReducers } from './features/realtokens/realtokensSlice'
import { settingsReducers } from './features/settings/settingsSlice'
import { walletsReducers } from './features/wallets/walletsSlice'

const rootReducer = combineReducers({
  settings: settingsReducers,
  realtokens: realtokensReducers,
  wallets: walletsReducers,
})

const store = configureStore({
  reducer: rootReducer,
})

export default store

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
