import { createSelector } from '@reduxjs/toolkit'

import { RootState } from 'src/store/store'

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
