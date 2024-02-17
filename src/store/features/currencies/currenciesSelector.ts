import { createSelector } from '@reduxjs/toolkit'

import { RootState } from 'src/store/store'
import { Currency, CurrencySymbol } from 'src/types/Currencies'

export const selectCurrencyRates = (
  state: RootState,
): Record<Currency, number> => state.currencies.rates

export const selectUserCurrency = createSelector(
  (state: RootState) => state.currencies.rates,
  (state: RootState) => state.settings.userCurrency,
  (rates, userCurrency) => ({
    rate: rates[userCurrency],
    symbol: CurrencySymbol[userCurrency],
  }),
)
