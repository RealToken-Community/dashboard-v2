import { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { Select } from '@mantine/core'

import { assetsViewDefaultFilter } from 'src/states'
import {
  OtherRealtoken,
  UserRealtoken,
} from 'src/store/features/wallets/walletsSelector'

import { useInputStyles } from '../../inputs/useInputStyles'
import { AssetUserProtocolType } from '../types'

interface AssetsViewUserProtocolFilterModel {
  userProtocol: AssetUserProtocolType
}

interface AssetsViewUserProtocolFilterProps {
  filter: AssetsViewUserProtocolFilterModel
  onChange: (value: AssetsViewUserProtocolFilterModel) => void
}
export const AssetsViewUserProtocolFilter: FC<
  AssetsViewUserProtocolFilterProps
> = ({ filter, onChange }) => {
  const { t } = useTranslation('common', { keyPrefix: 'assetUserProtocol' })
  const { classes: inputClasses } = useInputStyles()

  const viewOptions = [
    {
      value: AssetUserProtocolType.ALL,
      label: t('options.all'),
    },
    {
      value: AssetUserProtocolType.ETHEREUM,
      label: t('options.ethereum'),
    },
    {
      value: AssetUserProtocolType.GNOSIS,
      label: t('options.gnosis'),
    },
    {
      value: AssetUserProtocolType.RMM,
      label: t('options.rmm'),
    },
    {
      value: AssetUserProtocolType.LEVINSWAP,
      label: t('options.levinSwap'),
    },
  ]

  return (
    <Select
      label={t('label')}
      data={viewOptions}
      value={filter.userProtocol}
      onChange={(value) =>
        onChange({
          userProtocol:
            (value as AssetUserProtocolType) ??
            assetsViewDefaultFilter.userProtocol,
        })
      }
      classNames={inputClasses}
    />
  )
}
AssetsViewUserProtocolFilter.displayName = 'AssetsViewUserProtocolFilter'

export function useAssetsViewUserProtocolFilter(
  filter: AssetsViewUserProtocolFilterModel,
) {
  function assetUserProtocolFilterFunction(
    asset: UserRealtoken | OtherRealtoken,
  ) {
    const Asset = asset as UserRealtoken
    switch (filter.userProtocol) {
      case AssetUserProtocolType.ALL:
        return true
      case AssetUserProtocolType.ETHEREUM:
        return Asset.balance?.ethereum?.amount > 0
      case AssetUserProtocolType.GNOSIS:
        return Asset.balance?.gnosis?.amount > 0
      case AssetUserProtocolType.RMM:
        return Asset.balance?.rmm?.amount > 0
      case AssetUserProtocolType.LEVINSWAP:
        return Asset.balance?.levinSwap?.amount > 0
    }
  }

  return { assetUserProtocolFilterFunction }
}
