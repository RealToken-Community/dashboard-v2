import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

import { Box, Card, Text, Title } from '@mantine/core'

import useEURUSDRate from 'src/store/features/rates/useEURUSDRate'
import usexDAIUSDRate from 'src/store/features/rates/usexDAIUSDRate'
import {
  selectOwnedRealtokensValueEthereum,
  selectOwnedRealtokensValueGnosis,
  selectOwnedRealtokensValueRmm,
  selectRmmDetailsInUsd,
} from 'src/store/features/wallets/walletsSelector'
import { RootState } from 'src/store/store'
import { APIRealTokenCurrency } from 'src/types/APIRealToken'

import { CurrencyField } from '../../commons'

export const SummaryCard: FC = () => {
  const { t } = useTranslation('common', { keyPrefix: 'summaryCard' })

  const gnosisValue = useSelector(selectOwnedRealtokensValueGnosis)
  const ethereumValue = useSelector(selectOwnedRealtokensValueEthereum)
  const rmmValue = useSelector(selectOwnedRealtokensValueRmm)
  const rmmDetails = useSelector(selectRmmDetailsInUsd)
  let realtokenValue = gnosisValue + ethereumValue + rmmValue

  const currency = useSelector((state: RootState) => state.currency.value)

  const xDaiUSDRate = usexDAIUSDRate()
  const eURUSDRate = useEURUSDRate()

  if (!xDaiUSDRate) return null

  // In dollars
  let stableDepositValue = rmmDetails.stableDeposit * xDaiUSDRate
  let stableDebtValue = rmmDetails.stableDebt * xDaiUSDRate
  let totalNetValue = realtokenValue + (stableDepositValue - stableDebtValue)

  if (currency === APIRealTokenCurrency.EUR && eURUSDRate) {
    // Dollars to Euros
    totalNetValue = totalNetValue / eURUSDRate
    realtokenValue = realtokenValue / eURUSDRate
    stableDepositValue = stableDepositValue / eURUSDRate
    stableDebtValue = stableDebtValue / eURUSDRate
  }

  return (
    <Card shadow={'sm'} radius={'md'} style={{ height: '100%' }}>
      <Title order={4}>{t('title')}</Title>
      <Box mx={'sm'} mt={'xs'}>
        <Text fz={'lg'} fw={500}>
          <CurrencyField label={t('netValue')} value={totalNetValue} />
        </Text>
        <CurrencyField label={t('realtokenValue')} value={realtokenValue} />
        <CurrencyField label={t('stableDeposit')} value={stableDepositValue} />
        <CurrencyField label={t('stableBorrow')} value={stableDebtValue} />
      </Box>
    </Card>
  )
}
