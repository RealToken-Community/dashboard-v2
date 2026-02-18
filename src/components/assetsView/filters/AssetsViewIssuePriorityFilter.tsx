import { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { Select } from '@mantine/core'

import { assetsViewDefaultFilter } from 'src/states'
import {
  OtherRealtoken,
  UserRealtoken,
} from 'src/store/features/wallets/walletsSelector'
import { RealTokenToBeRepairedPriority } from 'src/types/APIPitsBI'

import { useInputStyles } from '../../inputs/useInputStyles'
import { AssetIssuePriorityType } from '../types'

interface AssetsViewIssuePriorityFilterModel {
  issuePriority: AssetIssuePriorityType
}

interface AssetsViewIssuePriorityFilterProps {
  filter: AssetsViewIssuePriorityFilterModel
  onChange: (value: AssetsViewIssuePriorityFilterModel) => void
}
export const AssetsViewIssuePriorityFilter: FC<
  AssetsViewIssuePriorityFilterProps
> = ({ filter, onChange }) => {
  const { t } = useTranslation('common', { keyPrefix: 'assetIssuePriority' })
  const { classes: inputClasses } = useInputStyles()

  const viewOptions = [
    {
      value: AssetIssuePriorityType.ALL,
      label: t('options.all'),
    },
    {
      value: AssetIssuePriorityType.NONE,
      label: t('options.none'),
    },
    {
      value: AssetIssuePriorityType.HIGH,
      label: t('options.high'),
    },
    {
      value: AssetIssuePriorityType.MEDIUM,
      label: t('options.medium'),
    },
    {
      value: AssetIssuePriorityType.LOW,
      label: t('options.low'),
    },
  ]

  return (
    <Select
      label={t('label')}
      data={viewOptions}
      value={filter.issuePriority}
      onChange={(value) =>
        onChange({
          issuePriority:
            (value as AssetIssuePriorityType) ??
            assetsViewDefaultFilter.issuePriority,
        })
      }
      classNames={inputClasses}
    />
  )
}
AssetsViewIssuePriorityFilter.displayName = 'AssetsViewIssuePriorityFilter'

export function useAssetsViewIssuePriorityFilter(
  filter: AssetsViewIssuePriorityFilterModel,
) {
  function assetIssuePriorityFilterFunction(
    asset: UserRealtoken | OtherRealtoken,
  ) {
    const Asset = asset as UserRealtoken
    switch (filter.issuePriority) {
      case AssetIssuePriorityType.ALL:
        return true
      case AssetIssuePriorityType.NONE:
        return (
          Asset.extraData?.pitsBI?.actions?.priority ===
            RealTokenToBeRepairedPriority.None ||
          Asset.extraData?.pitsBI?.actions?.priority === undefined
        )
      case AssetIssuePriorityType.HIGH:
        return (
          Asset.extraData?.pitsBI?.actions?.priority ===
          RealTokenToBeRepairedPriority.High
        )
      case AssetIssuePriorityType.MEDIUM:
        return (
          Asset.extraData?.pitsBI?.actions?.priority ===
          RealTokenToBeRepairedPriority.Medium
        )
      case AssetIssuePriorityType.LOW:
        return (
          Asset.extraData?.pitsBI?.actions?.priority ===
          RealTokenToBeRepairedPriority.Low
        )
    }
  }

  return { assetIssuePriorityFilterFunction }
}
