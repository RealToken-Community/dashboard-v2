import { createAction, createReducer } from '@reduxjs/toolkit'

import { RealtokenRepository } from 'src/repositories'
import { AppDispatch, RootState } from 'src/store/store'
import { APIRealTokenProductType } from 'src/types/APIRealToken'
import { RealToken } from 'src/types/RealToken'

interface RealtokenInitialStateType {
  realtokens: RealToken[]
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
export const realtokensChanged = createAction<RealToken[]>(
  realtokensChangedDispatchType,
)
export const realtokensIsLoading = createAction<boolean>(
  realtokensIsLoadingDispatchType,
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
        payload: data.filter((item) =>
          [
            APIRealTokenProductType.RealEstateRental,
            APIRealTokenProductType.LoanIncome,
          ].includes(item.productType),
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
  },
)
