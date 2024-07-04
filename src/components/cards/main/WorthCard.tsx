import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

import { Box, Card, Text, Title } from '@mantine/core'

import { selectOwnedRealtokensValue } from 'src/store/features/wallets/walletsSelector'

import { CurrencyField } from '../../commons'

export const WorthCard: FC = () => {
  const { t } = useTranslation('common', { keyPrefix: 'worthCard' })

  const realtokensValue = useSelector(selectOwnedRealtokensValue)

  return (
    <Card shadow={'sm'} radius={'md'} style={{ height: '100%' }}>
      <Title order={4}>{t('title')}</Title>
      <Box mx={'sm'}>
        <Text fz={'lg'} fw={500} component={'div'}>
          <CurrencyField label={t('total')} value={realtokensValue.total} />
        </Text>
        <CurrencyField label={t('ethereum')} value={realtokensValue.ethereum} />
        <CurrencyField label={t('gnosis')} value={realtokensValue.gnosis} />
        <CurrencyField label={t('rmm')} value={realtokensValue.rmm} />
        <CurrencyField
          label={t('levinSwap')}
          value={realtokensValue.levinSwap}
        />
      </Box>
    </Card>
  )
}
