import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

import { Divider } from '@mantine/core'

import { useCurrencyValue } from 'src/hooks/useCurrencyValue'
import { GetYamStatistics, YamStatistics } from 'src/repositories'
import {
  UserRealtoken,
  selectAllUserRealtokens,
} from 'src/store/features/wallets/walletsSelector'

const YamStatisticsRow: React.FC<{
  statistics: YamStatistics
  realtoken: UserRealtoken
}> = ({ statistics, realtoken }) => {
  const { t: tNumbers } = useTranslation('common', { keyPrefix: 'numbers' })
  const yamPrice = statistics.volume / statistics.quantity
  const yamDifference = yamPrice - realtoken.tokenPrice
  const yamDifferencePercent = (yamDifference / realtoken.tokenPrice) * 100

  const fallback = '-'
  const yamPriceValue = useCurrencyValue(yamPrice, fallback)
  const yamDifferenceValue = useCurrencyValue(yamDifference, fallback)
  const volumeValue = useCurrencyValue(statistics.volume, fallback)

  return yamPriceValue !== fallback ? (
    <>
      <tr key={realtoken.id}>
        <td>{realtoken.tokenPrice}</td>
        <td>{yamPriceValue}</td>
        <td>
          {yamDifferenceValue} (
          {tNumbers('percent', { value: yamDifferencePercent })})
        </td>
        <td>{volumeValue}</td>
      </tr>

      <tr>
        <td colSpan={4}>
          <Divider my={'xs'} />
        </td>
      </tr>
    </>
  ) : null
}

const YamStatisticsPage = () => {
  const realtokens = useSelector(selectAllUserRealtokens)

  const [yamStatistics, setYamStatistics] = useState<YamStatistics[]>(
    realtokens.map(() => {
      return {
        quantity: 0,
        volume: 0,
        days: [],
      }
    }),
  )

  const [isLoading, setIsLoading] = useState(true)

  const yamStatisticsPromise: Promise<YamStatistics[]> = useMemo(async () => {
    console.log({ realtokens })
    if (!realtokens.length) return Promise.resolve([])
    const statsPromises = realtokens.map((realtoken) =>
      GetYamStatistics({ realtoken }),
    )
    const data = await Promise.all(statsPromises)
    return data
  }, [realtokens])

  useEffect(() => {
    setIsLoading(true)
    yamStatisticsPromise.then((data) => {
      setYamStatistics(data)
      setIsLoading(false)
      console.log({ data })
    })
  }, [yamStatisticsPromise])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h1>Yam Statistics</h1>
      <table style={{ width: '100%' }}>
        <tr style={{ textAlign: 'left' }}>
          <th>Token Price</th>
          <th>Yam Price</th>
          <th>Yam Difference (30 days)</th>
          <th>Yam Volume</th>
        </tr>
        {yamStatistics &&
          yamStatistics.map((statistics, index) => (
            <YamStatisticsRow
              key={index}
              statistics={statistics}
              realtoken={realtokens[index]}
            />
          ))}
      </table>
    </div>
  )
}

export default YamStatisticsPage
