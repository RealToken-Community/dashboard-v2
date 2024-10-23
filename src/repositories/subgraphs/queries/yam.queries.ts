import { gql } from '@apollo/client'

import { useCacheWithLocalStorage } from 'src/utils/useCache'

import { YamStatisticsClient } from '../clients'

const STABLE_TOKENS = [
  '0xe91d153e0b41518a2ce8dd3d7944fa863463a97d', // WxDai
  '0xddafbb505ad214d7b80b1f830fccc89b60fb7a83', // USDC
  '0x7349c9eaa538e118725a6130e0f8341509b9f8a0', // armmWxDai
]

export async function getRealtokenYamStatistics(address: string) {
  const result = await executeQuery()
  return result.find((item) => item.address === address)?.value ?? []
}

const executeQuery = useCacheWithLocalStorage(
  async () => {
    const response = await YamStatisticsClient().query<YamStatisticsResult>({
      query: YamStatisticsQuery,
      variables: {
        limitDate: getLastMonthDate(),
        stables: STABLE_TOKENS,
      },
    })

    return (
      response.data?.tokens?.map((item) => ({
        address: item.id,
        value: formatStatistics(item),
      })) ?? []
    )
  },
  {
    duration: 1000 * 60 * 60, // 1 hour
    usePreviousValueOnError: true,
    key: 'YamStatisticsQuery',
  },
)

const YamStatisticsQuery = gql`
  query GetTokenVolumes($stables: [String!], $limitDate: String!) {
    tokens(first: 1000) {
      id
      decimals
      volumes(where: { token_in: $stables }) {
        token {
          decimals
        }
        volumeDays(
          orderBy: date
          orderDirection: desc
          where: { date_gte: $limitDate }
        ) {
          date
          quantity
          volume
        }
      }
    }
  }
`

interface YamStatisticsResult {
  tokens: {
    id: string
    decimals: string
    volumes: {
      token: { decimals: string }
      volumeDays: {
        date: string
        quantity: string
        volume: string
      }[]
    }[]
  }[]
}

function getLastMonthDate() {
  const date = new Date()
  date.setMonth(date.getMonth() - 1)
  const year = date.getFullYear().toString()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatStatistics(statistics: YamStatisticsResult['tokens'][0]) {
  const decimals = parseInt(statistics.decimals)
  return statistics.volumes.flatMap((volume) =>
    volume.volumeDays.map((day) => ({
      date: day.date,
      qte: parseFloat(day.quantity) / 10 ** decimals,
      vol: parseFloat(day.volume) / 10 ** parseInt(volume.token.decimals),
    })),
  )
}
