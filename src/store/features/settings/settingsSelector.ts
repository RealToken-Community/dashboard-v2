import { RootState } from 'src/store/store'

export const selectIsInitialized = (state: RootState): boolean =>
  state.settings.isInitialized

export const selectAddressList = (state: RootState): string[] =>
  state.settings.addressList.map((item) => item.toLowerCase())

export const selectCleanedAddressList = (state: RootState): string[] =>
  state.settings.addressList
    .filter((item) => item !== '')
    .map((item) => item.toLowerCase())
