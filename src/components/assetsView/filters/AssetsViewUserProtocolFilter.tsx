import { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { Select } from '@mantine/core'

import { UserRealtoken } from 'src/store/features/wallets/walletsSelector'

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
        onChange({ userProtocol: value as AssetUserProtocolType })
      }
      classNames={inputClasses}
    />
  )
}
AssetsViewUserProtocolFilter.displayName = 'AssetsViewUserProtocolFilter'

export function useAssetsViewUserProtocolFilter(
  filter: AssetsViewUserProtocolFilterModel,
) {
  function assetUserProtocolFilterFunction(asset: UserRealtoken) {
    switch (filter.userProtocol) {
      case AssetUserProtocolType.ALL:
        return true
      case AssetUserProtocolType.ETHEREUM:
        return asset.balance.ethereum.amount > 0
      case AssetUserProtocolType.GNOSIS:
        return asset.balance.gnosis.amount > 0
      case AssetUserProtocolType.RMM:
        return asset.balance.rmm.amount > 0
      case AssetUserProtocolType.LEVINSWAP:
        return asset.balance.levinSwap.amount > 0
    }
  }

  return { assetUserProtocolFilterFunction }
}
