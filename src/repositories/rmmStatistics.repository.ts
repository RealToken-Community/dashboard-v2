import { gql } from '@apollo/client'

import { Stablecoin } from 'src/utils/blockchain/Stablecoin'
import { useCacheWithLocalStorage } from 'src/utils/useCache'

import { RMM3Client } from './subgraphs/clients'

const DAY_SECONDS = 60 * 60 * 24
const DEFAULT_DAYS = 7
const GRAPH_PAGE_SIZE = 1000

export interface RmmMetric {
  amount: number
  txCount: number
}

export interface RmmDailyStats {
  date: string
  supply: RmmMetric
  withdraw: RmmMetric
  borrow: RmmMetric
  repay: RmmMetric
  liquidation: RmmMetric
  net: number
}

export interface RmmStatisticsResult {
  days: RmmDailyStats[]
  totals: Omit<RmmDailyStats, 'date' | 'net'>
  period: {
    startDate: string
    endDate: string
    isCurrentWindow: boolean
  }
}

interface GraphReserve {
  underlyingAsset: string
  symbol: string
  decimals: number
}

interface GraphAction {
  timestamp: number
  amount: string
  reserve: GraphReserve
}

interface GraphLiquidationAction {
  timestamp: number
  principalAmount: string
  principalReserve: GraphReserve
}

const SuppliesQuery = gql`
  query RmmSupplies($minTimestamp: Int!, $first: Int!, $skip: Int!) {
    supplies(
      where: { timestamp_gte: $minTimestamp }
      first: $first
      skip: $skip
      orderBy: timestamp
      orderDirection: desc
    ) {
      timestamp
      amount
      reserve {
        underlyingAsset
        symbol
        decimals
      }
    }
  }
`

const WithdrawsQuery = gql`
  query RmmWithdraws($minTimestamp: Int!, $first: Int!, $skip: Int!) {
    redeemUnderlyings(
      where: { timestamp_gte: $minTimestamp }
      first: $first
      skip: $skip
      orderBy: timestamp
      orderDirection: desc
    ) {
      timestamp
      amount
      reserve {
        underlyingAsset
        symbol
        decimals
      }
    }
  }
`

const BorrowsQuery = gql`
  query RmmBorrows($minTimestamp: Int!, $first: Int!, $skip: Int!) {
    borrows(
      where: { timestamp_gte: $minTimestamp }
      first: $first
      skip: $skip
      orderBy: timestamp
      orderDirection: desc
    ) {
      timestamp
      amount
      reserve {
        underlyingAsset
        symbol
        decimals
      }
    }
  }
`

const RepaysQuery = gql`
  query RmmRepays($minTimestamp: Int!, $first: Int!, $skip: Int!) {
    repays(
      where: { timestamp_gte: $minTimestamp }
      first: $first
      skip: $skip
      orderBy: timestamp
      orderDirection: desc
    ) {
      timestamp
      amount
      reserve {
        underlyingAsset
        symbol
        decimals
      }
    }
  }
`

const LiquidationsQuery = gql`
  query RmmLiquidations($minTimestamp: Int!, $first: Int!, $skip: Int!) {
    liquidationCalls(
      where: { timestamp_gte: $minTimestamp }
      first: $first
      skip: $skip
      orderBy: timestamp
      orderDirection: desc
    ) {
      timestamp
      principalAmount
      principalReserve {
        underlyingAsset
        symbol
        decimals
      }
    }
  }
`

async function fetchAllActions(
  minTimestamp: number,
  query: unknown,
  resultKey: 'supplies' | 'redeemUnderlyings' | 'borrows' | 'repays',
): Promise<GraphAction[]> {
  let skip = 0
  const all: GraphAction[] = []

  while (true) {
    const response = await RMM3Client().query<
      Record<
        'supplies' | 'redeemUnderlyings' | 'borrows' | 'repays',
        GraphAction[]
      >
    >({
      query: query as never,
      variables: {
        minTimestamp,
        first: GRAPH_PAGE_SIZE,
        skip,
      },
      fetchPolicy: 'network-only',
    })

    const page = response.data[resultKey] ?? []
    all.push(...page)
    if (page.length < GRAPH_PAGE_SIZE) break
    skip += GRAPH_PAGE_SIZE
  }

  return all
}

async function fetchAllLiquidations(
  minTimestamp: number,
): Promise<GraphLiquidationAction[]> {
  let skip = 0
  const all: GraphLiquidationAction[] = []

  while (true) {
    const response = await RMM3Client().query<{
      liquidationCalls: GraphLiquidationAction[]
    }>({
      query: LiquidationsQuery,
      variables: {
        minTimestamp,
        first: GRAPH_PAGE_SIZE,
        skip,
      },
      fetchPolicy: 'network-only',
    })

    const page = response.data.liquidationCalls ?? []
    all.push(...page)
    if (page.length < GRAPH_PAGE_SIZE) break
    skip += GRAPH_PAGE_SIZE
  }

  return all
}

function utcDayKey(timestampSeconds: number): string {
  return new Date(timestampSeconds * 1000).toISOString().slice(0, 10)
}

function parseAmount(rawAmount: string, decimals: number): number {
  return Number(rawAmount) / 10 ** decimals
}

function getCurrentWindowEndTimestamp(): number {
  const now = new Date()
  const utcMidnight = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  )
  return Math.floor(utcMidnight / 1000) + DAY_SECONDS - 1
}

function getWindowRange(days: number, windowOffset = 0) {
  const currentEnd = getCurrentWindowEndTimestamp()
  // Window offset is expressed in full day blocks.
  // Keep both bounds aligned to UTC day boundaries.
  const end = currentEnd - windowOffset * days * DAY_SECONDS
  const endDayStart = end - (DAY_SECONDS - 1)
  const start = endDayStart - (days - 1) * DAY_SECONDS
  return { start, end, isCurrentWindow: windowOffset === 0 }
}

function createEmptyMetric(): RmmMetric {
  return { amount: 0, txCount: 0 }
}

function createDaySkeleton(
  days: number,
  windowOffset: number,
): Record<string, RmmDailyStats> {
  const { start } = getWindowRange(days, windowOffset)
  const result: Record<string, RmmDailyStats> = {}

  for (let idx = 0; idx < days; idx++) {
    const dayTimestamp = start + idx * DAY_SECONDS
    const day = utcDayKey(dayTimestamp)
    result[day] = {
      date: day,
      supply: createEmptyMetric(),
      withdraw: createEmptyMetric(),
      borrow: createEmptyMetric(),
      repay: createEmptyMetric(),
      liquidation: createEmptyMetric(),
      net: 0,
    }
  }

  return result
}

const getRmmStatisticsInternal = useCacheWithLocalStorage(
  async (days: number, windowOffset: number) => {
    const { start, end, isCurrentWindow } = getWindowRange(days, windowOffset)
    const [supplies, redeemUnderlyings, borrows, repays, liquidationCalls] =
      await Promise.all([
        fetchAllActions(start, SuppliesQuery, 'supplies'),
        fetchAllActions(start, WithdrawsQuery, 'redeemUnderlyings'),
        fetchAllActions(start, BorrowsQuery, 'borrows'),
        fetchAllActions(start, RepaysQuery, 'repays'),
        fetchAllLiquidations(start),
      ])

    const dayStats = createDaySkeleton(days, windowOffset)

    const addAction = (
      actionType: keyof Pick<
        RmmDailyStats,
        'supply' | 'withdraw' | 'borrow' | 'repay' | 'liquidation'
      >,
      action: GraphAction,
    ) => {
      if (action.timestamp < start || action.timestamp > end) return
      const token = action.reserve.underlyingAsset.toLowerCase()
      if (!Stablecoin.isStable(token)) return

      const day = utcDayKey(action.timestamp)
      if (!dayStats[day]) return

      const amount = parseAmount(action.amount, action.reserve.decimals)
      dayStats[day][actionType].amount += amount
      dayStats[day][actionType].txCount += 1
    }

    supplies.forEach((action) => addAction('supply', action))
    redeemUnderlyings.forEach((action) => addAction('withdraw', action))
    borrows.forEach((action) => addAction('borrow', action))
    repays.forEach((action) => addAction('repay', action))

    liquidationCalls.forEach((action) => {
      if (action.timestamp < start || action.timestamp > end) return
      const token = action.principalReserve.underlyingAsset.toLowerCase()
      if (!Stablecoin.isStable(token)) return

      const day = utcDayKey(action.timestamp)
      if (!dayStats[day]) return

      dayStats[day].liquidation.amount += parseAmount(
        action.principalAmount,
        action.principalReserve.decimals,
      )
      dayStats[day].liquidation.txCount += 1
    })

    const daysList = Object.values(dayStats).sort((a, b) =>
      a.date.localeCompare(b.date),
    )

    daysList.forEach((item) => {
      item.net =
        item.supply.amount +
        item.repay.amount -
        item.withdraw.amount -
        item.borrow.amount +
        item.liquidation.amount
    })

    const totals = daysList.reduce(
      (acc, item) => ({
        supply: {
          amount: acc.supply.amount + item.supply.amount,
          txCount: acc.supply.txCount + item.supply.txCount,
        },
        withdraw: {
          amount: acc.withdraw.amount + item.withdraw.amount,
          txCount: acc.withdraw.txCount + item.withdraw.txCount,
        },
        borrow: {
          amount: acc.borrow.amount + item.borrow.amount,
          txCount: acc.borrow.txCount + item.borrow.txCount,
        },
        repay: {
          amount: acc.repay.amount + item.repay.amount,
          txCount: acc.repay.txCount + item.repay.txCount,
        },
        liquidation: {
          amount: acc.liquidation.amount + item.liquidation.amount,
          txCount: acc.liquidation.txCount + item.liquidation.txCount,
        },
      }),
      {
        supply: createEmptyMetric(),
        withdraw: createEmptyMetric(),
        borrow: createEmptyMetric(),
        repay: createEmptyMetric(),
        liquidation: createEmptyMetric(),
      },
    )

    return {
      days: daysList,
      totals,
      period: {
        startDate: utcDayKey(start),
        endDate: utcDayKey(end),
        isCurrentWindow,
      },
    }
  },
  {
    duration: 1000 * 60 * 60, // 1 hour
    usePreviousValueOnError: true,
    key: 'RmmStatisticsQuery',
  },
)

export async function getRmmStatistics(
  days = DEFAULT_DAYS,
  windowOffset = 0,
): Promise<RmmStatisticsResult> {
  return getRmmStatisticsInternal(days, windowOffset)
}
