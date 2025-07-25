import { createAction, createReducer } from '@reduxjs/toolkit'

import { de } from 'date-fns/locale'
import { forEach } from 'lodash'

import { RealtokenRepository } from 'src/repositories'
import { AppDispatch, RootState } from 'src/store/store'
import { APIRealTokenPitsBI_ExtraData } from 'src/types/APIPitsBI'
import { APIRealToken, APIRealTokenProductType } from 'src/types/APIRealToken'
import { RealToken } from 'src/types/RealToken'

interface RealtokenInitialStateType {
  realtokens: RealToken[]
  isLoading: boolean
  isLoadingExtraData: boolean
  isExtraDataLoaded: boolean
}

const realtokenInitialState: RealtokenInitialStateType = {
  realtokens: [],
  isLoading: false,
  isLoadingExtraData: false,
  isExtraDataLoaded: false,
}
// Filter function for product types
export const filterProductType = (item: APIRealToken) =>
  [
    APIRealTokenProductType.RealEstateRental,
    APIRealTokenProductType.LoanIncome,
    APIRealTokenProductType.Factoring,
  ].includes(item.productType)

// DISPATCH TYPE
export const realtokensChangedDispatchType = 'realtokens/realtokensChanged'
export const realtokensIsLoadingDispatchType = 'realtokens/realtokensIsLoading'

// ACTIONS
export const realtokensChanged = createAction<RealToken[]>(
  realtokensChangedDispatchType,
)
export const realtokensIsLoading = createAction<boolean>(
  realtokensIsLoadingDispatchType,
)

// DISPATCH TYPE
export const realtokensExtraDataChangedDispatchType =
  'realtokens/realtokensExtraDataChanged'
export const realtokensExtraDataIsLoadingDispatchType =
  'realtokens/realtokensExtraDataIsLoading'
export const realtokensExtraDataLoadedDispatchType =
  'realtokens/realtokensExtraDataLoaded'

// ACTIONS
export const realtokensExtraDataChanged = createAction<RealToken[]>(
  realtokensExtraDataChangedDispatchType,
)
export const realtokensExtraDataIsLoading = createAction<boolean>(
  realtokensExtraDataIsLoadingDispatchType,
)
export const realtokensExtraDataLoaded = createAction<boolean>(
  realtokensExtraDataLoadedDispatchType,
)

// THUNKS
export function fetchRealtokens() {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const { isLoading } = getState().realtokens
    if (isLoading) return
    dispatch({ type: realtokensIsLoadingDispatchType, payload: true })
    try {
      const data = await RealtokenRepository.getTokens()
      // Check for exiting extraData : if PitsBI has been used as fallback datasource
      // json will already contain 'actions' and 'historic' properties
      const hasExtraData = data.some(
        (token) =>
          (token as unknown as APIRealTokenPitsBI_ExtraData).actions ||
          (token as unknown as APIRealTokenPitsBI_ExtraData).historic,
      )
      if (hasExtraData) {
        // Reformat APIRealTokenPitsBI_ExtraData data
        forEach(data, (token: RealToken) => {
          const { actions, historic } =
            token as unknown as APIRealTokenPitsBI_ExtraData
          // Restructure token data: extract PitsBI "extra data"
          token.extraData = {
            pitsBI: {
              actions: actions,
              historic: historic,
            },
          }
          // Remove 'historic', 'actions' from token
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          delete (token as any).historic
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          delete (token as any).actions
        })
        dispatch({ type: realtokensExtraDataLoadedDispatchType, payload: true })
      }
      // Dispatch filtered realtokens
      dispatch({
        type: realtokensChangedDispatchType,
        payload: data.filter(filterProductType),
      })
    } catch (error) {
      console.log(error)
    } finally {
      dispatch({ type: realtokensIsLoadingDispatchType, payload: false })
    }
  }
}

export function fetchRealtokensExtraData() {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const { isLoading, isLoadingExtraData, isExtraDataLoaded } =
      getState().realtokens
    // Wait for the initial realtokens to be loaded, skip if already loading or loaded
    if (isLoading || isLoadingExtraData || isExtraDataLoaded) return
    dispatch({ type: realtokensExtraDataIsLoadingDispatchType, payload: true })

    try {
      const pitsBiExtraData =
        await RealtokenRepository.getTokensPitsBiExtraData()
      // Build a map of tokensExtraData by uuid
      const tokensExtraDataMap = new Map<string, APIRealTokenPitsBI_ExtraData>()
      pitsBiExtraData.forEach((item) => {
        tokensExtraDataMap.set(item.uuid, item)
      })
      const existingTokens = await RealtokenRepository.getTokens()

      existingTokens.forEach((token) => {
        const { actions, historic } = tokensExtraDataMap.get(token.uuid) || {}
        // Update existing token data with PitsBI "extra data"
        token.extraData = {
          pitsBI: {
            actions: actions,
            historic: historic,
          },
        }
      })
      dispatch({
        type: realtokensExtraDataChangedDispatchType,
        payload: existingTokens.filter(filterProductType),
      })
      dispatch({ type: realtokensExtraDataLoadedDispatchType, payload: true })
    } catch (error) {
      console.log(error)
    } finally {
      dispatch({
        type: realtokensExtraDataIsLoadingDispatchType,
        payload: false,
      })
    }
  }
}

export const realtokensReducers = createReducer(
  realtokenInitialState,
  (builder) => {
    builder.addCase(realtokensChanged, (state, action) => {
      state.realtokens = action.payload
    })
    builder.addCase(realtokensIsLoading, (state, action) => {
      state.isLoading = action.payload
    })
    builder.addCase(realtokensExtraDataChanged, (state, action) => {
      state.realtokens = action.payload
    })
    builder.addCase(realtokensExtraDataIsLoading, (state, action) => {
      state.isLoadingExtraData = action.payload
    })
    builder.addCase(realtokensExtraDataLoaded, (state, action) => {
      state.isExtraDataLoaded = action.payload
    })
  },
)
