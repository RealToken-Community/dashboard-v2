import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

import { useRouter } from 'next/router'

import { Anchor, ScrollArea, Table } from '@mantine/core'

import moment from 'moment'

import { useCurrencyValue } from 'src/hooks/useCurrencyValue'
import { selectTransfersIsLoaded } from 'src/store/features/transfers/transfersSelector'
import { UserRealtoken } from 'src/store/features/wallets/walletsSelector'

export const AssetTable: FC<{ realtokens: UserRealtoken[] }> = (props) => {
  return (
    <ScrollArea>
      <Table>
        <Table.Thead>
          <AssetTableHeader />
        </Table.Thead>

        <Table.Tbody>
          {props.realtokens.map((item) => (
            <AssetTableRow key={item.id} value={item} />
          ))}
        </Table.Tbody>
      </Table>
    </ScrollArea>
  )
}
AssetTable.displayName = 'AssetTable'

const AssetTableHeader: FC = () => {
  const { t } = useTranslation('common', { keyPrefix: 'assetTable' })
  const transfersIsLoaded = useSelector(selectTransfersIsLoaded)

  return (
    <Table.Tr>
      <Table.Th style={{ textAlign: 'left' }}>{t('property')}</Table.Th>
      <Table.Th style={{ textAlign: 'right' }}>{t('ownedValue')}</Table.Th>
      {transfersIsLoaded ? (
        <>
          <Table.Th style={{ textAlign: 'right' }}>{t('priceCost')}</Table.Th>
          <Table.Th style={{ textAlign: 'right' }}>
            {t('unrealizedCapitalGain')}
          </Table.Th>
        </>
      ) : null}
      <Table.Th style={{ textAlign: 'right' }}>{t('tokenPrice')}</Table.Th>
      {transfersIsLoaded ? (
        <Table.Th style={{ textAlign: 'right' }}>{t('unitPriceCost')}</Table.Th>
      ) : null}
      <Table.Th style={{ textAlign: 'right' }}>{t('ownedTokens')}</Table.Th>
      <Table.Th style={{ textAlign: 'right' }}>{t('apr')}</Table.Th>
      <Table.Th style={{ textAlign: 'right' }}>{t('weeklyRents')}</Table.Th>
      <Table.Th style={{ textAlign: 'right' }}>{t('yearlyRents')}</Table.Th>
      <Table.Th style={{ textAlign: 'right' }}>{t('rentedUnits')}</Table.Th>
      <Table.Th style={{ textAlign: 'right' }}>{t('propertyValue')}</Table.Th>
      <Table.Th style={{ textAlign: 'right' }}>{t('lastChange')}</Table.Th>
    </Table.Tr>
  )
}
AssetTableHeader.displayName = 'AssetTableHeader'

const AssetTableRow: FC<{ value: UserRealtoken }> = (props) => {
  const { t } = useTranslation('common', { keyPrefix: 'numbers' })
  const transfersIsLoaded = useSelector(selectTransfersIsLoaded)
  const router = useRouter()

  const value = props.value.value
  const priceCost = props.value.priceCost
  const unrealizedCapitalGain = props.value.unrealizedCapitalGain
  const tokenPrice = props.value.tokenPrice
  const unitPriceCost = props.value.unitPriceCost
  const weeklyAmount = props.value.amount * props.value.netRentDayPerToken * 7
  const yearlyAmount = props.value.amount * props.value.netRentYearPerToken
  const totalInvestment = props.value.totalInvestment

  return (
    <Table.Tr>
      <Table.Td style={{ minWidth: '150px' }}>
        <Anchor onClick={() => router.push(`/asset/${props.value.id}`)}>
          {props.value.shortName}
        </Anchor>
      </Table.Td>
      <Table.Td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
        {useCurrencyValue(value)}
      </Table.Td>
      {transfersIsLoaded ? (
        <>
          <Table.Td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
            {useCurrencyValue(priceCost)}
          </Table.Td>
          <Table.Td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
            {useCurrencyValue(unrealizedCapitalGain)}
          </Table.Td>
        </>
      ) : null}

      <Table.Td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
        {useCurrencyValue(tokenPrice)}
      </Table.Td>
      {transfersIsLoaded ? (
        <Table.Td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
          {useCurrencyValue(unitPriceCost)}
        </Table.Td>
      ) : null}
      <Table.Td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
        {t('decimal', { value: props.value.amount })}
      </Table.Td>
      <Table.Td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
        {t('percent', { value: props.value.annualPercentageYield })}
      </Table.Td>
      <Table.Td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
        {useCurrencyValue(weeklyAmount)}
      </Table.Td>
      <Table.Td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
        {useCurrencyValue(yearlyAmount)}
      </Table.Td>
      <Table.Td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
        {t('decimal', { value: props.value.rentedUnits })}
        {' / '}
        {t('decimal', { value: props.value.totalUnits })}
        {` (${t('percentInteger', {
          value: (props.value.rentedUnits / props.value.totalUnits) * 100,
        })})`}
      </Table.Td>
      <Table.Td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
        {useCurrencyValue(totalInvestment)}
      </Table.Td>
      <Table.Td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
        {moment(props.value.lastChanges, 'YYYYMMDD')
          .toDate()
          .toLocaleDateString()}
      </Table.Td>
    </Table.Tr>
  )
}
AssetTableRow.displayName = 'AssetTableRow'
