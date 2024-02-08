import getConfig from 'next/config'

import { createAction, createReducer } from '@reduxjs/toolkit'

import { t } from 'i18next'

import { UserRepository } from 'src/repositories/user.repository'
import { AppDispatch, RootState } from 'src/store/store'
import { Currency } from 'src/types/Currencies'
import {
  RentCalculation,
  RentCalculationState,
} from 'src/types/RentCalculation'

const USER_LS_KEY = 'store:settings/user'
const USER_CURRENCY_LS_KEY = 'store:settings/userCurrency'
const USER_RENT_CALCULATION_LS_KEY = 'store:settings/userRentCalculation'

export interface User {
  id: string
  mainAddress: string
  addressList: string[]
  customAddressList: string[]
  hiddenAddressList: string[]
  whitelistAttributeKeys: string[]
}

interface SettingsInitialStateType {
  user?: User
  userCurrency: Currency
  isInitialized: boolean
  rentCalculation: RentCalculation
  version?: string
}

const settingsInitialState: SettingsInitialStateType = {
  user: undefined,
  userCurrency: Currency.USD,
  rentCalculation: {
    state: RentCalculationState.Global,
    date: new Date().getTime(),
  },
  isInitialized: false,
}

// DISPATCH TYPE
export const initializeSettingsDispatchType = 'settings/initialize'
export const userChangedDispatchType = 'settings/userChanged'
export const userCurrencyChangedDispatchType = 'settings/userCurrencyChanged'
export const userRentCalculationChangedDispatchType =
  'settings/userRentCalculationChanged'

// ACTIONS
export const initializeSettings = createAction(initializeSettingsDispatchType)
export const userChanged = createAction<User>(userChangedDispatchType)
export const userCurrencyChanged = createAction<Currency>(
  userCurrencyChangedDispatchType,
)
export const userRentCalculationChanged = createAction(
  userRentCalculationChangedDispatchType,
  (rentCalculation: RentCalculation) => ({
    payload: {
      state: rentCalculation.state,
      date: rentCalculation.date,
    },
  }),
)

// THUNKS
export function setUserAddress(address: string) {
  return async (dispatch: AppDispatch) => {
    if (!address) {
      dispatch({
        type: userChangedDispatchType,
        payload: undefined,
      })
      return undefined
    }
    try {
      const userId = await UserRepository.getUserId(address)
      if (!userId) {
        throw new Error(t('errors.userNotFound'))
      }
      const user = await UserRepository.getUserDetails(userId)
      dispatch({
        type: userChangedDispatchType,
        payload: {
          mainAddress: address.toLowerCase(),
          customAddressList: [],
          hiddenAddressList: [],
          ...user,
        },
      })
    } catch (error) {
      console.log(error)
    }
  }
}

export function setCustomAddressList(addressList: string[]) {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const user = getState().settings.user
    dispatch({
      type: userChangedDispatchType,
      payload: {
        ...user,
        customAddressList: addressList.map((item) => item.toLowerCase()),
      },
    })
  }
}

export function setHiddenAddressList(addressList: string[]) {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const user = getState().settings.user
    dispatch({
      type: userChangedDispatchType,
      payload: {
        ...user,
        hiddenAddressList: addressList.map((item) => item.toLowerCase()),
      },
    })
  }
}

export const settingsReducers = createReducer(
  settingsInitialState,
  (builder) => {
    builder
      .addCase(userChanged, (state, action) => {
        const user = action.payload
        if (!user) {
          state.user = undefined
          localStorage.removeItem(USER_LS_KEY)
          return
        }
        const mainAddress = user.mainAddress.toLowerCase()
        const addressList =
          user.addressList?.map((item) => item.toLowerCase()) ?? []

        const customAddressList =
          user.customAddressList?.map((item) => item.toLowerCase()) ?? []

        const hiddenAddressList =
          user.hiddenAddressList?.map((item) => item.toLowerCase()) ?? []

        if (!addressList.includes(mainAddress)) {
          addressList.unshift(mainAddress)
        }

        const addresses = [...addressList, ...customAddressList]

        state.user = {
          ...user,
          mainAddress,
          addressList,
          customAddressList,
          hiddenAddressList: hiddenAddressList.filter((item) =>
            addresses.includes(item),
          ),
        }
        localStorage.setItem(USER_LS_KEY, JSON.stringify(action.payload))
      })
      .addCase(userCurrencyChanged, (state, action) => {
        state.userCurrency = action.payload
        localStorage.setItem(USER_CURRENCY_LS_KEY, action.payload)
      })
      .addCase(userRentCalculationChanged, (state, action) => {
        state.rentCalculation = action.payload
        localStorage.setItem(USER_RENT_CALCULATION_LS_KEY, action.payload.state)
      })
      .addCase(initializeSettings, (state) => {
        const user = localStorage.getItem(USER_LS_KEY)
        const userCurrency = localStorage.getItem(USER_CURRENCY_LS_KEY)
        const userRentCalculation = localStorage.getItem(
          USER_RENT_CALCULATION_LS_KEY,
        )
        state.user = user ? JSON.parse(user) : undefined
        state.userCurrency = userCurrency
          ? (userCurrency as Currency)
          : Currency.USD
        state.rentCalculation = userRentCalculation
          ? {
              state: userRentCalculation as RentCalculation['state'],
              date: new Date().getTime(),
            }
          : {
              state: RentCalculationState.Global,
              date: new Date().getTime(),
            }
        const { publicRuntimeConfig } = getConfig() as {
          publicRuntimeConfig?: { version: string }
        }
        const version = publicRuntimeConfig?.version ?? ''
        localStorage.setItem('lastVersionUsed', version)
        state.version = version

        state.isInitialized = true
      })
  },
)
