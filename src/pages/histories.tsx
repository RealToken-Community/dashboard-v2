import { FC, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

import { NextPage } from 'next'
import { useRouter } from 'next/router'

import {
  Anchor,
  Breadcrumbs,
  Card,
  Flex,
  Group,
  Pagination,
  Select,
  Title,
} from '@mantine/core'

import {
  formatDistanceToNowStrict as FormatDistanceToNowStrictDateFns,
  parse as ParseDateFns,
} from 'date-fns'

import { StringField } from 'src/components/commons'
import { useInputStyles } from 'src/components/inputs/useInputStyles'
import { useCurrencyValue } from 'src/hooks/useCurrencyValue'
import { selectIsLoading } from 'src/store/features/settings/settingsSelector'
import {
  UserRealtoken,
  selectOwnedRealtokens,
  selectUserRealtokens,
} from 'src/store/features/wallets/walletsSelector'
import { RealTokenHistoryItem } from 'src/types/APIRealTokenHistory'

type History = RealTokenHistoryItem & {
  id: string
  realtoken: UserRealtoken
}

function getHistoryValue<Key extends keyof RealTokenHistoryItem['values']>(
  history: History,
  key: Key,
) {
  return history.values[key] ?? history.realtoken[key]
}

function getHistoricalValue<Key extends keyof RealTokenHistoryItem['values']>(
  history: History,
  key: Key,
) {
  return (
    history.realtoken.history
      .slice()
      .reverse()
      .find(
        (item) => item.date < history.date && Object.hasOwn(item.values, key),
      )?.values[key] ?? getHistoryValue(history, key)
  )
}

function getRateChange(current: number, previous: number) {
  const change = ((current - previous) / previous) * 100
  return `${change > 0 ? '+' : ''}${change.toFixed(1)}`
}

function getRate(value: number, total: number) {
  return (value / total) * 100
}

function getDate(date: string) {
  const formatedDate = ParseDateFns(date, 'yyyyMMdd', new Date())

  const dateValue = formatedDate.toLocaleDateString()
  const dateDistance =
    formatedDate.toDateString() === new Date().toDateString()
      ? 'Today'
      : FormatDistanceToNowStrictDateFns(formatedDate, { unit: 'day' })
  return `${dateValue} (${dateDistance})`
}

const ValueHistoryItem: FC<{ history: History }> = ({ history }) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'historiesPage.valueItem',
  })
  const router = useRouter()
  const date = getDate(history.date)
  const tokenPrice = getHistoryValue(history, 'tokenPrice')
  const assetPrice = getHistoryValue(history, 'underlyingAssetPrice')
  const lastTokenPrice = getHistoricalValue(history, 'tokenPrice')
  const lastAssetPrice = getHistoricalValue(history, 'underlyingAssetPrice')
  const tokenPricePercent = getRateChange(tokenPrice, lastTokenPrice)
  const assetPricePercent = getRateChange(assetPrice, lastAssetPrice)

  const netRentYear = getHistoryValue(history, 'netRentYear')
  const totalTokens = history.realtoken.totalTokens
  const lastTotalInvestment = lastTokenPrice * totalTokens
  const totalInvestment = tokenPrice * totalTokens
  const lastReturnRate = getRate(netRentYear, lastTotalInvestment).toFixed(2)
  const returnRate = getRate(netRentYear, totalInvestment).toFixed(2)

  return (
    <Card shadow={'sm'} radius={'md'} style={{ height: '100%' }}>
      <Title order={4} mb={'xs'} style={{ textAlign: 'center' }}>
        <Anchor
          onClick={() => router.push(`/asset/${history.realtoken.id}`)}
          size={'lg'}
          style={{ fontWeight: 600 }}
        >
          {history.realtoken.shortName}
        </Anchor>
        <div>{`${t('title')} : ${date}`}</div>
      </Title>
      <div style={{ lineHeight: 1 }}>
        <StringField
          label={`${t('token')} : `}
          value={`${useCurrencyValue(lastTokenPrice)} -> ${useCurrencyValue(
            tokenPrice,
          )} (${tokenPricePercent} %)`}
        />
        <StringField
          label={`${t('property')} : `}
          value={`${useCurrencyValue(lastAssetPrice)} -> ${useCurrencyValue(
            assetPrice,
          )} (${assetPricePercent} %)`}
        />
        <StringField
          label={`${t('yield')} : `}
          value={`${lastReturnRate} % -> ${returnRate} %`}
        />
      </div>
    </Card>
  )
}

ValueHistoryItem.displayName = 'ValueHistoryItem'

const RentHistoryItem: FC<{ history: History }> = ({ history }) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'historiesPage.rentItem',
  })
  const router = useRouter()
  const date = getDate(history.date)
  const netRentYear = getHistoryValue(history, 'netRentYear')
  const grossRentYear = getHistoryValue(history, 'grossRentYear')
  const lastNetRentYear = getHistoricalValue(history, 'netRentYear')
  const lastGrossRentYear = getHistoricalValue(history, 'grossRentYear')
  const netRentMonth = (netRentYear / 12).toFixed(2)
  const grossRentMonth = (grossRentYear / 12).toFixed(2)
  const lastNetRentMonth = (lastNetRentYear / 12).toFixed(2)
  const lastGrossRentMonth = (lastGrossRentYear / 12).toFixed(2)

  const totalInvestment = getHistoricalValue(history, 'totalInvestment')
  const lastReturnRate = getRate(lastNetRentYear, totalInvestment).toFixed(2)
  const returnRate = getRate(netRentYear, totalInvestment).toFixed(2)
  const returnPercent = getRateChange(netRentYear, lastNetRentYear)

  const totalUnits = history.realtoken.totalUnits
  const rentedUnits = getHistoryValue(history, 'rentedUnits')
  const lastRentedUnits = getHistoricalValue(history, 'rentedUnits')
  const isRentedUnitsChange = rentedUnits !== lastRentedUnits
  const lastOccupancyRate = getRate(lastRentedUnits, totalUnits).toFixed(0)
  const occupancyRate = getRate(rentedUnits, totalUnits).toFixed(0)

  return (
    <Card shadow={'sm'} radius={'md'} style={{ height: '100%' }}>
      <Title order={4} mb={'xs'} style={{ textAlign: 'center' }}>
        <Anchor
          onClick={() => router.push(`/asset/${history.realtoken.id}`)}
          size={'lg'}
          style={{ fontWeight: 600 }}
        >
          {history.realtoken.shortName}
        </Anchor>
        <div>{`${t('title')} : ${date}`}</div>
      </Title>
      <div style={{ lineHeight: 1 }}>
        <StringField
          label={`${t('yield')} : `}
          value={`${lastReturnRate} % -> ${returnRate} % (${returnPercent} %)`}
        />
        <StringField
          label={`${t('netRentMonth')} : `}
          value={`${useCurrencyValue(+lastNetRentMonth)} -> ${useCurrencyValue(
            +netRentMonth,
          )}`}
        />
        <StringField
          label={`${t('grossRentMonth')} : `}
          value={`${useCurrencyValue(
            +lastGrossRentMonth,
          )} -> ${useCurrencyValue(+grossRentMonth)}`}
        />
        {isRentedUnitsChange && (
          <StringField
            label={`${t('rentedUnits')} : `}
            value={`${lastRentedUnits}/${totalUnits} (${lastOccupancyRate} %) -> ${rentedUnits}/${totalUnits} (${occupancyRate} %)`}
          />
        )}
      </div>
    </Card>
  )
}

RentHistoryItem.displayName = 'RentHistoryItem'

const HistoryItem: FC<{ history: History }> = ({ history }) => {
  const isValueChange =
    Object.hasOwn(history.values, 'tokenPrice') &&
    Object.hasOwn(history.values, 'underlyingAssetPrice')

  const isRentChange =
    Object.hasOwn(history.values, 'netRentYear') &&
    Object.hasOwn(history.values, 'grossRentYear')

  if (isValueChange) {
    return <ValueHistoryItem history={history} />
  }
  if (isRentChange) {
    return <RentHistoryItem history={history} />
  }

  return null
}

HistoryItem.displayName = 'HistoryItem'

enum HistoryFilter {
  all = 'all',
  allValue = 'allValue',
  allRent = 'allRent',
  owned = 'owned',
  ownedValue = 'ownedValue',
  ownedRent = 'ownedRent',
}

function getHistoryFilterFunction(
  realtokens: UserRealtoken[],
  currentFilter: HistoryFilter,
) {
  return (history: History) => {
    const isValueChange =
      Object.hasOwn(history.values, 'tokenPrice') &&
      Object.hasOwn(history.values, 'underlyingAssetPrice')

    const isRentChange =
      Object.hasOwn(history.values, 'netRentYear') &&
      Object.hasOwn(history.values, 'grossRentYear')

    const isOwned = realtokens.some(
      (item) => item.uuid === history.realtoken.uuid,
    )

    switch (currentFilter) {
      case HistoryFilter.allValue:
        return isValueChange
      case HistoryFilter.allRent:
        return isRentChange
      case HistoryFilter.owned:
        return isOwned
      case HistoryFilter.ownedValue:
        return isValueChange && isOwned
      case HistoryFilter.ownedRent:
        return isRentChange && isOwned
      default:
        return true
    }
  }
}

const HistoryFilterField: FC<{
  filter: HistoryFilter
  onChange: (filter: HistoryFilter) => void
}> = ({ filter, onChange }) => {
  const { t } = useTranslation('common', { keyPrefix: 'historiesPage.filter' })
  const { classes: inputClasses } = useInputStyles()

  const filterOptions = [
    { value: HistoryFilter.all, label: t('all') },
    { value: HistoryFilter.allValue, label: t('allValue') },
    { value: HistoryFilter.allRent, label: t('allRent') },
    { value: HistoryFilter.owned, label: t('owned') },
    { value: HistoryFilter.ownedValue, label: t('ownedValue') },
    { value: HistoryFilter.ownedRent, label: t('ownedRent') },
  ]

  return (
    <Select
      label={t('field')}
      data={filterOptions}
      value={filter}
      onChange={(value) => onChange(value as HistoryFilter)}
      classNames={inputClasses}
    />
  )
}

function getUsefullHistories(realtokens: UserRealtoken[]): History[] {
  return realtokens
    .map((realtoken) =>
      realtoken.history.slice(1).map((item) => ({
        id: `${realtoken.id}-${item.date}`,
        date: item.date,
        realtoken,
        values: item.values,
      })),
    )
    .flat()
    .filter((history) => {
      const isValueChange =
        Object.hasOwn(history.values, 'tokenPrice') &&
        Object.hasOwn(history.values, 'underlyingAssetPrice')

      const isRentChange =
        Object.hasOwn(history.values, 'netRentYear') &&
        Object.hasOwn(history.values, 'grossRentYear')

      return isValueChange || isRentChange
    })
    .sort((a, b) => b.date.localeCompare(a.date))
}

const HistoriesPage: NextPage = () => {
  const { t } = useTranslation('common', { keyPrefix: 'historiesPage' })
  const router = useRouter()
  const [page, setPage] = useState<number>(1)
  const pageSize = 25

  const isLoading = useSelector(selectIsLoading)
  const realtokens = useSelector(selectUserRealtokens)
  const ownedRealtokens = useSelector(selectOwnedRealtokens)
  const allHistories = getUsefullHistories(realtokens)
  const [filter, setFilter] = useState<HistoryFilter>(HistoryFilter.owned)

  const histories = useMemo(() => {
    const filterFunction = getHistoryFilterFunction(ownedRealtokens, filter)
    return allHistories.filter(filterFunction)
  }, [allHistories, filter])

  function onPageChange(page: number) {
    setPage(page)
    // Scroll to top of grid
    document.getElementsByClassName('history-list')[0]?.scrollIntoView()
  }

  const paginationHistories: History[] = useMemo(() => {
    const start = (page - 1) * pageSize
    const end = start + pageSize
    return histories.slice(start, end)
  }, [histories, page, pageSize])

  if (!realtokens.length || !histories.length) {
    return <div>{isLoading ? 'Loading...' : 'Histories not found'}</div>
  }

  return (
    <Flex my={'lg'} mx={0} direction={'column'} align={'center'}>
      <div
        style={{ maxWidth: '450px', width: '100%' }}
        className={'history-list'}
      >
        <Breadcrumbs>
          <Anchor onClick={() => router.push('/')}>{t('home')}</Anchor>
          {t('title')}
        </Breadcrumbs>
        <h2 style={{ textAlign: 'center' }}>
          {`${t('title')} (${histories.length})`}
        </h2>

        <HistoryFilterField filter={filter} onChange={setFilter} />

        <div style={{ width: '100%', marginTop: '20px' }}>
          {paginationHistories.map((history) => (
            <div key={history.id} style={{ marginBottom: '20px' }}>
              <HistoryItem history={history} />
            </div>
          ))}
        </div>
      </div>
      <Group
        justify={'center'}
        align={'center'}
        gap={8}
        py={'xs'}
        style={{ width: '100%' }}
      >
        <Pagination
          value={page}
          total={Math.ceil(histories.length / pageSize)}
          boundaries={1}
          siblings={1}
          size={'sm'}
          onChange={onPageChange}
        />
      </Group>
    </Flex>
  )
}

HistoriesPage.displayName = 'HistoriesPage'

export default HistoriesPage
