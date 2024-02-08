import { UserRealTokenTransfer } from 'src/repositories/transfers/transfers.type'

export function computeUCP(transfers: UserRealTokenTransfer[]) {
  const { totalAmount, totalValue } = transfers.reduce(
    (acc, item) => {
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

  return totalValue / totalAmount
}
