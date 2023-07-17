import { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { StringField } from './StringField'

export const IntegerField: FC<{ label: string; value: number }> = (props) => {
  const { t } = useTranslation('common', { keyPrefix: 'numbers' })

  return (
    <StringField
      label={props.label}
      value={t('integer', { value: props.value })}
    />
  )
}
IntegerField.displayName = 'IntegerField'
