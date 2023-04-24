import { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { Table } from '@mantine/core'

import { Realtoken } from 'src/store/features/wallets/walletsSelector'

const AssetRow: FC<{ value: Realtoken }> = (props) => {
  const { t } = useTranslation('common', { keyPrefix: 'numbers' })
  return (
    <tr>
      <td>{props.value.shortName}</td>
      <td>{t('percent', { value: props.value.annualPercentageYield })}</td>
      <td>{t('decimal', { value: props.value.amount })}</td>
      <td>{t('currency', { value: props.value.value })}</td>
      <td>
        {t('currency', {
          value: props.value.amount * props.value.netRentDayPerToken * 7,
        })}
      </td>
      <td>
        {t('currency', {
          value: props.value.amount * props.value.netRentYearPerToken,
        })}
      </td>
      <td>{t('currency', { value: props.value.totalInvestment })}</td>
    </tr>
  )
}

export const AssetTable: FC<{ realtokens: Realtoken[] }> = (props) => {
  const { t } = useTranslation('common', { keyPrefix: 'assetTable' })

  return (
    <Table>
      <thead>
        <tr>
          <th>{t('property')}</th>
          <th>{t('apr')}</th>
          <th>{t('ownedTokens')}</th>
          <th>{t('ownedValue')}</th>
          <th>{t('weeklyRents')}</th>
          <th>{t('yearlyRents')}</th>
          <th>{t('propertyValue')}</th>
        </tr>
      </thead>

      <tbody>
        {props.realtokens.map((item) => (
          <AssetRow key={item.id} value={item} />
        ))}
      </tbody>
    </Table>
  )
}
