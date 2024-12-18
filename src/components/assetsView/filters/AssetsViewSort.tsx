import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

import { Grid, Select, Switch } from '@mantine/core'

import { assetsViewDefaultFilter } from 'src/states'
import { selectTransfersIsLoaded } from 'src/store/features/transfers/transfersSelector'
import {
  OtherRealtoken,
  UserRealtoken,
} from 'src/store/features/wallets/walletsSelector'

import { useInputStyles } from '../../inputs/useInputStyles'
import { AssetSortType } from '../types'

interface AssetsViewSortFilter {
  sortBy: AssetSortType
  sortReverse: boolean
}

interface AssetsViewSortProps {
  filter: AssetsViewSortFilter
  onChange: (value: AssetsViewSortFilter) => void
}

export const AssetsViewSort: FC<AssetsViewSortProps> = ({
  filter,
  onChange,
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'assetView' })
  const transfersIsLoaded = useSelector(selectTransfersIsLoaded)

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
    ...(transfersIsLoaded
      ? [
          {
            value: AssetSortType.UNIT_PRICE_COST,
            label: t('sortOptions.unitPriceCost'),
          },
          {
            value: AssetSortType.UNREALIZED_CAPITAL_GAIN,
            label: t('sortOptions.unrealizedCapitalGain'),
          },
        ]
      : []),
    {
      value: AssetSortType.LAST_CHANGE,
      label: t('sortOptions.lastChange'),
    },
  ]

  const { classes: inputClasses } = useInputStyles()

  return (
    <Grid>
      <Grid.Col span={'auto'}>
        <Select
          label={t('sort')}
          data={sortOptions}
          value={filter.sortBy}
          onChange={(value) =>
            onChange({
              ...filter,
              sortBy:
                (value as AssetSortType) ?? assetsViewDefaultFilter.sortBy,
            })
          }
          classNames={inputClasses}
        />
      </Grid.Col>
      <Grid.Col span={'content'}>
        <span>{t('sortReverse')}</span>
        <Switch
          checked={filter.sortReverse}
          onChange={(value) =>
            onChange({ ...filter, sortReverse: value.currentTarget.checked })
          }
        />
      </Grid.Col>
    </Grid>
  )
}
AssetsViewSort.displayName = 'AssetsViewSort'

type MixedRealtoken = Partial<UserRealtoken> &
  Partial<OtherRealtoken> &
  Pick<UserRealtoken, keyof OtherRealtoken>

export function useAssetsViewSort(filter: AssetsViewSortFilter) {
  function assetSortFunction(
    a: UserRealtoken | OtherRealtoken,
    b: UserRealtoken | OtherRealtoken,
  ) {
    const value = getAssetSortValue(a, b)
    return filter.sortReverse ? value * -1 : value
  }
  function getAssetSortValue(a: MixedRealtoken, b: MixedRealtoken) {
    switch (filter.sortBy) {
      case AssetSortType.VALUE:
        return b.value - a.value
      case AssetSortType.APR:
        return (b.annualPercentageYield ?? 0) - (a.annualPercentageYield ?? 0)
      case AssetSortType.RENT:
        return (
          b.amount * (b.netRentDayPerToken ?? 0) -
          a.amount * (a.netRentDayPerToken ?? 0)
        )
      case AssetSortType.RENT_START:
        return (b.rentStartDate?.date ?? '').localeCompare(
          a.rentStartDate?.date ?? '',
        )
      case AssetSortType.NAME:
        return a.shortName.localeCompare(b.shortName)
      case AssetSortType.SUPPLY:
        return b.totalInvestment - a.totalInvestment
      case AssetSortType.TOKEN:
        return b.amount - a.amount
      case AssetSortType.TOTAL_UNIT:
        return (b.totalUnits ?? 0) - (a.totalUnits ?? 0)
      case AssetSortType.RENTED_UNIT:
        return (b.rentedUnits ?? 0) - (a.rentedUnits ?? 0)
      case AssetSortType.OCCUPANCY:
        return (
          (b.rentedUnits ?? 0) / (b.totalUnits ?? 1) -
          (a.rentedUnits ?? 0) / (a.totalUnits ?? 1)
        )
      case AssetSortType.INITIAL_LAUNCH:
        return (b.initialLaunchDate?.date ?? '').localeCompare(
          a.initialLaunchDate?.date ?? '',
        )
      case AssetSortType.UNIT_PRICE_COST:
        return (b.unitPriceCost ?? 0) - (a.unitPriceCost ?? 0)
      case AssetSortType.UNREALIZED_CAPITAL_GAIN:
        return (b.unrealizedCapitalGain ?? 0) - (a.unrealizedCapitalGain ?? 0)
      case AssetSortType.LAST_CHANGE:
        return (b.lastChanges ?? '').localeCompare(a.lastChanges ?? '')
    }
  }

  return { assetSortFunction }
}
