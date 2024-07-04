import {
  TransferOrigin,
  UserRealTokenTransfer,
} from 'src/repositories/transfers/transfers.type'

export function computeUCP(transfers: UserRealTokenTransfer[]) {
  const { totalAmount, totalValue } = transfers
    .slice()
    .sort((a, b) => a.timestamp - b.timestamp)
    .reduce(
      (acc, item) => {
        const excludedOrigins = [
          TransferOrigin.levinSwapPool,
          TransferOrigin.rmm,
          TransferOrigin.bridge,
        ]

        if (excludedOrigins.includes(item.origin)) {
          return acc
        }

        if (item.direction === 'in') {
          const price = item.exchangedPrice ?? item.price
          acc.totalValue += item.amount * price
          acc.totalAmount += item.amount
        } else if (item.direction === 'out') {
          const currentUCP = acc.totalValue / acc.totalAmount
          acc.totalValue -= item.amount * currentUCP
          acc.totalAmount -= item.amount
        }
        return acc
      },
      {
        totalAmount: 0,
        totalValue: 0,
      },
    )

  return totalAmount ? totalValue / totalAmount : undefined
}
