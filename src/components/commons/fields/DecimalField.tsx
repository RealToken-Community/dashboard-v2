import { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { StringField } from './StringField'

interface DecimalFieldProps {
  label: string
  labelIcon?: React.ReactNode
  value: number
  prefix?: string
  suffix?: string
  unit?: React.ReactNode
}

export const DecimalField: FC<DecimalFieldProps> = (props) => {
  const { t } = useTranslation('common', { keyPrefix: 'numbers' })

  return (
    <>
      <StringField
        label={props.label}
        labelIcon={props.labelIcon}
        value={
          (props.prefix || '') +
          t('decimal', { value: props.value }) +
          (props.suffix || '')
        }
        unit={props.unit}
      />
    </>
  )
}
DecimalField.displayName = 'DecimalField'
