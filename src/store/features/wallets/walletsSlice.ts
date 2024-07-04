import { createAction, createReducer } from '@reduxjs/toolkit'

import { WalletBalances, WalletsRepository } from 'src/repositories'
import {
  RmmRepository,
  WalletRmmPosition,
} from 'src/repositories/rmm.repository'
import { AppDispatch, RootState } from 'src/store/store'
import { RealToken } from 'src/types/RealToken'

import { selectUserAddressList } from '../settings/settingsSelector'

interface WalletsInitialStateType {
  balances: WalletBalances
  rmmPositions: WalletRmmPosition[]
  isLoading: boolean
}

const walletsInitialState: WalletsInitialStateType = {
  balances: {
    gnosis: [],
    ethereum: [],
    rmm: [],
    levinSwap: [],
  },
  rmmPositions: [],
  isLoading: false,
}

// DISPATCH TYPE
const balancesChangedDispatchType = 'wallets/balancesChanged'
const rmmPositionsChangedDispatchType = 'wallets/rmmPositionsChanged'
const isLoadingDispatchType = 'wallets/isLoading'

// ACTIONS
const balancesChanged = createAction<WalletBalances>(
  balancesChangedDispatchType,
)
const rmmPositionsChanged = createAction<WalletRmmPosition[]>(
  rmmPositionsChangedDispatchType,
)
const balancesIsLoading = createAction<boolean>(isLoadingDispatchType)

// THUNKS
export function fetchWallets(realtokens: RealToken[]) {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState()
    const isLoading = state.wallets.isLoading
    const addressList = selectUserAddressList(state)

    if (isLoading) return
    dispatch({ type: isLoadingDispatchType, payload: true })
    try {
      const [balances, rmmPositions] = await Promise.all([
        WalletsRepository.getBalances(addressList, realtokens),
        RmmRepository.getPositions(addressList),
      ])
      dispatch({ type: balancesChangedDispatchType, payload: balances })
      dispatch({ type: rmmPositionsChangedDispatchType, payload: rmmPositions })
    } catch (error) {
      console.log(error)
    } finally {
      dispatch({ type: isLoadingDispatchType, payload: false })
    }
  }
}

export function resetWallets() {
  return async (dispatch: AppDispatch) => {
    dispatch({
      type: balancesChangedDispatchType,
      payload: walletsInitialState.balances,
    })
    dispatch({
      type: rmmPositionsChangedDispatchType,
      payload: walletsInitialState.rmmPositions,
    })
  }
}

export const walletsReducers = createReducer(walletsInitialState, (builder) => {
  builder.addCase(balancesChanged, (state, action) => {
    state.balances = action.payload
  })
  builder.addCase(rmmPositionsChanged, (state, action) => {
    state.rmmPositions = action.payload
  })
  builder.addCase(balancesIsLoading, (state, action) => {
    state.isLoading = action.payload
  })
})
