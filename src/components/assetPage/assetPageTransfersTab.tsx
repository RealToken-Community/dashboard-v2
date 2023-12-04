import { FC, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

import {
  GetRealTokenTransfers,
  RealTokenTransfer,
  TransferOrigin,
} from 'src/repositories/transferts.repository'
import { selectUserAddressList } from 'src/store/features/settings/settingsSelector'
import { UserRealtoken } from 'src/store/features/wallets/walletsSelector'

function getTransferTitle(item: RealTokenTransfer) {
  const { t } = useTranslation('common', { keyPrefix: 'assetPage.transfers' })
  switch (item.origin) {
    case TransferOrigin.swapcat:
      return item.direction === 'in' ? t('swapcatIn') : t('swapcatOut')
    case TransferOrigin.yam:
      return item.direction === 'in' ? t('yamIn') : t('yamOut')
    case TransferOrigin.primary:
      return item.direction === 'in' ? t('primaryIn') : t('primaryOut')
    case TransferOrigin.rmm:
      return item.direction === 'in' ? t('rmmIn') : t('rmmOut')
    case TransferOrigin.levinSwap:
      return item.direction === 'in' ? t('levinSwapIn') : t('levinSwapOut')
    case TransferOrigin.reinvest:
      return t('reinvest')
    case TransferOrigin.internal:
      return t('internal')
    default:
      return t('unknown')
  }
}

function isInternalTransfer(item: RealTokenTransfer) {
  return (
    item.origin === TransferOrigin.internal ||
    item.origin === TransferOrigin.rmm
  )
}

const TransferRow: FC<{ item: RealTokenTransfer }> = ({ item }) => {
  const { t: tNumbers } = useTranslation('common', { keyPrefix: 'numbers' })

  const title = getTransferTitle(item)
  const date = new Date(item.timestamp * 1000).toLocaleString()
  const isInternal = isInternalTransfer(item)
  const amount = tNumbers('decimal', { value: item.amount })
  const isPositive = item.direction === 'in' && !isInternal
  const isNegative = item.direction === 'out' && !isInternal

  return (
    <tr
      style={{
        opacity: isInternal ? 0.5 : 1,
        fontWeight: isInternal ? 'lighter' : 'initial',
      }}
    >
      <td>
        <div>{title}</div>
        <div style={{ fontSize: '12px', fontStyle: 'italic' }}>{date}</div>
      </td>
      <td
        style={{
          textAlign: 'right',
          fontStyle: isInternal ? 'italic' : 'normal',
          fontWeight: isInternal ? 'inherit' : '500',
          color: isPositive ? 'green' : isNegative ? 'red' : undefined,
        }}
        title={item.amount.toString()}
      >
        {isPositive && '+'}
        {isNegative && '-'}
        {amount}
      </td>
    </tr>
  )
}

export const AssetPageTransfersTab: FC<{ data: UserRealtoken }> = ({
  data,
}) => {
  const addressList = useSelector(selectUserAddressList)
  const [transfers, setTransfers] = useState<RealTokenTransfer[]>([])

  useEffect(() => {
    GetRealTokenTransfers({
      addressList: addressList,
      realtokenList: [data],
    }).then((item) => setTransfers(item))
  }, [data, addressList])

  return (
    <table style={{ width: '100%' }}>
      <tbody>
        {transfers.map((item, index) => (
          <TransferRow key={index} item={item} />
        ))}
      </tbody>
    </table>
  )
}

AssetPageTransfersTab.displayName = 'AssetPageTransfersTab'
