import { createAction, createReducer } from '@reduxjs/toolkit'

import {
  CurrencyRates,
  RatesRepository,
} from 'src/repositories/rates.repository'
import { AppDispatch, RootState } from 'src/store/store'

interface RatesInitialStateType {
  rates: CurrencyRates
  isLoading: boolean
}

const ratesInitialState: RatesInitialStateType = {
  rates: {
    XdaiUsd: 1,
    EurUsd: 1,
    ChfUsd: 1,
  },
  isLoading: false,
}

// DISPATCH TYPE
export const ratesChangedDispatchType = 'rates/ratesChanged'
export const ratesIsLoadingDispatchType = 'rates/ratesIsLoading'

// ACTIONS
export const ratesChanged = createAction<CurrencyRates>(
  ratesChangedDispatchType
)
export const ratesIsLoading = createAction<boolean>(ratesIsLoadingDispatchType)

// THUNKS
export function fetchRates() {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState()
    const isLoading = state.rates.isLoading

    if (isLoading) return
    dispatch({ type: ratesIsLoadingDispatchType, payload: true })
    try {
      const rates = await RatesRepository.getRates()

      dispatch({ type: ratesChangedDispatchType, payload: rates })
    } catch (error) {
      console.log(error)
    } finally {
      dispatch({ type: ratesIsLoadingDispatchType, payload: false })
    }
  }
}

// REDUCER
export const ratesReducers = createReducer(ratesInitialState, (builder) => {
  builder
    .addCase(ratesChanged, (state, action) => {
      state.rates = action.payload
    })
    .addCase(ratesIsLoading, (state, action) => {
      state.isLoading = action.payload
    })
})
