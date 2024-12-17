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
import { expiresLocalStorageCaches } from 'src/utils/useCache'

const USER_LS_KEY = 'store:settings/user'
const USER_CURRENCY_LS_KEY = 'store:settings/userCurrency'
const USER_RENT_CALCULATION_LS_KEY = 'store:settings/userRentCalculation'
const USER_INCLUDES_ETH_LS_KEY = 'store:settings/includesEth'
const USER_INCLUDES_LEVIN_SWAP_LS_KEY = 'store:settings/includesLevinSwap'
const USER_INCLUDES_RMM_V2_LS_KEY = 'store:settings/includesRmmV2'
const USER_INCLUDES_OTHER_ASSETS_LS_KEY = 'store:settings/includesOtherAssets'

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
  includesEth: boolean
  includesLevinSwap: boolean
  includesRmmV2: boolean
  includesOtherAssets: boolean
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
  includesEth: false,
  includesLevinSwap: false,
  includesRmmV2: false,
  includesOtherAssets: false,
}

// DISPATCH TYPE
export const initializeSettingsDispatchType = 'settings/initialize'
export const userChangedDispatchType = 'settings/userChanged'
export const userCurrencyChangedDispatchType = 'settings/userCurrencyChanged'
export const userRentCalculationChangedDispatchType =
  'settings/userRentCalculationChanged'
export const userIncludesEthChangedDispatchType = 'settings/includesEthChanged'
export const userIncludesLevinSwapChangedDispatchType =
  'settings/includesLevinSwapChanged'
export const userIncludesRmmV2ChangedDispatchType =
  'settings/includesRmmV2Changed'
export const userIncludesOtherAssetsDispatchType =
  'settings/includesOtherAssets'
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
export const userIncludesEthChanged = createAction<boolean>(
  userIncludesEthChangedDispatchType,
)
export const userIncludesLevinSwapChanged = createAction<boolean>(
  userIncludesLevinSwapChangedDispatchType,
)
export const userIncludesRmmV2Changed = createAction<boolean>(
  userIncludesRmmV2ChangedDispatchType,
)
export const userIncludesOtherAssetsChanged = createAction<boolean>(
  userIncludesOtherAssetsDispatchType,
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
      .addCase(userIncludesEthChanged, (state, action) => {
        state.includesEth = action.payload
        localStorage.setItem(
          USER_INCLUDES_ETH_LS_KEY,
          action.payload.toString(),
        )
      })
      .addCase(userIncludesLevinSwapChanged, (state, action) => {
        state.includesLevinSwap = action.payload
        localStorage.setItem(
          USER_INCLUDES_LEVIN_SWAP_LS_KEY,
          action.payload.toString(),
        )
      })
      .addCase(userIncludesRmmV2Changed, (state, action) => {
        state.includesRmmV2 = action.payload
        localStorage.setItem(
          USER_INCLUDES_RMM_V2_LS_KEY,
          action.payload.toString(),
        )
      })
      .addCase(userIncludesOtherAssetsChanged, (state, action) => {
        state.includesOtherAssets = action.payload
        localStorage.setItem(
          USER_INCLUDES_OTHER_ASSETS_LS_KEY,
          action.payload.toString(),
        )
      })
      .addCase(initializeSettings, (state) => {
        const user = localStorage.getItem(USER_LS_KEY)
        const userCurrency = localStorage.getItem(USER_CURRENCY_LS_KEY)
        const userRentCalculation = localStorage.getItem(
          USER_RENT_CALCULATION_LS_KEY,
        )
        const userIncludesEth = localStorage.getItem(USER_INCLUDES_ETH_LS_KEY)
        const userIncludesLevinSwap = localStorage.getItem(
          USER_INCLUDES_LEVIN_SWAP_LS_KEY,
        )
        const userIncludesRmmV2 = localStorage.getItem(
          USER_INCLUDES_RMM_V2_LS_KEY,
        )
        const userIncludesOtherAssets = localStorage.getItem(
          USER_INCLUDES_OTHER_ASSETS_LS_KEY,
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

        state.includesEth = userIncludesEth === 'true'
        state.includesLevinSwap = userIncludesLevinSwap === 'true'
        state.includesRmmV2 = userIncludesRmmV2 === 'true'
        state.includesOtherAssets = userIncludesOtherAssets === 'true'

        const { publicRuntimeConfig } = getConfig() as {
          publicRuntimeConfig?: { version: string }
        }
        const version = publicRuntimeConfig?.version ?? ''
        const lastVersionUsed = localStorage.getItem('lastVersionUsed')
        if (lastVersionUsed && lastVersionUsed !== version) {
          expiresLocalStorageCaches()
        }
        localStorage.setItem('lastVersionUsed', version)
        state.version = version

        state.isInitialized = true
      })
  },
)
