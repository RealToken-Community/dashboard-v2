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
  ): Promise<WalletBalances> => getWalletsBalances(addressList, realtokens),
}

async function getWalletsBalances(
  addressList: string[],
  realtokens: RealToken[],
) {
  const [realtokenBalances, rmmBalances, levinSwapBalances] = await Promise.all(
    [
      getRealtokenBalances(addressList),
      getRmmBalances(addressList),
      getLevinSwapBalances(addressList, realtokens),
    ],
  )

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
