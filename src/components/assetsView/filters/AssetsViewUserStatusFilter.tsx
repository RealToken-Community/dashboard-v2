import { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { Select } from '@mantine/core'

import { UserRealtoken } from 'src/store/features/wallets/walletsSelector'

import { useInputStyles } from '../../inputs/useInputStyles'
import { AssetUserStatusType } from '../types'

interface AssetsViewUserStatusFilterModel {
  userStatus: AssetUserStatusType
}

interface AssetsViewUserStatusFilterProps {
  filter: AssetsViewUserStatusFilterModel
  onChange: (value: AssetsViewUserStatusFilterModel) => void
}
export const AssetsViewUserStatusFilter: FC<
  AssetsViewUserStatusFilterProps
> = ({ filter, onChange }) => {
  const { t } = useTranslation('common', { keyPrefix: 'assetUserStatus' })
  const { classes: inputClasses } = useInputStyles()

  const viewOptions = [
    {
      value: AssetUserStatusType.ALL,
      label: t('options.all'),
    },
    {
      value: AssetUserStatusType.OWNED,
      label: t('options.owned'),
    },
    {
      value: AssetUserStatusType.WHITELISTED,
      label: t('options.whitelisted'),
    },
    {
      value: AssetUserStatusType.WHITELISTED_NOT_OWNED,
      label: t('options.whitelistedNotOwned'),
    },
    {
      value: AssetUserStatusType.NOT_OWNED,
      label: t('options.notOwned'),
    },
    {
      value: AssetUserStatusType.NOT_WHITELISTED,
      label: t('options.notWhitelisted'),
    },
  ]

  return (
    <Select
      label={t('label')}
      data={viewOptions}
      value={filter.userStatus}
      onChange={(value) =>
        onChange({ userStatus: value as AssetUserStatusType })
      }
      classNames={inputClasses}
    />
  )
}
AssetsViewUserStatusFilter.displayName = 'AssetsViewUserStatusFilter'

export function useAssetsViewUserStatusFilter(
  filter: AssetsViewUserStatusFilterModel,
) {
  function assetUserStatusFilterFunction(asset: UserRealtoken) {
    switch (filter.userStatus) {
      case AssetUserStatusType.ALL:
        return true
      case AssetUserStatusType.OWNED:
        return asset.amount > 0
      case AssetUserStatusType.WHITELISTED:
        return asset.isWhitelisted
      case AssetUserStatusType.WHITELISTED_NOT_OWNED:
        return asset.isWhitelisted && asset.amount === 0
      case AssetUserStatusType.NOT_OWNED:
        return asset.amount === 0
      case AssetUserStatusType.NOT_WHITELISTED:
        return !asset.isWhitelisted
    }
  }

  return { assetUserStatusFilterFunction }
}
