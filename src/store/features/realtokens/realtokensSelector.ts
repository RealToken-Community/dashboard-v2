import { createSelector } from '@reduxjs/toolkit'

import { RootState } from 'src/store/store'
import { RealTokenCanal } from 'src/types/RealToken'

export const selectRealtokensIsLoading = (state: RootState): boolean =>
  state.realtokens.isLoading

const hiddenRealtokenCanals = [
  RealTokenCanal.OfferingClosed,
  RealTokenCanal.TokensMigrated,
]

export const selectRealtokens = createSelector(
  (state: RootState) => state.realtokens.realtokens,
  (realtokens) =>
    realtokens.filter((item) => !hiddenRealtokenCanals.includes(item.canal)),
)
