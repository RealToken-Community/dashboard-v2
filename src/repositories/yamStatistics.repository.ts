import { ApolloClient, InMemoryCache, gql } from '@apollo/client'

import _groupBy from 'lodash/groupBy'
import _mapValues from 'lodash/mapValues'
import _sumBy from 'lodash/sumBy'

import { APIRealToken } from 'src/types/APIRealToken'

const YamStatisticsClient = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/jycssu-com/yam-history-gnosis',
  cache: new InMemoryCache(),
})

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

export interface YamStatistics {
  quantity: number
  volume: number
  days: {
    date: string
    quantity: number
    volume: number
  }[]
}

export async function GetYamStatistics(params: {
  realtoken: APIRealToken
}): Promise<YamStatistics> {
  const address =
    params.realtoken.blockchainAddresses.xDai.contract.toLowerCase()

  const result = await YamStatisticsClient.query<YamStatisticsResult>({
    query: YamStatisticsQuery,
    variables: {
      address,
      limitDate: getLimitDate(),
      stables: [
        '0xe91d153e0b41518a2ce8dd3d7944fa863463a97d', // WxDai
        '0xddafbb505ad214d7b80b1f830fccc89b60fb7a83', // USDC
        '0x7349c9eaa538e118725a6130e0f8341509b9f8a0', // armmWxDai
      ],
    },
  })

  const decimals = parseInt(result.data.token.decimals)
  const volumes = result.data.token.volumes

  const parsedValues = volumes
    .map(({ token, volumeDays }) =>
      volumeDays.map(({ date, quantity, volume }) => ({
        date,
        quantity: +quantity / Math.pow(10, decimals),
        volume: +volume / Math.pow(10, +token.decimals),
        average:
          +volume /
          Math.pow(10, +token.decimals) /
          (+quantity / Math.pow(10, +token.decimals)),
      }))
    )
    .flat()

  const groupedValues = Object.values(_groupBy(parsedValues, 'date')).map(
    (item) => ({
      date: item[0].date,
      quantity: _sumBy(item, 'quantity'),
      volume: _sumBy(item, 'volume'),
    })
  )

  return {
    quantity: _sumBy(groupedValues, 'quantity'),
    volume: _sumBy(groupedValues, 'volume'),
    days: groupedValues.sort((a, b) => a.date.localeCompare(b.date)),
  }
}

function getLimitDate() {
  const date = new Date()
  date.setMonth(date.getMonth() - 1)
  const year = date.getFullYear().toString()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}`
}
