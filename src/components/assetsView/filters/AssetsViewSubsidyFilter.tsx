import { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { Select } from '@mantine/core'

import { assetsViewDefaultFilter } from 'src/states'
import {
  OtherRealtoken,
  UserRealtoken,
} from 'src/store/features/wallets/walletsSelector'

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
      value: AssetSubsidyType.SUBSIDIZED,
      label: t('options.subsidized'),
    },
    {
      value: AssetSubsidyType.FULLY_SUBSIDIZED,
      label: t('options.fullySubsidized'),
    },
    {
      value: AssetSubsidyType.PARTIALLY_SUBSIDIZED,
      label: t('options.partiallySubsidized'),
    },
    {
      value: AssetSubsidyType.SECTION_8,
      label: t('options.section8'),
    },
    {
      value: AssetSubsidyType.SECTION_42,
      label: t('options.section42'),
    },
    {
      value: AssetSubsidyType.OTHER_SUBSIDY,
      label: t('options.otherSubsidy'),
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
      onChange={(value) =>
        onChange({
          subsidy:
            (value as AssetSubsidyType) ?? assetsViewDefaultFilter.subsidy,
        })
      }
      classNames={inputClasses}
    />
  )
}
AssetsViewSubsidyFilter.displayName = 'AssetsViewSubsidyFilter'

export function useAssetsViewSubsidyFilter(
  filter: AssetsViewSubsidyFilterModel,
) {
  function assetSubsidyFilterFunction(asset: UserRealtoken | OtherRealtoken) {
    const Asset = asset as UserRealtoken
    switch (filter.subsidy) {
      case AssetSubsidyType.ALL:
        return true
      case AssetSubsidyType.SUBSIDIZED:
        return Asset.subsidyStatus && Asset.subsidyStatus !== 'no'
      case AssetSubsidyType.FULLY_SUBSIDIZED:
        return (
          Asset.subsidyStatus &&
          Asset.subsidyStatus === 'yes' &&
          !!Asset.subsidyStatusValue
        )
      case AssetSubsidyType.PARTIALLY_SUBSIDIZED:
        return (
          Asset.subsidyStatus &&
          Asset.subsidyStatus !== 'no' &&
          !!Asset.subsidyStatusValue
        )
      case AssetSubsidyType.SECTION_8:
        return (
          Asset.subsidyStatus &&
          Asset.subsidyStatus !== 'no' &&
          Asset.subsidyBy === 'Section 8'
        )
      case AssetSubsidyType.SECTION_42:
        return (
          Asset.subsidyStatus &&
          Asset.subsidyStatus !== 'no' &&
          Asset.subsidyBy === 'Section 42'
        )
      case AssetSubsidyType.OTHER_SUBSIDY:
        return (
          Asset.subsidyStatus &&
          Asset.subsidyStatus !== 'no' &&
          !['Section 8', 'Section 42'].includes(Asset.subsidyBy ?? '')
        )
      case AssetSubsidyType.NOT_SUBSIDIZED:
        return !Asset.subsidyStatus || Asset.subsidyStatus === 'no'
    }
  }

  return { assetSubsidyFilterFunction }
}
