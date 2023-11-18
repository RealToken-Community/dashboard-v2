import { FC, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useCurrencyValue } from 'src/hooks/useCurrencyValue'
import { GetYamStatistics, YamStatistics } from 'src/repositories'
import { UserRealtoken } from 'src/store/features/wallets/walletsSelector'

import { AssetPageTable } from './assetPageTable'

const YamStatisticsTable: FC<{
  data: UserRealtoken
  statistics: YamStatistics
}> = ({ data, statistics }) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'assetPage.yamStatistics',
  })
  const { t: tNumbers } = useTranslation('common', { keyPrefix: 'numbers' })
  const yamPrice = statistics.volume / statistics.quantity
  const yamDifference = yamPrice - data.tokenPrice
  const yamDifferencePercent = (yamDifference / data.tokenPrice) * 100
  return (
    <AssetPageTable
      data={[
        {
          label: t('tokenPrice'),
          value: useCurrencyValue(data.tokenPrice),
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
export const AssetPageYamStatisticsTab: FC<{ data: UserRealtoken }> = ({
  data,
}) => {
  const [statistics, setStatistics] = useState<YamStatistics | null>(null)

  useEffect(() => {
    GetYamStatistics({
      realtoken: data,
    }).then((item) => setStatistics(item))
  }, [data])

  return statistics ? (
    <YamStatisticsTable data={data} statistics={statistics} />
  ) : null
}

AssetPageYamStatisticsTab.displayName = 'AssetPageYamStatisticsTab'
