import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

import { useCurrencyValue } from 'src/hooks/useCurrencyValue'
import { selectUserRentCalculation } from 'src/store/features/settings/settingsSelector'
import {
  UserRealtoken,
  calculateTokenRent,
} from 'src/store/features/wallets/walletsSelector'

import { AssetPageTable } from './assetPageTable'

export const AssetPageMainTab: FC<{ data: UserRealtoken }> = ({ data }) => {
  const { t } = useTranslation('common', { keyPrefix: 'assetPage.main' })
  const { t: tNumbers } = useTranslation('common', { keyPrefix: 'numbers' })
  const rentCalculation = useSelector(selectUserRentCalculation)
  const rent = calculateTokenRent(data, rentCalculation)
  const lowValue = '< ' + useCurrencyValue(0.01)
  const ownedValue = useCurrencyValue(data.value)
  const ownedEthereumValue = useCurrencyValue(data.balance.ethereum.value)
  const ownedGnosisValue = useCurrencyValue(data.balance.gnosis.value)
  const ownedRmmValue = useCurrencyValue(data.balance.rmm.value)
  const ownedLevinSwapValue = useCurrencyValue(data.balance.levinSwap.value)
  const annualYield = tNumbers('percent', { value: data.annualPercentageYield })
  const token = tNumbers('decimal', { value: data.amount })
  const totalToken = tNumbers('integer', { value: data.totalTokens })
  const tokenPrice = useCurrencyValue(data.tokenPrice)
  const rentWeek = useCurrencyValue(rent.weekly)
  const rentMonth = useCurrencyValue(rent.monthly)
  const rentYear = useCurrencyValue(rent.yearly)
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
          label: t('ownedEthereumValue'),
          value:
            data.balance.ethereum.value < 0.01 ? lowValue : ownedEthereumValue,
          isHidden: !data.balance.ethereum.value,
          isIndented: true,
        },
        {
          label: t('ownedGnosisValue'),
          value: data.balance.gnosis.value < 0.01 ? lowValue : ownedGnosisValue,
          isHidden: !data.balance.gnosis.value,
          isIndented: true,
        },
        {
          label: t('ownedRmmValue'),
          value: data.balance.rmm.value < 0.01 ? lowValue : ownedRmmValue,
          isHidden: !data.balance.rmm.value,
          isIndented: true,
        },
        {
          label: t('ownedLevinSwapValue'),
          value:
            data.balance.levinSwap.value < 0.01
              ? lowValue
              : ownedLevinSwapValue,
          isHidden: !data.balance.levinSwap.value,
          isIndented: true,
        },
        {
          label: t('annualYield'),
          value: annualYield,
        },
        {
          label: t('nbToken'),
          value: `${token} / ${totalToken}`,
        },
        {
          label: t('tokenPrice'),
          value: tokenPrice,
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
          label: t('rentedUnits'),
          value: `${rentedUnits} / ${totalUnits} (${occupancy})`,
        },
      ]}
    />
  )
}

AssetPageMainTab.displayName = 'AssetPageMainTab'
