import { RootState } from 'src/store/store'

export const selectIsInitialized = (state: RootState): boolean =>
  state.settings.isInitialized

export const selectIsLoading = (state: RootState): boolean =>
  !state.settings.isInitialized ||
  state.realtokens.isLoading ||
  state.wallets.isLoading

export const selectAddressList = (state: RootState): string[] =>
  state.settings.addressList

export const selectCleanedAddressList = (state: RootState): string[] =>
  Array.from(
    new Set(
      state.settings.addressList
        .filter((item) => item !== '')
        .map((item) => item.toLowerCase())
    )
  )
