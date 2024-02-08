import { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { useRouter } from 'next/router'

import { Anchor, ScrollArea, Table } from '@mantine/core'

import { useCurrencyValue } from 'src/hooks/useCurrencyValue'
import { UserRealtoken } from 'src/store/features/wallets/walletsSelector'
import moment from 'moment'

export const AssetTable: FC<{ realtokens: UserRealtoken[] }> = (props) => {
  return (
    <ScrollArea>
      <Table>
        <thead>
          <AssetTableHeader />
        </thead>

        <tbody>
          {props.realtokens.map((item) => (
            <AssetTableRow key={item.id} value={item} />
          ))}
        </tbody>
      </Table>
    </ScrollArea>
  )
}
AssetTable.displayName = 'AssetTable'

const AssetTableHeader: FC = () => {
  const { t } = useTranslation('common', { keyPrefix: 'assetTable' })

  return (
    <tr>
      <th>{t('property')}</th>
      <th style={{ textAlign: 'right' }}>{t('ownedValue')}</th>
      <th style={{ textAlign: 'right' }}>{t('priceCost')}</th>
      <th style={{ textAlign: 'right' }}>{t('unrealizedCapitalGain')}</th>
      <th style={{ textAlign: 'right' }}>{t('tokenPrice')}</th>
      <th style={{ textAlign: 'right' }}>{t('unitPriceCost')}</th>
      <th style={{ textAlign: 'right' }}>{t('ownedTokens')}</th>
      <th style={{ textAlign: 'right' }}>{t('apr')}</th>
      <th style={{ textAlign: 'right' }}>{t('weeklyRents')}</th>
      <th style={{ textAlign: 'right' }}>{t('yearlyRents')}</th>
      <th style={{ textAlign: 'right' }}>{t('rentedUnits')}</th>
      <th style={{ textAlign: 'right' }}>{t('propertyValue')}</th>
      <th style={{ textAlign: 'right' }}>{t('lastChange')}</th>
    </tr>
  )
}
AssetTableHeader.displayName = 'AssetTableHeader'

const AssetTableRow: FC<{ value: UserRealtoken }> = (props) => {
  const { t } = useTranslation('common', { keyPrefix: 'numbers' })
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
    <tr>
      <td style={{ minWidth: '150px' }}>
        <Anchor onClick={() => router.push(`/asset/${props.value.id}`)}>
          {props.value.shortName}
        </Anchor>
      </td>
      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
        {useCurrencyValue(value)}
      </td>
      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
        {useCurrencyValue(priceCost)}
      </td>
      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
        {useCurrencyValue(unrealizedCapitalGain)}
      </td>
      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
        {useCurrencyValue(tokenPrice)}
      </td>
      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
        {useCurrencyValue(unitPriceCost)}
      </td>
      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
        {t('decimal', { value: props.value.amount })}
      </td>
      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
        {t('percent', { value: props.value.annualPercentageYield })}
      </td>
      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
        {useCurrencyValue(weeklyAmount)}
      </td>
      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
        {useCurrencyValue(yearlyAmount)}
      </td>
      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
        {t('decimal', { value: props.value.rentedUnits })}
        {' / '}
        {t('decimal', { value: props.value.totalUnits })}
        {` (${t('percentInteger', {
          value: (props.value.rentedUnits / props.value.totalUnits) * 100,
        })})`}
      </td>
      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
        {useCurrencyValue(totalInvestment)}
      </td>
      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
        {moment(props.value.lastChanges, 'YYYYMMDD')
          .toDate()
          .toLocaleDateString()}
      </td>
    </tr>
  )
}
AssetTableRow.displayName = 'AssetTableRow'
