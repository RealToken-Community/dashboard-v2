import { createSelector } from '@reduxjs/toolkit'

import { RootState } from 'src/store/store'
import { RentCalculation } from 'src/types/RentCalculation'

import { User } from './settingsSlice'

export const selectIsInitialized = (state: RootState): boolean =>
  state.settings.isInitialized

export const selectIsLoading = (state: RootState): boolean =>
  !state.settings.isInitialized ||
  state.realtokens.isLoading ||
  state.wallets.isLoading ||
  state.currencies.isLoading

export const selectAllUserAddressList = (state: RootState) => {
  const addressList = state.settings.user?.addressList ?? []
  const customAddressList = state.settings.user?.customAddressList ?? []
  return Array.from(
    new Set(
      [...addressList, ...customAddressList].map((item) => item.toLowerCase())
    )
  )
}

export const selectUserAddressList = createSelector(
  (state: RootState) => state.settings.user,
  selectAllUserAddressList,
  (user, addressList) =>
    addressList.filter((item) => !user?.hiddenAddressList?.includes(item))
)

export const selectUserCurrency = (state: RootState): string =>
  state.settings.userCurrency

export const selectUser = (state: RootState): User | undefined =>
  state.settings.user

export const selectUserRentCalculation = (state: RootState): RentCalculation =>
  state.settings.rentCalculation

export const selectVersion = (state: RootState): string | undefined =>
  state.settings.version
