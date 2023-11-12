import { gql } from '@apollo/client'

import _groupBy from 'lodash/groupBy'
import _sumBy from 'lodash/sumBy'

import { APIRealToken } from 'src/types/APIRealToken'

import { YamStatisticsClient } from './subgraphs/clients'
import { getRealtokenYamStatistics } from './subgraphs/queries/yam.queries'

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

  const volumes = await getRealtokenYamStatistics(address)

  const parsedValues = volumes
    .map((volume) =>
      volume.volumeDays.map((volumeDay) => ({
        date: volumeDay.date,
        quantity: volumeDay.quantity,
        volume: volumeDay.volume,
        average: volumeDay.volume / volumeDay.quantity,
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
