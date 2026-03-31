import { createSelector } from '@reduxjs/toolkit'

import { RootState } from 'src/store/store'

export const selectRealtokensIsLoading = createSelector(
  (state: RootState) => state.realtokens,
  (state) => state.isLoading,
)

export const selectRealtokensIsLoadingExtraData = createSelector(
  (state: RootState) => state.realtokens,
  (state) => state.isLoadingExtraData,
)

export const selectRealtokens = createSelector(
  (state: RootState) => state.realtokens,
  (realtokens) => realtokens.realtokens,
)
