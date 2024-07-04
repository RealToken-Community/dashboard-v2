import { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { useCurrencyValue } from 'src/hooks/useCurrencyValue'
import { UserRealtoken } from 'src/store/features/wallets/walletsSelector'
import { RealTokenRentalType } from 'src/types/RealToken'

import { Divider } from '../commons'
import { AssetPageTable } from './assetPageTable'

export const AssetPagePropertyTab: FC<{
  realtoken: UserRealtoken
}> = ({ realtoken }) => {
  const { t } = useTranslation('common', { keyPrefix: 'assetPage.property' })
  const { t: tNumbers } = useTranslation('common', { keyPrefix: 'numbers' })

  const totalValue = useCurrencyValue(realtoken.totalInvestment)
  const assetPrice = useCurrencyValue(realtoken.underlyingAssetPrice)
  const rentalType = {
    [RealTokenRentalType.ShortTerm]: t('rentalTypeValue.shortTerm'),
    [RealTokenRentalType.LongTerm]: t('rentalTypeValue.longTerm'),
  }
  const subsidyBy = realtoken.subsidyBy
  const subsidyShare = tNumbers('percent', {
    value: (realtoken.subsidyStatusValue / realtoken.grossRentMonth) * 100,
  })
  const grossRentMonth = useCurrencyValue(realtoken.grossRentMonth)
  const netRentMonth = useCurrencyValue(realtoken.netRentMonth)
  const initialMaintenanceReserve = useCurrencyValue(
    realtoken.initialMaintenanceReserve ?? 0,
  )
  const annualYield = tNumbers('percent', {
    value: realtoken.annualPercentageYield,
  })

  const initialLaunchDate = new Date(realtoken.initialLaunchDate?.date ?? '')
  const rentStartDate = new Date(realtoken.rentStartDate.date)

  const constructionYear = realtoken.constructionYear.toString()
  const lotSize = tNumbers('integer', { value: realtoken.lotSize })
  const interiorSize = tNumbers('integer', { value: realtoken.squareFeet })
  const rentedUnits = tNumbers('integer', { value: realtoken.rentedUnits })
  const totalUnits = tNumbers('integer', { value: realtoken.totalUnits })
  const propertyStories = realtoken.propertyStories
    ? tNumbers('integer', { value: realtoken.propertyStories })
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
            value: rentalType[realtoken.rentalType],
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
