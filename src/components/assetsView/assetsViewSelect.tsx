import { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { Select } from '@mantine/core'

import { useAtom } from 'jotai'

import { assetViewChoosedAtom } from 'src/states'

import { useInputStyles } from '../inputs/useInputStyles'
import { AssetViewType } from './types'

export const AssetsViewSelect: FC = () => {
  const { t } = useTranslation('common', { keyPrefix: 'assetView' })
  const { classes: inputClasses } = useInputStyles()

  const [choosenAssetView, setChoosenAssetView] = useAtom(assetViewChoosedAtom)

  const viewOptions = [
    {
      value: AssetViewType.TABLE,
      label: t('viewOptions.table'),
    },
    {
      value: AssetViewType.GRID,
      label: t('viewOptions.grid'),
    },
  ]

  return (
    <Select
      label={t('view')}
      data={viewOptions}
      value={choosenAssetView}
      onChange={(value) => value && setChoosenAssetView(value as AssetViewType)}
      classNames={inputClasses}
    />
  )
}
AssetsViewSelect.displayName = 'AssetsViewSelect'

export function useAssetsViewSelect() {
  const [choosenAssetView] = useAtom(assetViewChoosedAtom)

  return {
    choosenAssetView,
  }
}
