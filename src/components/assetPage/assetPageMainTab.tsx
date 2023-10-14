import { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { useCurrencyValue } from 'src/hooks/useCurrencyValue'
import { OwnedRealtoken } from 'src/store/features/wallets/walletsSelector'

import { AssetPageTable } from './assetPageTable'

export const AssetPageMainTab: FC<{ data: OwnedRealtoken }> = ({ data }) => {
  const { t } = useTranslation('common', { keyPrefix: 'assetPage.main' })
  const { t: tNumbers } = useTranslation('common', { keyPrefix: 'numbers' })

  const ownedValue = useCurrencyValue(data.value)
  const annualYield = tNumbers('percent', { value: data.annualPercentageYield })
  const rentWeek = useCurrencyValue(data.amount * data.netRentDayPerToken * 7)
  const rentMonth = useCurrencyValue(data.amount * data.netRentMonthPerToken)
  const rentYear = useCurrencyValue(data.amount * data.netRentYearPerToken)
  const token = tNumbers('decimal', { value: data.amount })
  const totalToken = tNumbers('integer', { value: data.totalTokens })
  const rentedUnits = tNumbers('integer', { value: data.rentedUnits })
  const totalUnits = tNumbers('integer', { value: data.totalUnits })
  const occupancy = tNumbers('percentInteger', {
    value: (data.rentedUnits / data.totalUnits) * 100,
  })

  return (
    <AssetPageTable
      data={[
        {
          label: t('ownedValue'),
          value: ownedValue,
        },
        {
          label: t('annualYield'),
          value: annualYield,
        },
        {
          label: t('rentWeek'),
          value: rentWeek,
        },
        {
          label: t('rentMonth'),
          value: rentMonth,
        },
        {
          label: t('rentYear'),
          value: rentYear,
        },
        {
          label: t('nbToken'),
          value: `${token} / ${totalToken}`,
        },
        {
          label: t('rentedUnits'),
          value: `${rentedUnits} / ${totalUnits} (${occupancy})`,
        },
      ]}
    />
  )
}

AssetPageMainTab.displayName = 'AssetPageMainTab'
