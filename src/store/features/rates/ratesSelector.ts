import { CurrencyRates } from 'src/repositories/rates.repository'
import { RootState } from 'src/store/store'

export const selectCurrencyRates = (state: RootState): CurrencyRates =>
  state.rates.rates
