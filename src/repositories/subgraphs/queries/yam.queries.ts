import { gql } from '@apollo/client'

import { useCacheWithLocalStorage } from 'src/utils/useCache'

import { YamStatisticsClient } from '../clients'

const STABLE_TOKENS = [
  '0xe91d153e0b41518a2ce8dd3d7944fa863463a97d', // WxDai
  '0xddafbb505ad214d7b80b1f830fccc89b60fb7a83', // USDC
  '0x7349c9eaa538e118725a6130e0f8341509b9f8a0', // armmWxDai
]

export async function getRealtokenYamStatistics(address: string) {
  const result = await executeQuery(address)
  return result.data.token ? formatStatistics(result.data.token) : []
}

const executeQuery = useCacheWithLocalStorage(
  async (address: string) =>
    YamStatisticsClient().query<YamStatisticsResult>({
      query: YamStatisticsQuery,
      variables: {
        address,
        limitDate: getLastMonthDate(),
        stables: STABLE_TOKENS,
      },
    }),
  {
    duration: 1000 * 60 * 60, // 1 hour
    usePreviousValueOnError: true,
    key: 'YamStatisticsQuery',
  },
)

const YamStatisticsQuery = gql`
  query GetTokenVolumes(
    $address: String!
    $stables: [String!]
    $limitDate: String!
  ) {
    token(id: $address) {
      decimals
      volumes(where: { token_in: $stables }) {
        token {
          decimals
        }
        quantity
        volume
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
  token: {
    decimals: string
    volumes: {
      token: { decimals: string }
      quantity: string
      volume: string
      volumeDays: {
        date: string
        quantity: string
        volume: string
      }[]
    }[]
  }
}

function getLastMonthDate() {
  const date = new Date()
  date.setMonth(date.getMonth() - 1)
  const year = date.getFullYear().toString()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatStatistics(statistics: YamStatisticsResult['token']) {
  const decimals = parseInt(statistics.decimals)
  return statistics.volumes.map((volume) => ({
    quantity: parseFloat(volume.quantity) / 10 ** decimals,
    volume: parseFloat(volume.volume) / 10 ** parseInt(volume.token.decimals),
    volumeDays: volume.volumeDays.map((day) => ({
      date: day.date,
      quantity: parseFloat(day.quantity) / 10 ** decimals,
      volume: parseFloat(day.volume) / 10 ** parseInt(volume.token.decimals),
    })),
  }))
}
