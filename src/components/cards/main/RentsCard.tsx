import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

import { Box, Card, Title } from '@mantine/core'

import {
  selectOwnedRealtokensAPY,
  selectOwnedRealtokensRents,
} from 'src/store/features/wallets/walletsSelector'

import useEURUSDRate from 'src/store/features/rates/useEURUSDRate'
import { APIRealTokenCurrency } from 'src/types/APIRealToken'
import { RootState } from 'src/store/store'

import { CurrencyField, PercentField } from '../../commons'

export const RentsCard: FC = () => {
  const { t } = useTranslation('common', { keyPrefix: 'rentsCard' })

  const rents = useSelector(selectOwnedRealtokensRents)
  const apy = useSelector(selectOwnedRealtokensAPY)

  // In Dollars
  let dailyRents = rents.daily
  let weeklyRents = rents.weekly
  let monthlyRents = rents.monthly
  let yearlyRents = rents.yearly

  const currency = useSelector((state : RootState) => state.currency.value);
  const eURUSDRate = useEURUSDRate();

  if (currency === APIRealTokenCurrency.EUR){
    // Dollars to Euros
    dailyRents = dailyRents / eURUSDRate;
    weeklyRents = weeklyRents / eURUSDRate;
    monthlyRents = monthlyRents / eURUSDRate;
    yearlyRents = yearlyRents / eURUSDRate;
  }

  return (
    <Card shadow={'sm'} radius={'md'} style={{ height: '100%' }}>
      <Title order={4}>{t('title')}</Title>
      <Box mx={'sm'} mt={'xs'}>
        <PercentField label={t('apr')} value={apy} />
        <CurrencyField label={t('daily')} value={dailyRents} />
        <CurrencyField label={t('weekly')} value={weeklyRents} />
        <CurrencyField label={t('monthly')} value={monthlyRents} />
        <CurrencyField label={t('yearly')} value={yearlyRents} />
      </Box>
    </Card>
  )
}
