import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { getCookie } from 'cookies-next'

import { StringField } from './StringField'
import { APIRealTokenCurrencySymbol } from 'src/types/APIRealToken'

export const CurrencyField: FC<{ label: string; value: number, symbol: string }> = (props) => {
  const { t } = useTranslation('common', { keyPrefix: 'numbers' })

  let symbol = props.symbol

  if (!symbol) {
    const currentCurrency = getCookie('fiat-currency') || 'eur'
    symbol = APIRealTokenCurrencySymbol[currentCurrency.toUpperCase()]
  }

  return (
    <StringField
      label={props.label}
      value={t('currency', { value: props.value, symbol: symbol })}
    />
  )
}
CurrencyField.displayName = 'CurrencyField'
