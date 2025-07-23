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
export const realtokensExtraDataChangedDispatchType = 'realtokens/realtokensExtraDataChanged'
export const realtokensExtraDataIsLoadingDispatchType = 'realtokens/realtokensExtraDataIsLoading'
export const realtokensExtraDataLoadedDispatchType = 'realtokens/realtokensExtraDataLoaded'

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
    const { isLoading, isLoadingExtraData } = getState().realtokens

    console.debug(`Current state isLoading: ${isLoading} isLoadingExtraData: ${isLoadingExtraData}`)
    if (isLoading) return
    dispatch({ type: realtokensIsLoadingDispatchType, payload: true })
    try {
      const data = await RealtokenRepository.getTokens()
      // Check for extraData
      const hasExtraData = data.some((token) => (token as unknown as APIRealTokenPitsBI_ExtraData).actions || (token as unknown as APIRealTokenPitsBI_ExtraData).historic)
      if (hasExtraData) {
        console.debug('Realtokens with Pitsbi EXTRA DATA FOUND')
        // Reformat APIRealTokenPitsBI_ExtraData data
        forEach(data, (token: RealToken) => {
          const { actions, historic } = token as unknown as APIRealTokenPitsBI_ExtraData
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
      console.debug('Filtering realtokens based on product type...')
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
    const { isLoading, isLoadingExtraData, isExtraDataLoaded } = getState().realtokens
    // Wait for the initial realtokens to be loaded
    console.debug('Fetching realtokens extra data... (0)')
    console.debug(`Current state isLoading: ${isLoading} isLoadingExtraData: ${isLoadingExtraData} isExtraDataLoaded: ${isExtraDataLoaded}`)
    if (isLoading) return
    // TODO: check if additional data is already loaded
    // TODO: check if additional data is already loaded
    // TODO: check if additional data is already loaded
    // TODO: check if additional data is already loaded: find if any realtoken has extraData
    console.debug('Fetching realtokens extra data... (1)')
    if (isLoadingExtraData) {
      console.debug('Realtokens extra data is already being loaded, skipping')
      return
    }

    if (isExtraDataLoaded) {
      console.debug('Realtokens extra data is already loaded, skipping')
      return
    }

    console.debug('Fetching realtokens extra data... (2)')
    console.debug('Fetching realtokens extra data from repository...')

    dispatch({ type: realtokensExtraDataIsLoadingDispatchType, payload: true })

    try {
      const pitsBiExtraData = await RealtokenRepository.getTokensPitsBiExtraData()
      console.debug(`Fetched pitsBiExtraData : ${pitsBiExtraData.length}`, pitsBiExtraData)

      // Build a map of tokensExtraData by uuid
      const tokensExtraDataMap = new Map<string, APIRealTokenPitsBI_ExtraData>()
      pitsBiExtraData.forEach((item) => {
        tokensExtraDataMap.set(item.uuid, item)
      })

      console.debug('extraData: tokensExtraDataMap size:', tokensExtraDataMap.size)
      const existingTokens = (await RealtokenRepository.getTokens())
      console.debug('existingTokens length:', existingTokens.length)

      existingTokens.forEach((token) => {
        if (token.productType == APIRealTokenProductType.EquityToken) {
          console.debug(`Processing token: ${token.uuid} (${token.fullName})`)
        }
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
      dispatch({ type: realtokensExtraDataIsLoadingDispatchType, payload: false })
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
