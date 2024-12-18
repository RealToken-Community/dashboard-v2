import _groupBy from 'lodash/groupBy'
import _sumBy from 'lodash/sumBy'

import { APIRealToken } from 'src/types/APIRealToken'

import { getRealtokenYamStatistics } from './subgraphs/queries/yam.queries'

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
  const address = params.realtoken.blockchainAddresses.xDai.contract
    ? params.realtoken.blockchainAddresses.xDai.contract.toLowerCase()
    : null

  if (!address) {
    return {
      quantity: 0,
      volume: 0,
      days: [],
    }
  }

  const volumes = await getRealtokenYamStatistics(address)

  const parsedValues = volumes.map((item) => ({
    date: item.date,
    quantity: item.qte,
    volume: item.vol,
    average: item.vol / item.qte,
  }))

  const groupedValues = Object.values(_groupBy(parsedValues, 'date')).map(
    (item) => ({
      date: item[0].date,
      quantity: _sumBy(item, 'quantity'),
      volume: _sumBy(item, 'volume'),
    }),
  )

  return {
    quantity: _sumBy(groupedValues, 'quantity'),
    volume: _sumBy(groupedValues, 'volume'),
    days: groupedValues.sort((a, b) => a.date.localeCompare(b.date)),
  }
}
