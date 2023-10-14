import { createAction, createReducer } from '@reduxjs/toolkit'

import { GetWalletBalance, WalletsRepository } from 'src/repositories'
import { AppDispatch, RootState } from 'src/store/store'

import { selectCleanedAddressList } from '../settings/settingsSelector'

interface WalletsInitialStateType {
  balances: GetWalletBalance
  isLoading: boolean
}

const walletsInitialState: WalletsInitialStateType = {
  balances: {
    gnosis: [],
    ethereum: [],
    rmm: [],
    rmmProtocol: [],
  },
  isLoading: false,
}

// DISPATCH TYPE
export const balancesChangedDispatchType = 'wallets/balancesChanged'
export const balancesIsLoadingDispatchType = 'wallets/balancesIsLoading'

// ACTIONS
export const balancesChanged = createAction<GetWalletBalance>(
  balancesChangedDispatchType
)
export const balancesIsLoading = createAction<boolean>(
  balancesIsLoadingDispatchType
)

// THUNKS
export function fetchWallets() {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState()
    const isLoading = state.wallets.isLoading
    const addressList = selectCleanedAddressList(state)

    if (isLoading) return
    dispatch({ type: balancesIsLoadingDispatchType, payload: true })
    try {
      const data = await WalletsRepository.getBalances(addressList)
      dispatch({ type: balancesChangedDispatchType, payload: data })
    } catch (error) {
      console.log(error)
    } finally {
      dispatch({ type: balancesIsLoadingDispatchType, payload: false })
    }
  }
}

export function resetWallets() {
  return async (dispatch: AppDispatch) => {
    dispatch({
      type: balancesChangedDispatchType,
      payload: walletsInitialState.balances,
    })
  }
}

export const walletsReducers = createReducer(walletsInitialState, (builder) => {
  builder.addCase(balancesChanged, (state, action) => {
    state.balances = action.payload
  })
  builder.addCase(balancesIsLoading, (state, action) => {
    state.isLoading = action.payload
  })
})
