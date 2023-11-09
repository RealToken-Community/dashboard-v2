import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

import { Box, Card, Text, Title } from '@mantine/core'

import {
  selectOwnedRealtokensValueEthereum,
  selectOwnedRealtokensValueGnosis,
  selectOwnedRealtokensValueLevinSwap,
  selectOwnedRealtokensValueRmm,
} from 'src/store/features/wallets/walletsSelector'

import { CurrencyField } from '../../commons'

export const WorthCard: FC = () => {
  const { t } = useTranslation('common', { keyPrefix: 'worthCard' })

  // In Dollars
  const gnosisValue = useSelector(selectOwnedRealtokensValueGnosis)
  const ethereumValue = useSelector(selectOwnedRealtokensValueEthereum)
  const rmmValue = useSelector(selectOwnedRealtokensValueRmm)
  const levinSwapValue = useSelector(selectOwnedRealtokensValueLevinSwap)
  const totalValue = gnosisValue + ethereumValue + rmmValue

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
        <CurrencyField label={t('levinSwap')} value={levinSwapValue} />
      </Box>
    </Card>
  )
}
