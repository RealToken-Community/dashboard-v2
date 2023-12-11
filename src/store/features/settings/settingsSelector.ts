import { createSelector } from '@reduxjs/toolkit'

import { RootState } from 'src/store/store'

import { User } from './settingsSlice'

export const selectIsInitialized = (state: RootState): boolean =>
  state.settings.isInitialized

export const selectIsLoading = (state: RootState): boolean =>
  !state.settings.isInitialized ||
  state.realtokens.isLoading ||
  state.wallets.isLoading ||
  state.currencies.isLoading

export const selectAddressList = (state: RootState): string[] =>
  state.settings.user?.addressList ?? []

export const selectCleanedAddressList = createSelector(
  selectAddressList,
  (addressList) =>
    Array.from(new Set(addressList.map((item) => item.toLowerCase())))
)

export const selectUserCurrency = (state: RootState): string =>
  state.settings.userCurrency

export const selectUser = (state: RootState): User | undefined =>
  state.settings.user

export const selectUserRentCalculation = (
  state: RootState
): string | undefined => state.settings.rentCalculation

export const selectVersion = (state: RootState): string | undefined =>
  state.settings.version
