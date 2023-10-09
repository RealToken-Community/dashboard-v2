import { createAction, createReducer } from '@reduxjs/toolkit'

import { Currency } from 'src/types/Currencies'

const ADDRESS_LIST_LS_KEY = 'store:settings/addressList'
const USER_CURRENCY_LS_KEY = 'store:settings/userCurrency'

interface SettingsInitialStateType {
  addressList: string[]
  userCurrency: Currency
  isInitialized: boolean
}

const settingsInitialState: SettingsInitialStateType = {
  addressList: ['', ''],
  userCurrency: Currency.USD,
  isInitialized: false,
}

// DISPATCH TYPE
export const initializeSettingsDispatchType = 'settings/initialize'
export const addressListChangedDispatchType = 'settings/addressListChanged'
export const userCurrencyChangedDispatchType = 'settings/userCurrencyChanged'

// ACTIONS
export const initializeSettings = createAction(initializeSettingsDispatchType)
export const addressListChanged = createAction<string[]>(
  addressListChangedDispatchType
)
export const userCurrencyChanged = createAction<Currency>(
  userCurrencyChangedDispatchType
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
      .addCase(userCurrencyChanged, (state, action) => {
        state.userCurrency = action.payload
        localStorage.setItem(USER_CURRENCY_LS_KEY, action.payload)
      })
      .addCase(initializeSettings, (state) => {
        const addressList = localStorage.getItem(ADDRESS_LIST_LS_KEY)
        const userCurrency = localStorage.getItem(USER_CURRENCY_LS_KEY)
        state.addressList = addressList ? JSON.parse(addressList) : ['', '']
        state.userCurrency = userCurrency
          ? (userCurrency as Currency)
          : Currency.USD
        state.isInitialized = true
      })
  }
)
