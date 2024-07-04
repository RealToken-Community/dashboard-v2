import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

import { Box, Card, Text, Title } from '@mantine/core'

import { selectTransfersIsLoaded } from 'src/store/features/transfers/transfersSelector'
import {
  selectOwnedRealtokensValue,
  selectRmmDetails,
} from 'src/store/features/wallets/walletsSelector'

import { CurrencyField } from '../../commons'

export const SummaryCard: FC = () => {
  const { t } = useTranslation('common', { keyPrefix: 'summaryCard' })

  const realtokensValue = useSelector(selectOwnedRealtokensValue)
  const rmmDetails = useSelector(selectRmmDetails)
  const transfersIsLoaded = useSelector(selectTransfersIsLoaded)

  const stableDepositValue = rmmDetails.stableDeposit
  const stableDebtValue = rmmDetails.stableDebt
  const totalNetValue =
    realtokensValue.total + stableDepositValue - stableDebtValue

  return (
    <Card shadow={'sm'} radius={'md'} style={{ height: '100%' }}>
      <Title order={4}>{t('title')}</Title>
      <Box mx={'sm'}>
        <Text fz={'lg'} fw={500} component={'div'}>
          <CurrencyField label={t('netValue')} value={totalNetValue} />
        </Text>
        <CurrencyField
          label={t('realtokenValue')}
          value={realtokensValue.total}
        />
        {transfersIsLoaded ? (
          <CurrencyField
            label={t('totalPriceCost')}
            value={realtokensValue.totalPriceCost}
          />
        ) : null}
        <CurrencyField label={t('stableDeposit')} value={stableDepositValue} />
        <CurrencyField label={t('stableBorrow')} value={stableDebtValue} />
      </Box>
    </Card>
  )
}
