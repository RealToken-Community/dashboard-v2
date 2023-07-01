import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

import { Box, Card, Grid, Skeleton, Text, Title } from '@mantine/core'

import { selectIsLoading } from 'src/store/features/settings/settingsSelector'
import {
  selectOwnedRealtokensValueEthereum,
  selectOwnedRealtokensValueGnosis,
  selectOwnedRealtokensValueRmm,
  selectRmmDetails,
} from 'src/store/features/wallets/walletsSelector'

const SummaryValue: FC<{ label: string; value: number }> = (props) => {
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
SummaryValue.displayName = 'SummaryValue'

export const SummaryCard: FC = () => {
  const { t } = useTranslation('common', { keyPrefix: 'summaryCard' })

  const gnosisValue = useSelector(selectOwnedRealtokensValueGnosis)
  const ethereumValue = useSelector(selectOwnedRealtokensValueEthereum)
  const rmmValue = useSelector(selectOwnedRealtokensValueRmm)
  const rmmDetails = useSelector(selectRmmDetails)
  const realtokenValue = gnosisValue + ethereumValue + rmmValue
  const stableDepositValue = rmmDetails.stableDeposit
  const stableDebtValue = rmmDetails.stableDebt
  const totalNetValue = realtokenValue + stableDepositValue - stableDebtValue

  return (
    <Card shadow={'sm'} radius={'md'} style={{ height: '100%' }}>
      <Title order={4}>{t('title')}</Title>
      <Box mx={'sm'} mt={'xs'}>
        <Text fz={'lg'} fw={500}>
          <SummaryValue label={t('netValue')} value={totalNetValue} />
        </Text>
        <SummaryValue label={t('realtokenValue')} value={realtokenValue} />
        <SummaryValue label={t('stableDeposit')} value={stableDepositValue} />
        <SummaryValue label={t('stableBorrow')} value={stableDebtValue} />
      </Box>
    </Card>
  )
}
