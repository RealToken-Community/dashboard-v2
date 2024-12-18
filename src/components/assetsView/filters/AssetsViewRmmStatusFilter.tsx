import { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { Select } from '@mantine/core'

import { assetsViewDefaultFilter } from 'src/states'
import {
  OtherRealtoken,
  UserRealtoken,
} from 'src/store/features/wallets/walletsSelector'

import { useInputStyles } from '../../inputs/useInputStyles'
import { AssetRmmStatusType } from '../types'

interface AssetsViewRmmStatusFilterModel {
  rmmStatus: AssetRmmStatusType
}

interface AssetsViewRmmStatusFilterProps {
  filter: AssetsViewRmmStatusFilterModel
  onChange: (value: AssetsViewRmmStatusFilterModel) => void
}
export const AssetsViewRmmStatusFilter: FC<AssetsViewRmmStatusFilterProps> = ({
  filter,
  onChange,
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'assetRmmStatus' })
  const { classes: inputClasses } = useInputStyles()

  const viewOptions = [
    {
      value: AssetRmmStatusType.ALL,
      label: t('options.all'),
    },
    {
      value: AssetRmmStatusType.AVAILABLE,
      label: t('options.available'),
    },
    {
      value: AssetRmmStatusType.NOT_AVAILABLE,
      label: t('options.notAvailable'),
    },
  ]

  return (
    <Select
      label={t('label')}
      data={viewOptions}
      value={filter.rmmStatus}
      onChange={(value) =>
        onChange({
          rmmStatus:
            (value as AssetRmmStatusType) ?? assetsViewDefaultFilter.rmmStatus,
        })
      }
      classNames={inputClasses}
    />
  )
}
AssetsViewRmmStatusFilter.displayName = 'AssetsViewRmmStatusFilter'

export function useAssetsViewRmmStatusFilter(
  filter: AssetsViewRmmStatusFilterModel,
) {
  function assetRmmStatusFilterFunction(asset: UserRealtoken | OtherRealtoken) {
    const Asset = asset as UserRealtoken
    switch (filter.rmmStatus) {
      case AssetRmmStatusType.ALL:
        return true
      case AssetRmmStatusType.AVAILABLE:
        return Asset.isRmmAvailable
      case AssetRmmStatusType.NOT_AVAILABLE:
        return !Asset.isRmmAvailable
    }
  }

  return { assetRmmStatusFilterFunction }
}
