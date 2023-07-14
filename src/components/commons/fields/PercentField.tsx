import { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { StringField } from './StringField'

export const PercentField: FC<{ label: string; value: number }> = (props) => {
  const { t } = useTranslation('common', { keyPrefix: 'numbers' })

  return (
    <StringField
      label={props.label}
      value={t('percent', { value: props.value * 100 })}
    />
  )
}
PercentField.displayName = 'PercentField'
