import { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { Anchor } from '@mantine/core'

import { useCurrencyValue } from 'src/hooks/useCurrencyValue'
import { useTransferValues } from 'src/hooks/useTransferValues'
import { UserRealTokenTransfer } from 'src/repositories/transfers/transfers.type'
import { UserRealtoken } from 'src/store/features/wallets/walletsSelector'

const TransferRow: FC<{ item: UserRealTokenTransfer }> = ({ item }) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'assetPage.transfers',
  })
  const { t: tNumbers } = useTranslation('common', { keyPrefix: 'numbers' })

  const { formatTransferValues } = useTransferValues()
  const values = formatTransferValues(item)

  const txId = item.id.replace(/-.*/, '')
  const explorerLink =
    item.chainId === 1
      ? `https://etherscan.io/tx/${txId}`
      : `https://gnosisscan.io/tx/${txId}`

  return (
    <tr
      style={{
        opacity: values.isInternal ? 0.5 : 1,
        fontWeight: values.isInternal ? 'lighter' : 'initial',
      }}
    >
      <td>
        <div>{values.title}</div>
        <div style={{ fontSize: '12px', fontStyle: 'italic' }}>
          {values.date}
          <Anchor
            href={explorerLink}
            target={'_blank'}
            style={{
              fontSize: '12px',
              fontStyle: 'italic',
              color: 'gray',
            }}
          >
            {` (${item.chainId === 1 ? t('etherScan') : t('gnosisScan')})`}
          </Anchor>
        </div>
      </td>
      <td style={{ verticalAlign: 'top' }}>
        <div
          style={{
            textAlign: 'right',
            fontStyle: values.isInternal ? 'italic' : 'normal',
            fontWeight: values.isInternal ? 'inherit' : '500',
            color: values.isPositive
              ? 'green'
              : values.isNegative
                ? 'red'
                : undefined,
          }}
          title={values.amount.toString()}
        >
          {values.isPositive && '+'}
          {values.isNegative && '-'}
          {tNumbers('decimal', { value: values.amount })}
          <span
            style={{ fontSize: '12px', fontStyle: 'italic', marginLeft: '5px' }}
          >
            {`(${useCurrencyValue(values.officialValue)})`}
          </span>
        </div>
        {!values.isInternal && (
          <div
            style={{
              fontSize: '12px',
              fontStyle: 'italic',
              textAlign: 'right',
            }}
          >
            {`${useCurrencyValue(values.price)}/Token (${useCurrencyValue(
              values.value,
            )})`}
          </div>
        )}
      </td>
    </tr>
  )
}

export const AssetPageTransfersTab: FC<{
  realtoken: UserRealtoken
}> = ({ realtoken }) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'assetPage.transfers',
  })
  return realtoken.transfers.length ? (
    <table style={{ width: '100%' }}>
      <tbody>
        {realtoken.transfers.map((item, index) => (
          <TransferRow key={index} item={item} />
        ))}
      </tbody>
    </table>
  ) : (
    <div style={{ textAlign: 'center' }}>{t('noTransfers')}</div>
  )
}

AssetPageTransfersTab.displayName = 'AssetPageTransfersTab'
