import { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { Select, Switch } from '@mantine/core'

import { useAtom } from 'jotai'

import { assetSortChoosedAtom, assetSortReverseAtom } from 'src/states'
import { UserRealtoken } from 'src/store/features/wallets/walletsSelector'

import { useInputStyles } from '../inputs/useInputStyles'
import { AssetSortType } from './types'

export const AssetsSort: FC = () => {
  const { t } = useTranslation('common', { keyPrefix: 'assetView' })

  const [choosenAssetSort, setChoosenAssetSort] = useAtom(assetSortChoosedAtom)
  const [choosenAssetSortReverse, setChoosenAssetSortReverse] =
    useAtom(assetSortReverseAtom)

  const sortOptions = [
    { value: AssetSortType.NAME, label: t('sortOptions.name') },
    { value: AssetSortType.VALUE, label: t('sortOptions.value') },
    { value: AssetSortType.APR, label: t('sortOptions.apr') },
    {
      value: AssetSortType.INITIAL_LAUNCH,
      label: t('sortOptions.initialLaunch'),
    },
    { value: AssetSortType.OCCUPANCY, label: t('sortOptions.occupancy') },
    { value: AssetSortType.RENT, label: t('sortOptions.rent') },
    { value: AssetSortType.TOKEN, label: t('sortOptions.token') },
    { value: AssetSortType.RENT_START, label: t('sortOptions.rentStart') },
    { value: AssetSortType.TOTAL_UNIT, label: t('sortOptions.totalUnit') },
    { value: AssetSortType.RENTED_UNIT, label: t('sortOptions.rentedUnit') },
    { value: AssetSortType.SUPPLY, label: t('sortOptions.supply') },
  ]

  const { classes: inputClasses } = useInputStyles()

  return (
    <>
      <Select
        label={t('sort')}
        data={sortOptions}
        value={choosenAssetSort}
        onChange={(value: AssetSortType) => value && setChoosenAssetSort(value)}
        classNames={inputClasses}
      />
      <span>{t('sortReverse')}</span>
      <Switch
        checked={choosenAssetSortReverse}
        onChange={(value) =>
          setChoosenAssetSortReverse(value.currentTarget.checked)
        }
      />
    </>
  )
}
AssetsSort.displayName = 'AssetsSort'

export function useAssetsSort() {
  const [choosenAssetSort] = useAtom(assetSortChoosedAtom)
  const [choosenAssetSortReverse] = useAtom(assetSortReverseAtom)

  function assetSortFunction(a: UserRealtoken, b: UserRealtoken) {
    const value = getAssetSortValue(a, b)
    return choosenAssetSortReverse ? value * -1 : value
  }
  function getAssetSortValue(a: UserRealtoken, b: UserRealtoken) {
    switch (choosenAssetSort) {
      case AssetSortType.VALUE:
        return b.value - a.value
      case AssetSortType.APR:
        return b.annualPercentageYield - a.annualPercentageYield
      case AssetSortType.RENT:
        return b.amount * b.netRentDayPerToken - a.amount * a.netRentDayPerToken
      case AssetSortType.RENT_START:
        return b.rentStartDate.date.localeCompare(a.rentStartDate.date)
      case AssetSortType.NAME:
        return a.shortName.localeCompare(b.shortName)
      case AssetSortType.SUPPLY:
        return b.totalInvestment - a.totalInvestment
      case AssetSortType.TOKEN:
        return b.amount - a.amount
      case AssetSortType.TOTAL_UNIT:
        return b.totalUnits - a.totalUnits
      case AssetSortType.RENTED_UNIT:
        return b.rentedUnits - a.rentedUnits
      case AssetSortType.OCCUPANCY:
        return b.rentedUnits / b.totalUnits - a.rentedUnits / a.totalUnits
      case AssetSortType.INITIAL_LAUNCH:
        return b.initialLaunchDate.date.localeCompare(a.initialLaunchDate.date)
    }
  }

  return { assetSortFunction }
}
