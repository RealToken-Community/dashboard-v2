import { RmmPosition, getRmmPositions } from './subgraphs/queries/rmm.queries'

export const RmmRepository = {
  async getPositions(addressList: string[]) {
    const result = await getRmmPositions(addressList)
    return mergeWalletsPositions(result)
  },
}

export interface WalletRmmPosition {
  token: string
  name: string
  amount: number
  debt: number
  isColateral: boolean
}

function mergeWalletsPositions(wallets: RmmPosition[]) {
  return wallets.reduce<WalletRmmPosition[]>((acc, wallet) => {
    wallet.positions.forEach((position) => {
      const existingPosition = acc.find((b) => b.token === position.token)

      if (existingPosition) {
        existingPosition.amount += position.amount
        existingPosition.debt += position.debt
      } else {
        acc.push({ ...position })
      }
    })

    return acc
  }, [])
}
