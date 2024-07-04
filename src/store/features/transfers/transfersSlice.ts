import { createAction, createReducer } from '@reduxjs/toolkit'

import { TransferDatabaseService } from 'src/repositories/transfers/TransferDatabase'
import { UserRealTokenTransfer } from 'src/repositories/transfers/transfers.type'
import { TransferRepository } from 'src/repositories/transferts.repository'
import { AppDispatch, RootState } from 'src/store/store'
import { RealToken } from 'src/types/RealToken'

import {
  selectAllUserAddressList,
  selectUserAddressList,
} from '../settings/settingsSelector'

interface TransfersInitialStateType {
  transfers: UserRealTokenTransfer[]
  isLoading: boolean
  isLoaded: boolean
  isInitialLoading: boolean
}

const transfersInitialState: TransfersInitialStateType = {
  transfers: [],
  isLoading: false,
  isLoaded: false,
  isInitialLoading: false,
}

// DISPATCH TYPE
export const transfersChangedDispatchType = 'transfers/transfersChanged'
export const transfersIsLoadingDispatchType = 'transfers/transfersIsLoading'
export const transfersIsLoadedDispatchType = 'transfers/transfersIsLoaded'
export const transfersIsInitialLoadingDispatchType =
  'transfers/transfersIsInitialLoading'

// ACTIONS
export const transfersChanged = createAction<UserRealTokenTransfer[]>(
  transfersChangedDispatchType,
)
export const transfersIsLoading = createAction<boolean>(
  transfersIsLoadingDispatchType,
)
export const transfersIsLoaded = createAction<boolean>(
  transfersIsLoadedDispatchType,
)
export const transfersIsInitialLoading = createAction<boolean>(
  transfersIsInitialLoadingDispatchType,
)

// THUNKS
export function fetchTransfers(allRealtokens: RealToken[]) {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState()
    const isLoading = getState().transfers.isLoading
    const addressList = selectUserAddressList(state)
    const allAddressList = selectAllUserAddressList(state)

    if (isLoading) return

    dispatch({ type: transfersIsLoadingDispatchType, payload: true })

    try {
      const lastSyncTimestamp =
        await TransferDatabaseService.getLastSyncTimestamp(addressList)

      if (lastSyncTimestamp === 0) {
        dispatch({ type: transfersIsInitialLoadingDispatchType, payload: true })
      }

      const data = await TransferRepository.getTransfers({
        realtokenList: allRealtokens,
        userAddressList: allAddressList,
        fromTimestamp: lastSyncTimestamp ? lastSyncTimestamp + 1 : 0,
        filters: {
          userAddressList: addressList,
        },
      })

      await TransferDatabaseService.saveLastSyncTimestamp(data, addressList)

      dispatch({ type: transfersChangedDispatchType, payload: data })
      dispatch({ type: transfersIsLoadedDispatchType, payload: true })
    } catch (error) {
      dispatch({ type: transfersChangedDispatchType, payload: [] })
      dispatch({ type: transfersIsLoadedDispatchType, payload: false })
      console.log(error)
    } finally {
      dispatch({ type: transfersIsLoadingDispatchType, payload: false })
      dispatch({ type: transfersIsInitialLoadingDispatchType, payload: false })
    }
  }
}

export function resetTransfers() {
  return async (dispatch: AppDispatch) => {
    dispatch({ type: transfersChangedDispatchType, payload: [] })
    dispatch({ type: transfersIsLoadedDispatchType, payload: false })
  }
}

export const transfersReducers = createReducer(
  transfersInitialState,
  (builder) => {
    builder.addCase(transfersChanged, (state, action) => {
      state.transfers = action.payload
    })
    builder.addCase(transfersIsLoading, (state, action) => {
      state.isLoading = action.payload
    })
    builder.addCase(transfersIsLoaded, (state, action) => {
      state.isLoaded = action.payload
    })
    builder.addCase(transfersIsInitialLoading, (state, action) => {
      state.isInitialLoading = action.payload
    })
  },
)
