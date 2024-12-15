import { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { Select } from '@mantine/core'

import {
  RWARealtoken,
  UserRealtoken,
} from 'src/store/features/wallets/walletsSelector'

import { useInputStyles } from '../../inputs/useInputStyles'
import { AssetProductType } from '../types'

interface AssetsViewFilterType {
  productType: AssetProductType
}

interface AssetsViewProductTypeFilterProps {
  filter: AssetsViewFilterType
  onChange: (value: AssetsViewFilterType) => void
}
export const AssetsViewProductTypeFilter: FC<
  AssetsViewProductTypeFilterProps
> = ({ filter, onChange }) => {
  const { t } = useTranslation('common', { keyPrefix: 'assetProductType' })
  const { classes: inputClasses } = useInputStyles()

  const viewOptions = [
    {
      value: AssetProductType.ALL,
      label: t('options.all'),
    },
    {
      value: AssetProductType.REAL_EASTATE_RENTAL,
      label: t('options.realEstateRental'),
    },
    {
      value: AssetProductType.LOAN_INCOME,
      label: t('options.loanIncome'),
    },
    {
      value: AssetProductType.EQUITY_TOKEN,
      label: t('options.equityToken'),
    },
  ]

  return (
    <Select
      label={t('label')}
      data={viewOptions}
      value={filter.productType}
      onChange={(value) => onChange({ productType: value as AssetProductType })}
      classNames={inputClasses}
    />
  )
}
AssetsViewProductTypeFilter.displayName = 'AssetsViewProductTypeFilter'

export function useAssetsViewProductTypeFilter(filter: AssetsViewFilterType) {
  function assetProductTypeFilterFunction(asset: UserRealtoken | RWARealtoken) {
    const Asset = asset as UserRealtoken
    switch (filter.productType) {
      case AssetProductType.ALL:
        return true
      case AssetProductType.REAL_EASTATE_RENTAL:
        return (
          String(Asset.productType) === AssetProductType.REAL_EASTATE_RENTAL
        )
      case AssetProductType.LOAN_INCOME:
        return String(Asset.productType) === AssetProductType.LOAN_INCOME
      case AssetProductType.EQUITY_TOKEN:
        return String(Asset.productType) === AssetProductType.EQUITY_TOKEN
    }
  }

  return { assetProductTypeFilterFunction }
}
