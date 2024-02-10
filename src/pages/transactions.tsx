import { FC, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

import { NextPage } from 'next'
import { useRouter } from 'next/router'

import {
  Alert,
  Anchor,
  Breadcrumbs,
  Flex,
  Group,
  Pagination,
  Select,
  createStyles,
} from '@mantine/core'

import { useInputStyles } from 'src/components/inputs/useInputStyles'
import { useCurrencyValue } from 'src/hooks/useCurrencyValue'
import { useTransferValues } from 'src/hooks/useTransferValues'
import {
  TransferOrigin,
  UserRealTokenTransfer,
  UserTransferDirection,
} from 'src/repositories/transfers/transfers.type'
import { selectIsLoading } from 'src/store/features/settings/settingsSelector'
import {
  selectTransfers,
  selectTransfersIsLoading,
} from 'src/store/features/transfers/transfersSelector'
import {
  UserRealtoken,
  selectUserRealtokens,
} from 'src/store/features/wallets/walletsSelector'

const useTransferItemStyles = createStyles({
  textBold: {
    fontWeight: 500,
  },
  textSm: {
    fontSize: '14px',
  },
  textLocation: {
    fontSize: '12px',
    textAlign: 'center',
  },
  groupApart: {
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    '& > *': {
      boxSizing: 'border-box',
      flexGrow: 0,
    },
  },
})

const TransferItem: FC<{
  transfer: UserRealTokenTransfer
  realtokens: UserRealtoken[]
}> = ({ transfer, realtokens }) => {
  const { t } = useTranslation('common', { keyPrefix: 'transactionPage.item' })
  const { t: tNumbers } = useTranslation('common', { keyPrefix: 'numbers' })

  const { classes } = useTransferItemStyles()
  const realtoken = realtokens.find((item) => item.id === transfer.realtoken)
  if (!realtoken) {
    return null
  }

  const { formatTransferValues } = useTransferValues()
  const values = formatTransferValues(transfer)

  return (
    <div
      style={{
        opacity: values.isInternal ? 0.5 : 1,
        fontWeight: values.isInternal ? 'lighter' : 'initial',
      }}
    >
      <div className={classes.groupApart}>
        <div className={classes.textBold}>{realtoken.shortName}</div>
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
        >
          {values.isPositive && '+'}
          {values.isNegative && '-'}
          {tNumbers('decimal', { value: transfer.amount })}
          <span
            style={{ fontSize: '12px', fontStyle: 'italic', marginLeft: '5px' }}
          >
            {`(${useCurrencyValue(values.officialValue)})`}
          </span>
        </div>
      </div>

      <div
        className={classes.groupApart}
        style={{ fontSize: '12px', fontStyle: 'italic' }}
      >
        <div>{values.date}</div>
        <div>{values.title}</div>
      </div>

      {!values.isInternal && (
        <div className={classes.textSm}>
          {t('price')} {' : '} {useCurrencyValue(values.price)}
          {values.exchange && (
            <span
              style={{
                fontSize: '11px',
                fontStyle: 'italic',
                marginLeft: '5px',
                color: values.exchange.isPositive ? 'green' : 'red',
              }}
            >
              {'('}
              {tNumbers('percent', {
                value: values.exchange.percentage * 100,
              })}
              {')'}
            </span>
          )}
        </div>
      )}

      {!values.isInternal && values.exchange && (
        <div className={classes.textSm}>
          {t('value')} {' : '} {useCurrencyValue(values.value)}
          {values.exchange && (
            <span
              style={{
                fontSize: '11px',
                fontStyle: 'italic',
                marginLeft: '5px',
                color: values.exchange.isPositive ? 'green' : 'red',
              }}
            >
              {'('}
              {useCurrencyValue(values.exchange.difference)}
              {')'}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

TransferItem.displayName = 'TransferItem'

enum TransferFilter {
  all = 'all',
  internal = 'internal',
  other = 'other',
  swapcat = TransferOrigin.swapcat,
  yam = TransferOrigin.yam,
  primary = TransferOrigin.primary,
  reinvest = TransferOrigin.reinvest,
  rmm = TransferOrigin.rmm,
  levinSwap = TransferOrigin.levinSwap,
  levinSwapPool = TransferOrigin.levinSwapPool,
}

const TransferFilterField: FC<{
  transfers: UserRealTokenTransfer[]
  onChange: (values: UserRealTokenTransfer[]) => void
}> = ({ transfers, onChange }) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'transactionPage.filter',
  })
  const { classes: inputClasses } = useInputStyles()
  const [filter, setFilter] = useState<TransferFilter>(TransferFilter.all)

  const filterFunction =
    (currentFilter: TransferFilter) => (transfer: UserRealTokenTransfer) => {
      if (currentFilter === TransferFilter.all) {
        return true
      }
      if (currentFilter === TransferFilter.internal) {
        return transfer.direction === UserTransferDirection.internal
      }
      if (currentFilter !== TransferFilter.other) {
        return (currentFilter as string) === transfer.origin
      }
      return (
        (currentFilter as string) === transfer.origin &&
        transfer.direction !== UserTransferDirection.internal
      )
    }

  const filterOptions = [
    { value: TransferFilter.all, label: t('all') },
    { value: TransferFilter.primary, label: t('primary') },
    { value: TransferFilter.reinvest, label: t('reinvest') },
    { value: TransferFilter.yam, label: t('yam') },
    { value: TransferFilter.rmm, label: t('rmm') },
    { value: TransferFilter.swapcat, label: t('swapcat') },
    { value: TransferFilter.levinSwap, label: t('levinSwap') },
    { value: TransferFilter.levinSwapPool, label: t('levinSwapPool') },
    { value: TransferFilter.internal, label: t('internal') },
    { value: TransferFilter.other, label: t('other') },
  ]

  return (
    <Select
      label={t('field')}
      data={filterOptions}
      value={filter}
      onChange={(value: TransferFilter) => {
        setFilter(value)
        onChange(transfers.filter(filterFunction(value)))
      }}
      classNames={inputClasses}
    />
  )
}

TransferFilterField.displayName = 'TransferFilterField'

const TransferWarning: FC = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'transfers.informationWarning',
  })

  const [isVisible, setIsVisible] = useState<boolean>(
    localStorage && localStorage.getItem('hideTransferAlertWarning') !== 'true',
  )

  return (
    isVisible && (
      <Alert
        title={t('title')}
        color={'orange'}
        withCloseButton={true}
        my={'lg'}
        onClick={() => {
          setIsVisible(false)
          localStorage.setItem('hideTransferAlertWarning', 'true')
        }}
      >
        {t('text')}
      </Alert>
    )
  )
}

const TransactionPage: NextPage = () => {
  const { t } = useTranslation('common', { keyPrefix: 'transactionPage' })
  const [page, setPage] = useState<number>(1)
  const pageSize = 50

  const realtokens = useSelector(selectUserRealtokens)
  const allTransfers = useSelector(selectTransfers)
  const [transfers, setTransfers] = useState(allTransfers)
  const router = useRouter()

  const isLoading = useSelector(selectIsLoading)
  const isLoadingTransfers = useSelector(selectTransfersIsLoading)

  function onPageChange(page: number) {
    setPage(page)
    // Scroll to top of grid
    document.getElementsByClassName('transaction-list')[0]?.scrollIntoView()
  }

  const paginationTransfers: UserRealTokenTransfer[] = useMemo(() => {
    const start = (page - 1) * pageSize
    const end = start + pageSize
    return transfers.slice(start, end)
  }, [transfers, page, pageSize])

  useEffect(() => setPage(1), [transfers])

  if (!realtokens.length || !allTransfers.length) {
    return (
      <div>
        {isLoading || isLoadingTransfers
          ? 'Loading...'
          : 'Transactions not found'}
      </div>
    )
  }

  return (
    <Flex my={'xl'} mx={'md'} direction={'column'} align={'center'}>
      <div
        style={{ maxWidth: '450px', width: '100%' }}
        className={'transaction-list'}
      >
        <Breadcrumbs>
          <Anchor onClick={() => router.push('/')}>{t('home')}</Anchor>
          {t('title')}
        </Breadcrumbs>
        <h2 style={{ textAlign: 'center' }}>{t('title')}</h2>

        <TransferFilterField
          transfers={allTransfers}
          onChange={(values) => setTransfers(values)}
        />

        <TransferWarning />

        <div style={{ width: '100%' }}>
          {paginationTransfers.map((transfer) => (
            <div key={transfer.id} style={{ marginBottom: '20px' }}>
              <TransferItem transfer={transfer} realtokens={realtokens} />
            </div>
          ))}
        </div>
      </div>

      <Group
        position={'center'}
        align={'center'}
        spacing={8}
        py={'xs'}
        style={{ width: '100%' }}
      >
        <Pagination
          value={page}
          total={Math.ceil(transfers.length / pageSize)}
          boundaries={1}
          siblings={1}
          size={'sm'}
          onChange={onPageChange}
        />
      </Group>
    </Flex>
  )
}

TransactionPage.displayName = 'TransactionPage'

export default TransactionPage
