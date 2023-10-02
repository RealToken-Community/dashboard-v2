import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { getCookie } from 'cookies-next'

import { Box, Card, Text, Title } from '@mantine/core'

import {
  selectOwnedRealtokensValueEthereum,
  selectOwnedRealtokensValueGnosis,
  selectOwnedRealtokensValueRmm,
  selectRmmDetails,
} from 'src/store/features/wallets/walletsSelector'

import { CurrencyField, DecimalField } from '../../commons'
import usexDAIUSDRate from 'src/store/features/rates/usexDAIUSDRate'
import useEURUSDRate from 'src/store/features/rates/useEURUSDRate'
import { useCurrency } from 'src/hooks/Connexts/Currency'
import { APIRealTokenCurrency } from 'src/types/APIRealToken'

export const SummaryCard: FC = () => {
  const { t } = useTranslation('common', { keyPrefix: 'summaryCard' })

  const gnosisValue = useSelector(selectOwnedRealtokensValueGnosis)
  const ethereumValue = useSelector(selectOwnedRealtokensValueEthereum)
  const rmmValue = useSelector(selectOwnedRealtokensValueRmm)
  const rmmDetails = useSelector(selectRmmDetails)
  const realtokenValue = gnosisValue + ethereumValue + rmmValue
  const stableDepositValue = rmmDetails.stableDeposit
  const stableDebtValue = rmmDetails.stableDebt
  let totalNetValue = 0

  const { currency, setCurrency } = useCurrency();
  const xDaiUSDRate = usexDAIUSDRate();
  const eURUSDRate = useEURUSDRate();


  console.log({ currency })

  if(!xDaiUSDRate) return null;

  // In dollars
  totalNetValue = realtokenValue + (stableDepositValue - stableDebtValue) * xDaiUSDRate;

  if (currency === APIRealTokenCurrency.EUR){
    if(!eURUSDRate) return null;

    // Dollars to Euros
    totalNetValue = totalNetValue / eURUSDRate;
  }

  return (
    <Card shadow={'sm'} radius={'md'} style={{ height: '100%' }}>
      <Title order={4}>{t('title')}</Title>
      <Box mx={'sm'} mt={'xs'}>
        <Text fz={'lg'} fw={500}>
          <CurrencyField label={t('netValue')} value={totalNetValue} />
        </Text>
        <CurrencyField label={t('realtokenValue')} value={realtokenValue} />
        <DecimalField
          label={t('stableDeposit')}
          value={stableDepositValue}
          suffix={' xDai'}
        />
        <DecimalField
          label={t('stableBorrow')}
          value={stableDebtValue}
          suffix={' xDai'}
        />
      </Box>
    </Card>
  )
}
