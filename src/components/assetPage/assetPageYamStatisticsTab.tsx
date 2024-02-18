import { FC, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useCurrencyValue } from 'src/hooks/useCurrencyValue'
import { GetYamStatistics, YamStatistics } from 'src/repositories'
import { UserRealtoken } from 'src/store/features/wallets/walletsSelector'

import { AssetPageTable } from './assetPageTable'

const YamStatisticsTable: FC<{
  realtoken: UserRealtoken
  statistics: YamStatistics
}> = ({ realtoken, statistics }) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'assetPage.yamStatistics',
  })
  const { t: tNumbers } = useTranslation('common', { keyPrefix: 'numbers' })
  const yamPrice = statistics.volume / statistics.quantity
  const yamDifference = yamPrice - realtoken.tokenPrice
  const yamDifferencePercent = (yamDifference / realtoken.tokenPrice) * 100
  return (
    <AssetPageTable
      data={[
        {
          label: t('tokenPrice'),
          value: useCurrencyValue(realtoken.tokenPrice),
        },
        {
          label: t('yamPrice'),
          value: useCurrencyValue(yamPrice),
        },
        {
          label: t('yamDifference'),
          value: `${useCurrencyValue(yamDifference)} (${tNumbers('percent', {
            value: yamDifferencePercent,
          })})`,
        },
        {
          label: t('yamVolume'),
          value: useCurrencyValue(statistics.volume),
        },
      ]}
    />
  )
}
export const AssetPageYamStatisticsTab: FC<{
  realtoken: UserRealtoken
}> = ({ realtoken }) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'assetPage.yamStatistics',
  })
  const [statistics, setStatistics] = useState<YamStatistics | null>(null)

  useEffect(() => {
    GetYamStatistics({
      realtoken,
    }).then((item) => setStatistics(item))
  }, [realtoken])

  if (!statistics) {
    return null
  }

  return statistics.volume ? (
    <YamStatisticsTable realtoken={realtoken} statistics={statistics} />
  ) : (
    <div style={{ textAlign: 'center' }}>{t('noVolume')}</div>
  )
}

AssetPageYamStatisticsTab.displayName = 'AssetPageYamStatisticsTab'
