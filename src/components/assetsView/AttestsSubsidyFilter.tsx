import { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { Select } from '@mantine/core'

import { useAtom } from 'jotai'

import { assetSubsidyChoosedAtom } from 'src/states'

import { useInputStyles } from '../inputs/useInputStyles'
import { AssetSubsidyType } from './types'
import { Realtoken } from 'src/store/features/realtokens/realtokensSelector'

export const AttestsSubsidyFilter: FC = () => {
  const { t } = useTranslation('common', { keyPrefix: 'assetSubsidy' })
  const { classes: inputClasses } = useInputStyles()

  const [choosenSubsidyType, setChoosenSubsidyType] = useAtom(assetSubsidyChoosedAtom)

  const viewOptions = [
    {
      value: AssetSubsidyType.ALL,
      label: t('options.all')
    },
    {
      value: AssetSubsidyType.FULLY_SUBSIDIZED,
      label: t('options.fullySubsidized')
    },
    {
      value: AssetSubsidyType.SUBSIDIZED,
      label: t('options.subsidized')
    },
    {
      value: AssetSubsidyType.NOT_SUBSIDIZED,
      label: t('options.notSubsidized')
    },
  ]

  return (
    <Select
      label={t('label')}
      data={viewOptions}
      value={choosenSubsidyType}
      onChange={(value: AssetSubsidyType) => value && setChoosenSubsidyType(value)}
      classNames={inputClasses}
    />
  )
}
AttestsSubsidyFilter.displayName = 'AssetsSubsidyFilter'

export function useAttestsSubsidyFilter() {
  const [choosenSubsidyType] = useAtom(assetSubsidyChoosedAtom)

  return (asset: Realtoken) => {
    switch (choosenSubsidyType) {
      case AssetSubsidyType.FULLY_SUBSIDIZED:
        return asset.subsidyStatus === 'yes'
      case AssetSubsidyType.SUBSIDIZED:
        return asset.subsidyStatus === 'partial' || asset.subsidyStatus === 'yes'
      case AssetSubsidyType.NOT_SUBSIDIZED:
        return !asset.subsidyStatus || asset.subsidyStatus === 'no'
      default:
        return true
    }
  }
}
