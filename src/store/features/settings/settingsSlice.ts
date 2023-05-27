import { createAction, createReducer } from '@reduxjs/toolkit'

const ADDRESS_LIST_LS_KEY = 'store:settings/addressList'

interface SettingsInitialStateType {
  addressList: string[]
  isInitialized: boolean
}

const settingsInitialState: SettingsInitialStateType = {
  addressList: ['', ''],
  isInitialized: false,
}

// DISPATCH TYPE
export const initializeSettingsDispatchType = 'settings/initialize'
export const addressListChangedDispatchType = 'settings/addressListChanged'

// ACTIONS
export const initializeSettings = createAction(initializeSettingsDispatchType)
export const addressListChanged = createAction<string[]>(
  addressListChangedDispatchType
)

export const settingsReducers = createReducer(
  settingsInitialState,
  (builder) => {
    builder
      .addCase(addressListChanged, (state, action) => {
        state.addressList = action.payload
        localStorage.setItem(
          ADDRESS_LIST_LS_KEY,
          JSON.stringify(action.payload)
        )
      })
      .addCase(initializeSettings, (state) => {
        const value = localStorage.getItem(ADDRESS_LIST_LS_KEY)
        state.addressList = value ? JSON.parse(value) : ['', '']
        state.isInitialized = true
      })
  }
)
