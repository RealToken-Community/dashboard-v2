import { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { StringField } from './StringField'

export const CurrencyField: FC<{ label: string; value: number }> = (props) => {
  const { t } = useTranslation('common', { keyPrefix: 'numbers' })

  return (
    <StringField
      label={props.label}
      value={t('currency', { value: props.value })}
    />
  )
}
CurrencyField.displayName = 'CurrencyField'
