import { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { Select } from '@mantine/core'

import { assetsViewDefaultFilter } from 'src/states'
import {
  OtherRealtoken,
  UserRealtoken,
} from 'src/store/features/wallets/walletsSelector'
import { APIRealTokenProductType } from 'src/types/APIRealToken'

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
      value: AssetProductType.REAL_ESTATE_RENTAL,
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
    {
      value: AssetProductType.FACTORING,
      label: t('options.factoring'),
    },
  ]

  return (
    <Select
      label={t('label')}
      data={viewOptions}
      value={filter.productType}
      onChange={(value) =>
        onChange({
          productType:
            (value as AssetProductType) ?? assetsViewDefaultFilter.productType,
        })
      }
      classNames={inputClasses}
    />
  )
}
AssetsViewProductTypeFilter.displayName = 'AssetsViewProductTypeFilter'

export function useAssetsViewProductTypeFilter(filter: AssetsViewFilterType) {
  function assetProductTypeFilterFunction(
    asset: UserRealtoken | OtherRealtoken,
  ) {
    switch (filter.productType) {
      case AssetProductType.ALL:
        return true
      case AssetProductType.REAL_ESTATE_RENTAL:
        return asset.productType === APIRealTokenProductType.RealEstateRental
      case AssetProductType.LOAN_INCOME:
        return asset.productType === APIRealTokenProductType.LoanIncome
      case AssetProductType.EQUITY_TOKEN:
        return asset.productType === APIRealTokenProductType.EquityToken
      case AssetProductType.FACTORING:
        return asset.productType === APIRealTokenProductType.Factoring
    }
  }

  return { assetProductTypeFilterFunction }
}
