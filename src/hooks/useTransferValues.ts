import { useTranslation } from 'react-i18next'

import {
  TransferOrigin,
  UserRealTokenTransfer,
  UserTransferDirection,
} from 'src/repositories/transfers/transfers.type'

export function useTransferValues() {
  function getTitle(transfer: UserRealTokenTransfer) {
    const { t } = useTranslation('common', {
      keyPrefix: 'transfers.titleValues',
    })
    switch (transfer.origin) {
      case TransferOrigin.swapcat:
        return transfer.direction === 'in' ? t('swapcatIn') : t('swapcatOut')
      case TransferOrigin.yam:
        return transfer.direction === 'in' ? t('yamIn') : t('yamOut')
      case TransferOrigin.primary:
        return transfer.direction === 'in' ? t('primaryIn') : t('primaryOut')
      case TransferOrigin.rmm:
        return transfer.direction === 'in' ? t('rmmIn') : t('rmmOut')
      case TransferOrigin.levinSwap:
        return transfer.direction === 'in'
          ? t('levinSwapIn')
          : t('levinSwapOut')
      case TransferOrigin.levinSwapPool:
        return transfer.direction === 'in'
          ? t('levinSwapPoolIn')
          : t('levinSwapPoolOut')
      case TransferOrigin.levinSwapUnknown:
        return transfer.direction === 'in'
          ? t('levinSwapUnknownIn')
          : t('levinSwapUnknownOut')
      case TransferOrigin.reinvest:
        return t('reinvest')
      case TransferOrigin.bridge:
        return t('bridge')
      case TransferOrigin.migration:
        return t('migration')
    }

    return transfer.direction === UserTransferDirection.internal
      ? t('internal')
      : t('unknown')
  }

  function getExchange(transfer: UserRealTokenTransfer) {
    if (!transfer.exchangedPrice) {
      return undefined
    }
    const exchangedPrice = transfer.exchangedPrice
    const exchangedValue = transfer.amount * exchangedPrice
    const officialValue = transfer.amount * transfer.price
    const difference = exchangedValue - officialValue
    const percentage = difference / officialValue
    const isPositive =
      transfer.direction === UserTransferDirection.in && difference < 0

    return {
      difference,
      percentage,
      isPositive,
    }
  }

  function formatTransferValues(transfer: UserRealTokenTransfer) {
    const amount = transfer.amount
    const price = transfer.exchangedPrice ?? transfer.price
    const value = amount * price

    const isInternal =
      transfer.direction === UserTransferDirection.internal ||
      transfer.origin === TransferOrigin.levinSwapPool ||
      transfer.origin === TransferOrigin.rmm ||
      transfer.origin === TransferOrigin.bridge ||
      transfer.origin === TransferOrigin.migration
    const isPositive = transfer.direction === 'in' && !isInternal
    const isNegative = transfer.direction === 'out' && !isInternal

    return {
      title: getTitle(transfer),
      date: new Date(transfer.timestamp * 1000).toLocaleString(),
      amount,
      price,
      value,
      officialValue: amount * transfer.price,
      exchange: getExchange(transfer),
      isInternal,
      isPositive,
      isNegative,
    }
  }

  return {
    formatTransferValues,
  }
}
