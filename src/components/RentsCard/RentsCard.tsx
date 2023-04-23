import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

import { Box, Card, Grid, Title } from '@mantine/core'

import {
  selectOwnedRealtokensAPY,
  selectOwnedRealtokensRents,
} from 'src/store/features/wallets/walletsSelector'

const APYValue: FC<{ label: string; value: number }> = (props) => {
  const { t } = useTranslation('common', { keyPrefix: 'numbers' })

  return (
    <Grid justify='space-between'>
      <Grid.Col span='auto'>
        <div>{props.label}</div>
      </Grid.Col>
      <Grid.Col span='content'>
        <Box ta='right'>{t('percent', { value: props.value * 100 })}</Box>
      </Grid.Col>
    </Grid>
  )
}
APYValue.displayName = 'RentsValue'

const RentsValue: FC<{ label: string; value: number }> = (props) => {
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
RentsValue.displayName = 'RentsValue'

export const RentsCard: FC = () => {
  const { t } = useTranslation('common', { keyPrefix: 'rentsCard' })

  const rents = useSelector(selectOwnedRealtokensRents)
  const apy = useSelector(selectOwnedRealtokensAPY)

  return (
    <Card shadow='sm' radius='md' style={{ height: '100%' }}>
      <Title order={4}>{t('title')}</Title>
      <Box mx='sm' mt='xs'>
        <APYValue label={t('apr')} value={apy} />
        <RentsValue label={t('daily')} value={rents.daily} />
        <RentsValue label={t('weekly')} value={rents.weekly} />
        <RentsValue label={t('monthly')} value={rents.monthly} />
        <RentsValue label={t('yearly')} value={rents.yearly} />
      </Box>
    </Card>
  )
}
