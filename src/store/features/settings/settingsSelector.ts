import { createSelector } from '@reduxjs/toolkit'

import { RootState } from 'src/store/store'

export const selectIsInitialized = createSelector(
  (state: RootState) => state.settings,
  (state) => state.isInitialized,
)

export const selectIsLoading = createSelector(
  (state: RootState) => state.settings,
  (state: RootState) => state.realtokens,
  (state: RootState) => state.wallets,
  (state: RootState) => state.currencies,
  (state: RootState) => state.transfers,
  (state, realtokens, wallets, currencies, transfers) =>
    !state.isInitialized ||
    realtokens.isLoading ||
    wallets.isLoading ||
    currencies.isLoading ||
    transfers.isLoading,
)

export const selectAllUserAddressList = createSelector(
  (state: RootState) => state.settings.user,
  (user) => {
    const addressList = user?.addressList ?? []
    const customAddressList = user?.customAddressList ?? []
    return Array.from(
      new Set(
        [...addressList, ...customAddressList].map((item) =>
          item.toLowerCase(),
        ),
      ),
    )
  },
)

export const selectUserAddressList = createSelector(
  (state: RootState) => state.settings.user,
  selectAllUserAddressList,
  (user, addressList) =>
    addressList.filter((item) => !user?.hiddenAddressList?.includes(item)),
)

export const selectUserCurrency = createSelector(
  (state: RootState) => state.settings,
  (state) => state.userCurrency,
)

export const selectUser = createSelector(
  (state: RootState) => state.settings,
  (state) => state.user,
)

export const selectUserRentCalculation = createSelector(
  (state: RootState) => state.settings,
  (state) => state.rentCalculation,
)

export const selectVersion = createSelector(
  (state: RootState) => state.settings,
  (state) => state.version,
)
