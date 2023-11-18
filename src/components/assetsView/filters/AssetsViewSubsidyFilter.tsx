import { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { Select } from '@mantine/core'

import { UserRealtoken } from 'src/store/features/wallets/walletsSelector'

import { useInputStyles } from '../../inputs/useInputStyles'
import { AssetSubsidyType } from '../types'

interface AssetsViewSubsidyFilterModel {
  subsidy: AssetSubsidyType
}

interface AssetsViewSubsidyFilterProps {
  filter: AssetsViewSubsidyFilterModel
  onChange: (value: AssetsViewSubsidyFilterModel) => void
}
export const AssetsViewSubsidyFilter: FC<AssetsViewSubsidyFilterProps> = ({
  filter,
  onChange,
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'assetSubsidy' })
  const { classes: inputClasses } = useInputStyles()

  const viewOptions = [
    {
      value: AssetSubsidyType.ALL,
      label: t('options.all'),
    },
    {
      value: AssetSubsidyType.FULLY_SUBSIDIZED,
      label: t('options.fullySubsidized'),
    },
    {
      value: AssetSubsidyType.SUBSIDIZED,
      label: t('options.subsidized'),
    },
    {
      value: AssetSubsidyType.NOT_SUBSIDIZED,
      label: t('options.notSubsidized'),
    },
  ]

  return (
    <Select
      label={t('label')}
      data={viewOptions}
      value={filter.subsidy}
      onChange={(value: AssetSubsidyType) => onChange({ subsidy: value })}
      classNames={inputClasses}
    />
  )
}
AssetsViewSubsidyFilter.displayName = 'AssetsViewSubsidyFilter'

export function useAssetsViewSubsidyFilter(
  filter: AssetsViewSubsidyFilterModel
) {
  function assetSubsidyFilterFunction(asset: UserRealtoken) {
    switch (filter.subsidy) {
      case AssetSubsidyType.ALL:
        return true
      case AssetSubsidyType.FULLY_SUBSIDIZED:
        return asset.subsidyStatus === 'yes' && !!asset.subsidyStatusValue
      case AssetSubsidyType.SUBSIDIZED:
        return asset.subsidyStatus !== 'no' && !!asset.subsidyStatusValue
      case AssetSubsidyType.NOT_SUBSIDIZED:
        return !asset.subsidyStatus || asset.subsidyStatus === 'no'
    }
  }

  return { assetSubsidyFilterFunction }
}
