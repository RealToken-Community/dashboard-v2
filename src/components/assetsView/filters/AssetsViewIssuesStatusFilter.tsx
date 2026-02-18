import { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { Select } from '@mantine/core'

import { assetsViewDefaultFilter } from 'src/states'
import {
  OtherRealtoken,
  UserRealtoken,
} from 'src/store/features/wallets/walletsSelector'
import { RealTokenToBeFixedStatus } from 'src/types/APIPitsBI'

import { useInputStyles } from '../../inputs/useInputStyles'
import { AssetIssueStatusType } from '../types'

interface AssetsViewIssueStatusFilterModel {
  issueStatus: AssetIssueStatusType
}

interface AssetsViewIssueStatusFilterProps {
  filter: AssetsViewIssueStatusFilterModel
  onChange: (value: AssetsViewIssueStatusFilterModel) => void
}
export const AssetsViewIssueStatusFilter: FC<
  AssetsViewIssueStatusFilterProps
> = ({ filter, onChange }) => {
  const { t } = useTranslation('common', { keyPrefix: 'assetIssueStatus' })
  const { classes: inputClasses } = useInputStyles()

  const viewOptions = [
    {
      value: AssetIssueStatusType.ALL,
      label: t('options.all'),
    },
    {
      value: AssetIssueStatusType.NOEXHIBIT,
      label: t('options.noExhibit'),
    },
    {
      value: AssetIssueStatusType.UPGRADEDANDREADY,
      label: t('options.upgradedAndReady'),
    },
    {
      value: AssetIssueStatusType.SCHEDULED,
      label: t('options.scheduled'),
    },
  ]

  return (
    <Select
      label={t('label')}
      data={viewOptions}
      value={filter.issueStatus}
      onChange={(value) =>
        onChange({
          issueStatus:
            (value as AssetIssueStatusType) ??
            assetsViewDefaultFilter.issueStatus,
        })
      }
      classNames={inputClasses}
    />
  )
}
AssetsViewIssueStatusFilter.displayName = 'AssetsViewIssueStatusFilter'

export function useAssetsViewIssueStatusFilter(
  filter: AssetsViewIssueStatusFilterModel,
) {
  function assetIssueStatusFilterFunction(
    asset: UserRealtoken | OtherRealtoken,
  ) {
    const Asset = asset as UserRealtoken
    switch (filter.issueStatus) {
      case AssetIssueStatusType.ALL:
        return true
      case AssetIssueStatusType.NOEXHIBIT:
        return (
          Asset.extraData?.pitsBI?.actions?.realt_status === undefined ||
          Asset.extraData?.pitsBI?.actions?.realt_status ===
            RealTokenToBeFixedStatus.NoExhibit
        )
      case AssetIssueStatusType.UPGRADEDANDREADY:
        return (
          Asset.extraData?.pitsBI?.actions?.realt_status ===
          RealTokenToBeFixedStatus.UpgradedAndReady
        )
      case AssetIssueStatusType.SCHEDULED:
        return (
          Asset.extraData?.pitsBI?.actions?.realt_status ===
          RealTokenToBeFixedStatus.Scheduled
        )
    }
  }

  return { assetIssueStatusFilterFunction }
}
