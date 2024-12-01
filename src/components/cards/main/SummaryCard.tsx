import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

import { Box, Card, Text, Title } from '@mantine/core'
import { IconArchive, IconBolt, IconBoltOff } from '@tabler/icons'

import { useREG } from 'src/hooks/useREG'
import { useRegVotingPower } from 'src/hooks/useREGVotingPower'
import { useRWA } from 'src/hooks/useRWA'
import { selectTransfersIsLoaded } from 'src/store/features/transfers/transfersSelector'
import {
  selectOwnedRealtokensValue,
  selectRmmDetails,
} from 'src/store/features/wallets/walletsSelector'

import { CurrencyField, DecimalField } from '../../commons'

export const SummaryCard: FC = () => {
  const { t } = useTranslation('common', { keyPrefix: 'summaryCard' })

  const realtokensValue = useSelector(selectOwnedRealtokensValue)
  const rmmDetails = useSelector(selectRmmDetails)
  const transfersIsLoaded = useSelector(selectTransfersIsLoaded)

  const rwa = useRWA()
  const reg = useREG()
  const regVotingPower = useRegVotingPower()

  const stableDepositValue = rmmDetails.stableDeposit
  const stableDebtValue = rmmDetails.stableDebt
  const rwaValue = rwa?.value ?? 0
  const regValue = reg?.value ?? 0
  const regVotingPowerAmount = regVotingPower?.amount ?? 0
  const isOver9000 = regVotingPowerAmount >= 9_000
  const totalNetValue =
    realtokensValue.total +
    stableDepositValue +
    rwaValue +
    regValue -
    stableDebtValue

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
        <CurrencyField label={t('rwa')} value={rwaValue} />
        <CurrencyField label={t('reg')} value={regValue} />
        <DecimalField
          label={t('regVote')}
          labelIcon={<IconArchive size={16} />}
          value={regVotingPowerAmount}
          unitIcon={
            regVotingPowerAmount > 0 ? (
              <IconBolt
                size={isOver9000 ? 24 : 20}
                color={'orange'}
                fill={isOver9000 ? 'orange' : 'none'}
              />
            ) : (
              <IconBoltOff size={16} />
            )
          }
        />
      </Box>
    </Card>
  )
}
