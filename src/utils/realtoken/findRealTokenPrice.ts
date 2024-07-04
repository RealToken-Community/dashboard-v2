import moment from 'moment'

import { RealToken } from 'src/types/RealToken'

export function findRealTokenPrice(
  realtoken: RealToken,
  timestampOrDate: number | string,
): number {
  const date =
    typeof timestampOrDate === 'string'
      ? timestampOrDate
      : moment(timestampOrDate * 1000).format('YYYMMDD')

  const lastHistoryWithTokenPrice = realtoken.history
    .filter((item) => item.date <= date)
    .find((item) => item.values.tokenPrice)
  const lastTokenPrice = lastHistoryWithTokenPrice?.values.tokenPrice
  return lastTokenPrice ?? realtoken.tokenPrice
}

export function findRealTokenRent(
  realtoken: RealToken,
  timestampOrDate: number | string,
): number {
  const date =
    typeof timestampOrDate === 'string'
      ? timestampOrDate
      : moment(timestampOrDate * 1000).format('YYYMMDD')

  const lastHistoryWithRent = realtoken.history
    .filter((item) => item.date <= date)
    .find((item) => item.values.netRentYear)
  const lastRent = lastHistoryWithRent?.values.netRentYear
  return lastRent ?? realtoken.netRentYear
}
