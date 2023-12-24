import { FC } from 'react'
import { useTranslation } from 'react-i18next'

import _union from 'lodash/union'
import moment from 'moment'

import { useCurrencyValue } from 'src/hooks/useCurrencyValue'
import { UserRealtoken } from 'src/store/features/wallets/walletsSelector'

import { AssetPageTable, AssetPageTableProps } from './assetPageTable'

export const AssetPageHistoryTab: FC<{ data: UserRealtoken }> = ({ data }) => {
  const { t } = useTranslation('common', { keyPrefix: 'assetPage.history' })
  const [origin, ...historyChangesList] = data.history

  const changedKeys = historyChangesList.reduce<string[]>(
    (acc, item) => _union(acc, Object.keys(item.values)),
    []
  )

  function parseDate(date: string) {
    return moment(date, 'YYYYMMDD').toDate().toLocaleDateString()
  }

  function parseValue(value: number | string, key: string): string {
    if (key === 'canal') {
      return value.toString()
    }

    if (key === 'rentedUnits') {
      return value.toString()
    }

    if (key === 'grossRentYear' || key === 'netRentYear') {
      return useCurrencyValue((value as number) / 12)
    }

    return useCurrencyValue(value as number)
  }

  function parseKey(key: string): string {
    if (key === 'grossRentYear') {
      return t('grossRentMonth')
    }
    if (key === 'netRentYear') {
      return t('netRentMonth')
    }
    return t(key)
  }

  const tableData = historyChangesList
    .slice()
    .reverse()
    .reduce((acc, item, index) => {
      acc.push({
        label: t('date'),
        value: parseDate(item.date),
        separator: !!index,
      })

      acc.push(
        ...Object.entries(item.values).map(([key, value]) => ({
          label: parseKey(key),
          value: parseValue(value, key),
          isIndented: true,
        }))
      )
      return acc
    }, [] as AssetPageTableProps['data'])

  if (changedKeys.length) {
    tableData.push({
      label: t('date'),
      value: parseDate(origin.date),
      separator: true,
    })
    tableData.push(
      ...Object.entries(origin.values)
        .filter(([key]) => changedKeys.includes(key))
        .map(([key, value]) => ({
          label: parseKey(key),
          value: parseValue(value, key),
          isIndented: true,
        }))
    )
  }

  return <AssetPageTable data={tableData} />
}
