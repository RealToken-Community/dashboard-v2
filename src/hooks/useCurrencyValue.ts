import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

import { selectUserCurrency } from 'src/store/features/currencies/currenciesSelector'

export const useCurrencyValue = (value: number | undefined, fallback = '-') => {
  const { t } = useTranslation('common', { keyPrefix: 'numbers' })
  const { rate, symbol } = useSelector(selectUserCurrency)

  if (!value) return fallback

  const rateValue = value / rate

  if (value > 0 && rateValue < 0.01) {
    return `< ${t('currency', { value: 0.01, symbol })}`
  } else if (value < 0 && rateValue > -0.01) {
    return `> ${t('currency', { value: -0.01, symbol })}`
  }

  return t('currency', { value: rateValue, symbol })
}
