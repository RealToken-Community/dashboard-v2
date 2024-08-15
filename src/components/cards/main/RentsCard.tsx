import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

import { Box, Card, Title } from '@mantine/core'

import { useGeneralFullyRentedAPR } from 'src/hooks/useFullyRentedAPR'
import {
  selectOwnedRealtokens,
  selectOwnedRealtokensAPY,
  selectOwnedRealtokensRents,
} from 'src/store/features/wallets/walletsSelector'

import { CurrencyField, PercentField } from '../../commons'

export const RentsCard: FC = () => {
  const { t } = useTranslation('common', { keyPrefix: 'rentsCard' })

  const rents = useSelector(selectOwnedRealtokensRents)
  const apy = useSelector(selectOwnedRealtokensAPY)
  const realtokens = useSelector(selectOwnedRealtokens)

  // In Dollars
  const dailyRents = rents.daily
  const weeklyRents = rents.weekly
  const monthlyRents = rents.monthly
  const yearlyRents = rents.yearly

  const fullyRentedAPR = useGeneralFullyRentedAPR(realtokens)

  return (
    <Card shadow={'sm'} radius={'md'} style={{ height: '100%' }}>
      <Title order={4}>{t('title')}</Title>
      <Box mx={'sm'}>
        <PercentField label={t('apr')} value={apy} />
        <PercentField
          label={t('fullyRentedAPR')}
          value={fullyRentedAPR / 100}
        />
        <CurrencyField label={t('daily')} value={dailyRents} />
        <CurrencyField label={t('weekly')} value={weeklyRents} />
        <CurrencyField label={t('monthly')} value={monthlyRents} />
        <CurrencyField label={t('yearly')} value={yearlyRents} />
      </Box>
    </Card>
  )
}
