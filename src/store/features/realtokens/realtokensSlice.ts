import { createAction, createReducer } from '@reduxjs/toolkit'

import { RealtokenRepository } from 'src/repositories'
import { AppDispatch, RootState } from 'src/store/store'
import { APIRealToken, APIRealTokenProductType } from 'src/types/APIRealToken'

interface RealtokenInitialStateType {
  realtokens: APIRealToken[]
  isLoading: boolean
}

const realtokenInitialState: RealtokenInitialStateType = {
  realtokens: [],
  isLoading: false,
}

// DISPATCH TYPE
export const realtokensChangedDispatchType = 'realtokens/realtokensChanged'
export const realtokensIsLoadingDispatchType = 'realtokens/realtokensIsLoading'

// ACTIONS
export const realtokensChanged = createAction<APIRealToken[]>(
  realtokensChangedDispatchType
)
export const realtokensIsLoading = createAction<boolean>(
  realtokensIsLoadingDispatchType
)

// THUNKS
export function fetchRealtokens() {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const isLoading = getState().realtokens.isLoading
    if (isLoading) return
    dispatch({ type: realtokensIsLoadingDispatchType, payload: true })
    try {
      const data = await RealtokenRepository.getTokens()
      dispatch({
        type: realtokensChangedDispatchType,
        payload: data.filter(
          (item) =>
            item.productType === APIRealTokenProductType.RealEstateRental
        ),
      })
    } catch (error) {
      console.log(error)
    } finally {
      dispatch({ type: realtokensIsLoadingDispatchType, payload: false })
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
  }
)
