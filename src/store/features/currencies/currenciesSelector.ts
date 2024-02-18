import { createSelector } from '@reduxjs/toolkit'

import { RootState } from 'src/store/store'
import { CurrencySymbol } from 'src/types/Currencies'

export const selectCurrencyRates = createSelector(
  (state: RootState) => state.currencies,
  (state) => state.rates,
)

export const selectUserCurrency = createSelector(
  (state: RootState) => state.currencies.rates,
  (state: RootState) => state.settings.userCurrency,
  (rates, userCurrency) => ({
    rate: rates[userCurrency],
    symbol: CurrencySymbol[userCurrency],
  }),
)
