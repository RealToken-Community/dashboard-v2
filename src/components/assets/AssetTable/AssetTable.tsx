import { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { ScrollArea, Table } from '@mantine/core'

import { OwnedRealtoken } from 'src/store/features/wallets/walletsSelector'

const AssetRow: FC<{ value: OwnedRealtoken }> = (props) => {
  const { t } = useTranslation('common', { keyPrefix: 'numbers' })
  return (
    <tr>
      <td>{props.value.shortName}</td>
      <td style={{ textAlign: 'right' }}>
        {t('currency', { value: props.value.value })}
      </td>
      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
        {t('percent', { value: props.value.annualPercentageYield })}
      </td>
      <td style={{ textAlign: 'right' }}>
        {t('decimal', { value: props.value.amount })}
      </td>
      <td style={{ textAlign: 'right' }}>
        {t('currency', {
          value: props.value.amount * props.value.netRentDayPerToken * 7,
        })}
      </td>
      <td style={{ textAlign: 'right' }}>
        {t('currency', {
          value: props.value.amount * props.value.netRentYearPerToken,
        })}
      </td>
      <td style={{ textAlign: 'right' }}>
        {t('currency', { value: props.value.totalInvestment })}
      </td>
    </tr>
  )
}

export const AssetTable: FC<{ realtokens: OwnedRealtoken[] }> = (props) => {
  const { t } = useTranslation('common', { keyPrefix: 'assetTable' })

  return (
    <ScrollArea>
      <Table>
        <thead>
          <tr>
            <th>{t('property')}</th>
            <th style={{ textAlign: 'right' }}>{t('ownedValue')}</th>
            <th style={{ textAlign: 'right' }}>{t('apr')}</th>
            <th style={{ textAlign: 'right' }}>{t('ownedTokens')}</th>
            <th style={{ textAlign: 'right' }}>{t('weeklyRents')}</th>
            <th style={{ textAlign: 'right' }}>{t('yearlyRents')}</th>
            <th style={{ textAlign: 'right' }}>{t('propertyValue')}</th>
          </tr>
        </thead>

        <tbody>
          {props.realtokens.map((item) => (
            <AssetRow key={item.id} value={item} />
          ))}
        </tbody>
      </Table>
    </ScrollArea>
  )
}
