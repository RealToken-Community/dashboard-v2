import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

import { Box, Card, Grid, Text, Title } from '@mantine/core'

import {
  selectOwnedRealtokensValueEthereum,
  selectOwnedRealtokensValueGnosis,
  selectOwnedRealtokensValueRmm,
} from 'src/store/features/wallets/walletsSelector'

const WorthValue: FC<{ label: string; value: number }> = (props) => {
  const { t } = useTranslation('common', { keyPrefix: 'numbers' })

  return (
    <Grid justify='space-between'>
      <Grid.Col span='auto'>
        <div>{props.label}</div>
      </Grid.Col>
      <Grid.Col span='content'>
        <Box ta='right'>{t('currency', { value: props.value })}</Box>
      </Grid.Col>
    </Grid>
  )
}
WorthValue.displayName = 'WorthValue'

export const WorthCard: FC = () => {
  const { t } = useTranslation('common', { keyPrefix: 'worthCard' })

  const gnosisValue = useSelector(selectOwnedRealtokensValueGnosis)
  const ethereumValue = useSelector(selectOwnedRealtokensValueEthereum)
  const rmmValue = useSelector(selectOwnedRealtokensValueRmm)
  const totalValue = gnosisValue + ethereumValue + rmmValue

  return (
    <Card shadow='sm' radius='md' style={{ height: '100%' }}>
      <Title order={4}>{t('title')}</Title>
      <Box mx='sm' mt='xs'>
        <Text fz='lg' fw={500}>
          <WorthValue label={t('total')} value={totalValue} />
        </Text>
        <WorthValue label={t('ethereum')} value={ethereumValue} />
        <WorthValue label={t('gnosis')} value={gnosisValue} />
        <WorthValue label={t('rmm')} value={rmmValue} />
      </Box>
    </Card>
  )
}
