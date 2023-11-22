import { createSelector } from '@reduxjs/toolkit'

import { RootState } from 'src/store/store'
import { APIRealToken } from 'src/types/APIRealToken'

export interface Realtoken extends APIRealToken {
  isRmmAvailable: boolean
  rentStatus: 'full' | 'partial' | 'none'
}

function getRentStatus(item: APIRealToken) {
  if (!item.hasTenants || item.rentedUnits === 0) {
    return 'none'
  }
  return item.rentedUnits === item.totalUnits ? 'full' : 'partial'
}

export const selectRealtokensIsLoading = (state: RootState): boolean =>
  state.realtokens.isLoading

export const selectRealtokens = createSelector(
  (state: RootState) => state.realtokens.realtokens,
  (realtokens): Realtoken[] =>
    realtokens.map((item) => ({
      ...item,
      isRmmAvailable: !!item.blockchainAddresses.xDai.rmmPoolAddress,
      rentStatus: getRentStatus(item),
      // Some sections 8 are not correctly set in the API
      subsidyBy:
        item.subsidyBy ?? (item.subsidyStatus !== 'no' ? 'Section 8' : null),
    }))
)
