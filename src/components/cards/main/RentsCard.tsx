import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

import { Box, Card, Title } from '@mantine/core'

import {
  selectOwnedRealtokensAPY,
  selectOwnedRealtokensRents,
} from 'src/store/features/wallets/walletsSelector'

import { CurrencyField, PercentField } from '../../commons'

export const RentsCard: FC = () => {
  const { t } = useTranslation('common', { keyPrefix: 'rentsCard' })

  const rents = useSelector(selectOwnedRealtokensRents)
  const apy = useSelector(selectOwnedRealtokensAPY)

  // In Dollars
  const dailyRents = rents.daily
  const weeklyRents = rents.weekly
  const monthlyRents = rents.monthly
  const yearlyRents = rents.yearly

  return (
    <Card shadow={'sm'} radius={'md'} style={{ height: '100%' }}>
      <Title order={4}>{t('title')}</Title>
      <Box mx={'sm'}>
        <PercentField label={t('apr')} value={apy} />
        <CurrencyField label={t('daily')} value={dailyRents} />
        <CurrencyField label={t('weekly')} value={weeklyRents} />
        <CurrencyField label={t('monthly')} value={monthlyRents} />
        <CurrencyField label={t('yearly')} value={yearlyRents} />
      </Box>
    </Card>
  )
}
