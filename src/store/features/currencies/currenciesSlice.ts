import { createAction, createReducer } from '@reduxjs/toolkit'

import { CurrenciesRepository } from 'src/repositories'
import { AppDispatch, RootState } from 'src/store/store'
import { Currency } from 'src/types/Currencies'

interface CurrenciesInitialStateType {
  rates: Record<Currency, number>
  isLoading: boolean
}

const currenciesInitialState: CurrenciesInitialStateType = {
  rates: {
    [Currency.USD]: 1,
    [Currency.EUR]: 1,
    [Currency.CHF]: 1,
    [Currency.XDAI]: 1,
  },
  isLoading: false,
}

// DISPATCH TYPE
export const currenciesChangedDispatchType = 'currencies/currenciesChanged'
export const currenciesIsLoadingDispatchType = 'currencies/currenciesIsLoading'

// ACTIONS
export const currenciesChanged = createAction<Record<Currency, number>>(
  currenciesChangedDispatchType,
)
export const currenciesIsLoading = createAction<boolean>(
  currenciesIsLoadingDispatchType,
)

// THUNKS
export function fetchCurrenciesRates() {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState()
    const isLoading = state.currencies.isLoading

    if (isLoading) return
    dispatch({ type: currenciesIsLoadingDispatchType, payload: true })
    try {
      const { ChfUsd, EurUsd, XdaiUsd } = await CurrenciesRepository.getRates()

      dispatch({
        type: currenciesChangedDispatchType,
        payload: {
          [Currency.USD]: 1,
          [Currency.EUR]: EurUsd,
          [Currency.CHF]: ChfUsd,
          [Currency.XDAI]: XdaiUsd,
        },
      })
    } catch (error) {
      console.log(error)
    } finally {
      dispatch({ type: currenciesIsLoadingDispatchType, payload: false })
    }
  }
}

// REDUCER
export const currenciesReducers = createReducer(
  currenciesInitialState,
  (builder) => {
    builder
      .addCase(currenciesChanged, (state, action) => {
        state.rates = action.payload
      })
      .addCase(currenciesIsLoading, (state, action) => {
        state.isLoading = action.payload
      })
  },
)
