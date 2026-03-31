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
  isWalletRpcHealthy: boolean
  isRmmGraphHealthy: boolean
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
  isWalletRpcHealthy: true,
  isRmmGraphHealthy: true,
}

// DISPATCH TYPE
const balancesChangedDispatchType = 'wallets/balancesChanged'
const rmmPositionsChangedDispatchType = 'wallets/rmmPositionsChanged'
const isLoadingDispatchType = 'wallets/isLoading'
const walletRpcHealthChangedDispatchType = 'wallets/walletRpcHealthChanged'
const rmmGraphHealthChangedDispatchType = 'wallets/rmmGraphHealthChanged'

// ACTIONS
const balancesChanged = createAction<WalletBalances>(
  balancesChangedDispatchType,
)
const rmmPositionsChanged = createAction<WalletRmmPosition[]>(
  rmmPositionsChangedDispatchType,
)
const balancesIsLoading = createAction<boolean>(isLoadingDispatchType)
const walletRpcHealthChanged = createAction<boolean>(
  walletRpcHealthChangedDispatchType,
)
const rmmGraphHealthChanged = createAction<boolean>(
  rmmGraphHealthChangedDispatchType,
)

// THUNKS
export function fetchWallets(realtokens: RealToken[]) {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState()
    const isLoading = state.wallets.isLoading
    const addressList = selectUserAddressList(state)
    const options = {
      includesEth: state.settings.includesEth,
      includesLevinSwap: state.settings.includesLevinSwap,
    }

    if (isLoading) return
    dispatch({ type: isLoadingDispatchType, payload: true })
    try {
      const [balancesResult, rmmPositionsResult] = await Promise.allSettled([
        WalletsRepository.getBalances(addressList, realtokens, options),
        RmmRepository.getPositions(addressList, realtokens),
      ])

      if (balancesResult.status === 'fulfilled') {
        dispatch({
          type: balancesChangedDispatchType,
          payload: balancesResult.value,
        })
        dispatch({ type: walletRpcHealthChangedDispatchType, payload: true })
      } else {
        console.warn(
          'Failed to fetch wallets balances, keeping previous state',
          balancesResult.reason,
        )
        dispatch({ type: walletRpcHealthChangedDispatchType, payload: false })
      }

      if (rmmPositionsResult.status === 'fulfilled') {
        dispatch({
          type: rmmPositionsChangedDispatchType,
          payload: rmmPositionsResult.value,
        })
        dispatch({ type: rmmGraphHealthChangedDispatchType, payload: true })
      } else {
        console.warn(
          'Failed to fetch RMM positions, using empty fallback',
          rmmPositionsResult.reason,
        )
        dispatch({ type: rmmPositionsChangedDispatchType, payload: [] })
        dispatch({ type: rmmGraphHealthChangedDispatchType, payload: false })
      }
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
  builder.addCase(walletRpcHealthChanged, (state, action) => {
    state.isWalletRpcHealthy = action.payload
  })
  builder.addCase(rmmGraphHealthChanged, (state, action) => {
    state.isRmmGraphHealthy = action.payload
  })
})
