import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

import { Box, Card, Text, Title } from '@mantine/core'

import {
  selectOwnedRealtokensValueEthereum,
  selectOwnedRealtokensValueGnosis,
  selectOwnedRealtokensValueRmm,
} from 'src/store/features/wallets/walletsSelector'

import useEURUSDRate from 'src/store/features/rates/useEURUSDRate'
import { APIRealTokenCurrency } from 'src/types/APIRealToken'
import { RootState } from 'src/store/store'

import { CurrencyField } from '../../commons'

export const WorthCard: FC = () => {
  const { t } = useTranslation('common', { keyPrefix: 'worthCard' })

  // In Dollars
  let gnosisValue = useSelector(selectOwnedRealtokensValueGnosis)
  let ethereumValue = useSelector(selectOwnedRealtokensValueEthereum)
  let rmmValue = useSelector(selectOwnedRealtokensValueRmm)
  let totalValue = gnosisValue + ethereumValue + rmmValue

  const currency = useSelector((state : RootState) => state.currency.value);
  const eURUSDRate = useEURUSDRate();

  if (currency === APIRealTokenCurrency.EUR && eURUSDRate){
    // Dollars to Euros
    gnosisValue = gnosisValue / eURUSDRate;
    ethereumValue = ethereumValue / eURUSDRate;
    rmmValue = rmmValue / eURUSDRate;
    totalValue = totalValue / eURUSDRate;
  }

  return (
    <Card shadow={'sm'} radius={'md'} style={{ height: '100%' }}>
      <Title order={4}>{t('title')}</Title>
      <Box mx={'sm'} mt={'xs'}>
        <Text fz={'lg'} fw={500}>
          <CurrencyField label={t('total')} value={totalValue} />
        </Text>
        <CurrencyField label={t('ethereum')} value={ethereumValue} />
        <CurrencyField label={t('gnosis')} value={gnosisValue} />
        <CurrencyField label={t('rmm')} value={rmmValue} />
      </Box>
    </Card>
  )
}
