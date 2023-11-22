import { FC } from 'react'

import { useCurrencyValue } from 'src/hooks/useCurrencyValue'

import { StringField } from './StringField'

export const CurrencyField: FC<{ label: string; value?: number }> = (props) => {
  return (
    <StringField
      label={props.label}
      value={useCurrencyValue(props.value ?? 0)}
    />
  )
}
CurrencyField.displayName = 'CurrencyField'
