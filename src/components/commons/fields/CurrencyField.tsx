import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { getCookie } from 'cookies-next'

import { StringField } from './StringField'
import { APIRealTokenCurrencySymbol } from 'src/types/APIRealToken'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from 'src/store/store'

export const CurrencyField: FC<{ label: string; value: number }> = (props) => {
  const { t } = useTranslation('common', { keyPrefix: 'numbers' })
  const dispatch = useDispatch();
  const currency = useSelector((state : RootState) => state.currency.value);

  const symbol = APIRealTokenCurrencySymbol[currency as keyof typeof APIRealTokenCurrencySymbol];

  return (
    <StringField
      label={props.label}
      value={t('currency', { value: props.value, symbol: symbol })}
    />
  )
}
CurrencyField.displayName = 'CurrencyField'
