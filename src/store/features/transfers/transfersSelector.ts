import { createSelector } from '@reduxjs/toolkit'

import { RootState } from 'src/store/store'

export const selectTransfersIsLoading = createSelector(
  (state: RootState) => state.transfers,
  (state) => state.isLoading,
)

export const selectTransfersIsInitialLoading = createSelector(
  (state: RootState) => state.transfers,
  (state) => state.isInitialLoading,
)

export const selectTransfers = createSelector(
  (state: RootState) => state.transfers,
  (state) => state.transfers,
)
