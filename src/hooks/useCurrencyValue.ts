import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

import { selectUserCurrency } from 'src/store/features/currencies/currenciesSelector'

export const useCurrencyValue = (value: number | undefined, fallback = '-') => {
  const { t } = useTranslation('common', { keyPrefix: 'numbers' })
  const { rate, symbol } = useSelector(selectUserCurrency)

  return value ? t('currency', { value: value / rate, symbol }) : fallback
}
