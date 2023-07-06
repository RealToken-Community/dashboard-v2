import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

import { Box, Card, Grid, Skeleton, Title } from '@mantine/core'

import _sumBy from 'lodash/sumBy'

import { selectIsLoading } from 'src/store/features/settings/settingsSelector'
import {
  selectOwnedRealtokens,
  selectOwnedRealtokensRents,
  selectOwnedRealtokensValue,
} from 'src/store/features/wallets/walletsSelector'

const IntegerValue: FC<{ label: string; value: number }> = (props) => {
  const { t } = useTranslation('common', { keyPrefix: 'numbers' })

  const isLoading = useSelector(selectIsLoading)

  return (
    <Grid justify={'space-between'} align={'center'}>
      <Grid.Col span={'auto'}>
        <div>{props.label}</div>
      </Grid.Col>
      <Grid.Col span={'content'}>
        {isLoading ? (
          <Skeleton width={100} height={15} />
        ) : (
          <Box ta={'right'}>{t('decimal', { value: props.value })}</Box>
        )}
      </Grid.Col>
    </Grid>
  )
}
IntegerValue.displayName = 'IntegerValue'

const WorthValue: FC<{ label: string; value: number }> = (props) => {
  const { t } = useTranslation('common', { keyPrefix: 'numbers' })

  const isLoading = useSelector(selectIsLoading)

  return (
    <Grid justify={'space-between'} align={'center'}>
      <Grid.Col span={'auto'}>
        <div>{props.label}</div>
      </Grid.Col>
      <Grid.Col span={'content'}>
        {isLoading ? (
          <Skeleton width={100} height={15} />
        ) : (
          <Box ta={'right'}>{t('currency', { value: props.value })}</Box>
        )}
      </Grid.Col>
    </Grid>
  )
}
WorthValue.displayName = 'WorthValue'

export const PropertiesCard: FC = () => {
  const { t } = useTranslation('common', { keyPrefix: 'propertiesCard' })

  const value = useSelector(selectOwnedRealtokensValue)
  const realtokens = useSelector(selectOwnedRealtokens)
  const rents = useSelector(selectOwnedRealtokensRents)
  const sumRealtokens = _sumBy(realtokens, 'amount')
  const sumProperties = realtokens.length
  const meanValue = value ? value / sumProperties : 0
  const meanRents = rents.yearly ? rents.yearly / sumProperties : 0

  return (
    <Card shadow={'sm'} radius={'md'} style={{ height: '100%' }}>
      <Title order={4}>{t('title')}</Title>
      <Box mx={'sm'} mt={'xs'}>
        <IntegerValue label={t('tokens')} value={sumRealtokens} />
        <IntegerValue label={t('properties')} value={sumProperties} />
        <WorthValue label={t('averageValue')} value={meanValue} />
        <WorthValue label={t('averageRent')} value={meanRents} />
      </Box>
    </Card>
  )
}
