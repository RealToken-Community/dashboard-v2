import { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { useCurrencyValue } from 'src/hooks/useCurrencyValue'
import { UserRealtoken } from 'src/store/features/wallets/walletsSelector'
import { APIRealTokenRentalType } from 'src/types/APIRealToken'

import { Divider } from '../commons'
import { AssetPageTable } from './assetPageTable'

export const AssetPagePropertyTab: FC<{ data: UserRealtoken }> = ({ data }) => {
  const { t } = useTranslation('common', { keyPrefix: 'assetPage.property' })
  const { t: tNumbers } = useTranslation('common', { keyPrefix: 'numbers' })

  const totalValue = useCurrencyValue(data.totalInvestment)
  const assetPrice = useCurrencyValue(data.underlyingAssetPrice)
  const rentalType = {
    [APIRealTokenRentalType.ShortTerm]: t('rentalTypeValue.shortTerm'),
    [APIRealTokenRentalType.LongTerm]: t('rentalTypeValue.longTerm'),
  }
  const subsidyBy = data.subsidyBy
  const subsidyShare = tNumbers('percent', {
    value: (data.subsidyStatusValue / data.grossRentMonth) * 100,
  })
  const grossRentMonth = useCurrencyValue(data.grossRentMonth)
  const netRentMonth = useCurrencyValue(data.netRentMonth)
  const initialMaintenanceReserve = useCurrencyValue(
    data.initialMaintenanceReserve ?? 0
  )
  const annualYield = tNumbers('percent', { value: data.annualPercentageYield })

  const initialLaunchDate = new Date(data.initialLaunchDate?.date ?? '')
  const rentStartDate = new Date(data.rentStartDate.date)

  const constructionYear = data.constructionYear.toString()
  const lotSize = tNumbers('integer', { value: data.lotSize })
  const interiorSize = tNumbers('integer', { value: data.squareFeet })
  const rentedUnits = tNumbers('integer', { value: data.rentedUnits })
  const totalUnits = tNumbers('integer', { value: data.totalUnits })
  const propertyStories = data.propertyStories
    ? tNumbers('integer', { value: data.propertyStories })
    : '-'

  return (
    <>
      <AssetPageTable
        data={[
          {
            label: t('initialLaunchDate'),
            value: initialLaunchDate.toLocaleDateString(),
          },
          {
            label: t('totalValue'),
            value: totalValue,
          },
          {
            label: t('assetPrice'),
            value: assetPrice,
          },
          {
            label: t('initialMaintenanceReserve'),
            value: initialMaintenanceReserve,
          },
        ]}
      />

      <Divider height={1} my={'xs'} />

      <AssetPageTable
        data={[
          {
            label: t('rentalType'),
            value: rentalType[data.rentalType],
          },
          {
            label: t('subsidyBy'),
            value: subsidyBy ?? '',
            isHidden: (subsidyBy ?? 'no') === 'no',
          },
          {
            label: t('rentStartDate'),
            value: rentStartDate.toLocaleDateString(),
          },
          {
            label: t('rentedUnits'),
            value: `${rentedUnits} / ${totalUnits}`,
          },
          {
            label: t('subsidyShare'),
            value: subsidyShare,
            isHidden: (subsidyBy ?? 'no') === 'no',
          },
          {
            label: t('grossRentMonth'),
            value: grossRentMonth,
          },
          {
            label: t('netRentMonth'),
            value: netRentMonth,
          },
          {
            label: t('annualYield'),
            value: annualYield,
          },
        ]}
      />

      <Divider height={1} my={'xs'} />

      <AssetPageTable
        data={[
          {
            label: t('constructionYear'),
            value: constructionYear,
          },
          {
            label: t('propertyStories'),
            value: propertyStories,
          },
          {
            label: t('propertyUnits'),
            value: totalUnits,
          },
          {
            label: t('lotSize'),
            value: `${lotSize} sqft`,
          },
          {
            label: t('interiorSize'),
            value: `${interiorSize} sqft`,
          },
        ]}
      />
    </>
  )
}

AssetPagePropertyTab.displayName = 'AssetPagePropertyTab'
