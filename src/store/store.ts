import { combineReducers, configureStore } from '@reduxjs/toolkit'

import { currenciesReducers } from './features/currencies/currenciesSlice'
import { realtokensReducers } from './features/realtokens/realtokensSlice'
import { settingsReducers } from './features/settings/settingsSlice'
import { transfersReducers } from './features/transfers/transfersSlice'
import { walletsReducers } from './features/wallets/walletsSlice'

const rootReducer = combineReducers({
  settings: settingsReducers,
  realtokens: realtokensReducers,
  wallets: walletsReducers,
  currencies: currenciesReducers,
  transfers: transfersReducers,
})

const store = configureStore({
  reducer: rootReducer,
})

export default store

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
