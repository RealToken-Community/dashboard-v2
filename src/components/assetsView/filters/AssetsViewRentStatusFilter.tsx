import { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { Select } from '@mantine/core'

import { assetsViewDefaultFilter } from 'src/states'
import {
  OtherRealtoken,
  UserRealtoken,
} from 'src/store/features/wallets/walletsSelector'

import { useInputStyles } from '../../inputs/useInputStyles'
import { AssetRentStatusType } from '../types'

interface AssetsViewRentStatusFilterModel {
  rentStatus: AssetRentStatusType
}

interface AssetsViewRentStatusFilterProps {
  filter: AssetsViewRentStatusFilterModel
  onChange: (value: AssetsViewRentStatusFilterModel) => void
}
export const AssetsViewRentStatusFilter: FC<
  AssetsViewRentStatusFilterProps
> = ({ filter, onChange }) => {
  const { t } = useTranslation('common', { keyPrefix: 'assetRentStatus' })
  const { classes: inputClasses } = useInputStyles()

  const viewOptions = [
    {
      value: AssetRentStatusType.ALL,
      label: t('options.all'),
    },
    {
      value: AssetRentStatusType.RENTED,
      label: t('options.rented'),
    },
    {
      value: AssetRentStatusType.PARTIALLY_RENTED,
      label: t('options.partiallyRented'),
    },
    {
      value: AssetRentStatusType.NOT_RENTED,
      label: t('options.notRented'),
    },
  ]

  return (
    <Select
      label={t('label')}
      data={viewOptions}
      value={filter.rentStatus}
      onChange={(value) =>
        onChange({
          rentStatus:
            (value as AssetRentStatusType) ??
            assetsViewDefaultFilter.rentStatus,
        })
      }
      classNames={inputClasses}
    />
  )
}
AssetsViewRentStatusFilter.displayName = 'AssetsViewRentStatusFilter'

export function useAssetsViewRentStatusFilter(
  filter: AssetsViewRentStatusFilterModel,
) {
  function assetRentStatusFilterFunction(
    asset: UserRealtoken | OtherRealtoken,
  ) {
    const Asset = asset as UserRealtoken
    switch (filter.rentStatus) {
      case AssetRentStatusType.ALL:
        return true
      case AssetRentStatusType.RENTED:
        return Asset.rentStatus === 'full'
      case AssetRentStatusType.PARTIALLY_RENTED:
        return Asset.rentStatus === 'partial'
      case AssetRentStatusType.NOT_RENTED:
        return Asset.rentStatus === 'none'
    }
  }

  return { assetRentStatusFilterFunction }
}
