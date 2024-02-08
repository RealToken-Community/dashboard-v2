import { RootState } from 'src/store/store'
import { Currency, CurrencySymbol } from 'src/types/Currencies'

export const selectCurrencyRates = (
  state: RootState,
): Record<Currency, number> => state.currencies.rates

export const selectUserCurrency = (
  state: RootState,
): { rate: number; symbol: string } => {
  return {
    rate: state.currencies.rates[state.settings.userCurrency],
    symbol: CurrencySymbol[state.settings.userCurrency],
  }
}
