import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

import { useCurrencyValue } from 'src/hooks/useCurrencyValue'
import { selectUserRentCalculation } from 'src/store/features/settings/settingsSelector'
import { selectTransfersIsLoaded } from 'src/store/features/transfers/transfersSelector'
import {
  UserRealtoken,
  calculateTokenRent,
} from 'src/store/features/wallets/walletsSelector'

import { Divider } from '../commons'
import { AssetPageTable } from './assetPageTable'

export const AssetPageMainTab: FC<{
  realtoken: UserRealtoken
}> = ({ realtoken }) => {
  const { t } = useTranslation('common', { keyPrefix: 'assetPage.main' })
  const { t: tNumbers } = useTranslation('common', { keyPrefix: 'numbers' })
  const rentCalculation = useSelector(selectUserRentCalculation)
  const transfersIsLoaded = useSelector(selectTransfersIsLoaded)
  const rent = calculateTokenRent(realtoken, {
    state: rentCalculation.state,
    date: new Date().getTime(),
  })
  const lowValue = '< ' + useCurrencyValue(0.01)
  const ownedValue = useCurrencyValue(realtoken.value)
  const ownedEthereumValue = useCurrencyValue(realtoken.balance.ethereum.value)
  const ownedGnosisValue = useCurrencyValue(realtoken.balance.gnosis.value)
  const ownedRmmValue = useCurrencyValue(realtoken.balance.rmm.value)
  const ownedLevinSwapValue = useCurrencyValue(
    realtoken.balance.levinSwap.value,
  )
  const annualYield = tNumbers('percent', {
    value: realtoken.annualPercentageYield,
  })
  const token = tNumbers('decimal', { value: realtoken.amount })
  const totalToken = tNumbers('integer', { value: realtoken.totalTokens })
  const tokenPrice = useCurrencyValue(realtoken.tokenPrice)
  const rentWeek = useCurrencyValue(rent.weekly)
  const rentMonth = useCurrencyValue(rent.monthly)
  const rentYear = useCurrencyValue(rent.yearly)
  const rentedUnits = tNumbers('integer', { value: realtoken.rentedUnits })
  const totalUnits = tNumbers('integer', { value: realtoken.totalUnits })
  const occupancy = tNumbers('percentInteger', {
    value: (realtoken.rentedUnits / realtoken.totalUnits) * 100,
  })

  return (
    <>
      <AssetPageTable
        data={[
          {
            label: t('ownedValue'),
            value: ownedValue,
          },
          {
            label: t('ownedEthereumValue'),
            value:
              realtoken.balance.ethereum.value < 0.01
                ? lowValue
                : ownedEthereumValue,
            isHidden: !realtoken.balance.ethereum.value,
            isIndented: true,
          },
          {
            label: t('ownedGnosisValue'),
            value:
              realtoken.balance.gnosis.value < 0.01
                ? lowValue
                : ownedGnosisValue,
            isHidden: !realtoken.balance.gnosis.value,
            isIndented: true,
          },
          {
            label: t('ownedRmmValue'),
            value:
              realtoken.balance.rmm.value < 0.01 ? lowValue : ownedRmmValue,
            isHidden: !realtoken.balance.rmm.value,
            isIndented: true,
          },
          {
            label: t('ownedLevinSwapValue'),
            value:
              realtoken.balance.levinSwap.value < 0.01
                ? lowValue
                : ownedLevinSwapValue,
            isHidden: !realtoken.balance.levinSwap.value,
            isIndented: true,
          },
          ...(transfersIsLoaded
            ? [
                {
                  label: t('priceCost'),
                  value: useCurrencyValue(realtoken.priceCost),
                },
                {
                  label: t('unrealizedCapitalGain'),
                  value: useCurrencyValue(
                    (realtoken.unrealizedCapitalGain ?? 0) > 0.01
                      ? realtoken.unrealizedCapitalGain
                      : undefined,
                  ),
                },
              ]
            : []),
        ]}
      />

      <Divider height={1} my={'xs'} />

      <AssetPageTable
        data={[
          {
            label: t('tokenPrice'),
            value: tokenPrice,
          },
          ...(transfersIsLoaded
            ? [
                {
                  label: t('unitPriceCost'),
                  value: useCurrencyValue(realtoken.unitPriceCost),
                },
              ]
            : []),
          {
            label: t('nbToken'),
            value: `${token} / ${totalToken}`,
          },
        ]}
      />

      <Divider height={1} my={'xs'} />

      <AssetPageTable
        data={[
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
            label: t('rentedUnits'),
            value: `${rentedUnits} / ${totalUnits} (${occupancy})`,
          },
        ]}
      />
    </>
  )
}

AssetPageMainTab.displayName = 'AssetPageMainTab'
