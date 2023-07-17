import { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { StringField } from './StringField'

interface DecimalFieldProps {
  label: string
  value: number
  suffix?: string
}

export const DecimalField: FC<DecimalFieldProps> = (props) => {
  const { t } = useTranslation('common', { keyPrefix: 'numbers' })

  return (
    <StringField
      label={props.label}
      value={t('decimal', { value: props.value }) + (props.suffix || '')}
    />
  )
}
DecimalField.displayName = 'DecimalField'
