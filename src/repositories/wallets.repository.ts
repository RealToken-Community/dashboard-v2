import { RealToken } from 'src/types/RealToken'

import { getLevinSwapBalances } from './subgraphs/queries/levinswap.queries'
import { getRealtokenBalances } from './subgraphs/queries/realtoken.queries'
import { getRmmBalances } from './subgraphs/queries/rmm.queries'

export enum WalletType {
  Gnosis = 'gnosis',
  Ethereum = 'ethereum',
  RMM = 'rmm',
  LevinSwap = 'levinSwap',
}

interface WalletBalance {
  token: string
  amount: number
}

export type WalletBalances = Record<WalletType, WalletBalance[]>

export const WalletsRepository = {
  getBalances: async (
    addressList: string[],
    realtokens: RealToken[],
    options: {
      includesEth?: boolean
      includesLevinSwap?: boolean
    } = {},
  ): Promise<WalletBalances> =>
    getWalletsBalances(addressList, realtokens, options),
}

async function getWalletsBalances(
  addressList: string[],
  realtokens: RealToken[],
  options: {
    includesEth?: boolean
    includesLevinSwap?: boolean
  } = {},
) {
  const [realtokenBalancesResult, rmmBalancesResult, levinSwapBalancesResult] =
    await Promise.allSettled([
      getRealtokenBalances(addressList, { includesEth: options.includesEth }),
      getRmmBalances(addressList),
      getLevinSwapBalances(addressList, realtokens, {
        includesLevinSwap: options.includesLevinSwap,
      }),
    ])

  const realtokenBalances =
    realtokenBalancesResult.status === 'fulfilled'
      ? realtokenBalancesResult.value
      : { gnosis: [], ethereum: [] }
  const rmmBalances =
    rmmBalancesResult.status === 'fulfilled' ? rmmBalancesResult.value : []
  const levinSwapBalances =
    levinSwapBalancesResult.status === 'fulfilled'
      ? levinSwapBalancesResult.value
      : []

  if (realtokenBalancesResult.status === 'rejected') {
    console.warn(
      'Failed to fetch wallet realtoken balances, using empty fallback',
      realtokenBalancesResult.reason,
    )
  }
  if (rmmBalancesResult.status === 'rejected') {
    console.warn(
      'Failed to fetch RMM graph balances, using empty fallback',
      rmmBalancesResult.reason,
    )
  }
  if (levinSwapBalancesResult.status === 'rejected') {
    console.warn(
      'Failed to fetch LevinSwap balances, using empty fallback',
      levinSwapBalancesResult.reason,
    )
  }

  return {
    [WalletType.Gnosis]: mergeWalletsBalances(realtokenBalances.gnosis),
    [WalletType.Ethereum]: mergeWalletsBalances(realtokenBalances.ethereum),
    [WalletType.RMM]: mergeWalletsBalances(rmmBalances),
    [WalletType.LevinSwap]: mergeWalletsBalances(levinSwapBalances),
  }
}

function mergeWalletsBalances(
  wallets: {
    address: string
    balances: {
      token: string
      amount: number
    }[]
  }[],
) {
  return wallets.reduce<WalletBalance[]>((acc, wallet) => {
    wallet.balances.forEach((balance) => {
      const existingBalance = acc.find((b) => b.token === balance.token)

      if (existingBalance) {
        existingBalance.amount += balance.amount
      } else {
        acc.push({ ...balance })
      }
    })

    return acc
  }, [])
}
