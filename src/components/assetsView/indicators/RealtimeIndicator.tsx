import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

import { Badge } from '@mantine/core'

import { selectUserRentCalculation } from 'src/store/features/settings/settingsSelector'
import { RentCalculationState } from 'src/types/RentCalculation'

import styles from './RealtimeIndicator.module.sass'

export const RealtimeIndicator: FC = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'realtimeIndicator',
  })
  const rentCalculation = useSelector(selectUserRentCalculation)

  if (rentCalculation.state !== RentCalculationState.Realtime) {
    return null
  }

  return (
    <Badge key={'realtime'} ml={'15px'}>
      <span>{'⏰'}</span>
      <span className={styles.realtimeIndicatorText}>{t('realtime')}</span>
    </Badge>
  )
}
