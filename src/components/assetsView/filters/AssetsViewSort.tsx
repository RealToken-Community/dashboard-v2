import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

import { Grid, Select, Switch } from '@mantine/core'

import { selectTransfersIsLoaded } from 'src/store/features/transfers/transfersSelector'
import {
  RWARealtoken,
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
            onChange({ ...filter, sortBy: value as AssetSortType })
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

export function useAssetsViewSort(filter: AssetsViewSortFilter) {
  function assetSortFunction(
    a: UserRealtoken | RWARealtoken,
    b: UserRealtoken | RWARealtoken,
  ) {
    const value = getAssetSortValue(a, b)
    return filter.sortReverse ? value * -1 : value
  }
  function getAssetSortValue(
    a: UserRealtoken | RWARealtoken,
    b: UserRealtoken | RWARealtoken,
  ) {
    const A = a as UserRealtoken
    const B = b as UserRealtoken
    switch (filter.sortBy) {
      case AssetSortType.VALUE:
        return B.value - A.value
      case AssetSortType.APR:
        return B.annualPercentageYield - A.annualPercentageYield
      case AssetSortType.RENT:
        return B.amount * B.netRentDayPerToken - A.amount * A.netRentDayPerToken
      case AssetSortType.RENT_START:
        return B.rentStartDate?.date.localeCompare(A.rentStartDate?.date)
      case AssetSortType.NAME:
        return A.shortName.localeCompare(b.shortName)
      case AssetSortType.SUPPLY:
        return B.totalInvestment - A.totalInvestment
      case AssetSortType.TOKEN:
        return B.amount - A.amount
      case AssetSortType.TOTAL_UNIT:
        return B.totalUnits - A.totalUnits
      case AssetSortType.RENTED_UNIT:
        return B.rentedUnits - A.rentedUnits
      case AssetSortType.OCCUPANCY:
        return B.rentedUnits / B.totalUnits - A.rentedUnits / A.totalUnits
      case AssetSortType.INITIAL_LAUNCH:
        return B.initialLaunchDate?.date.localeCompare(
          A.initialLaunchDate?.date,
        )
      case AssetSortType.UNIT_PRICE_COST:
        return (B.unitPriceCost ?? 0) - (A.unitPriceCost ?? 0)
      case AssetSortType.UNREALIZED_CAPITAL_GAIN:
        return (B.unrealizedCapitalGain ?? 0) - (A.unrealizedCapitalGain ?? 0)
      case AssetSortType.LAST_CHANGE:
        return B.lastChanges.localeCompare(A.lastChanges) ?? 0
    }
  }

  return { assetSortFunction }
}
