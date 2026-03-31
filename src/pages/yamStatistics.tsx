import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

import { useRouter } from 'next/router'

import {
  Anchor,
  Breadcrumbs,
  Divider,
  Flex,
  Group,
  Pagination,
  Select,
} from '@mantine/core'

import { AssetSubsidyType } from 'src/components/assetsView'
import { useInputStyles } from 'src/components/inputs/useInputStyles'
import { useCurrencyValue } from 'src/hooks/useCurrencyValue'
import { GetYamStatistics, YamStatistics } from 'src/repositories'
import {
  UserRealtoken,
  selectAllUserRealtokens,
} from 'src/store/features/wallets/walletsSelector'

const YamStatisticsRow: React.FC<{
  statistics: YamStatistics
  realtoken: UserRealtoken | null
}> = ({ statistics, realtoken }) => {
  if (!realtoken) return null
  const { t: tNumbers } = useTranslation('common', { keyPrefix: 'numbers' })
  const yamPrice = statistics.volume / statistics.quantity
  const yamDifference = yamPrice - realtoken.tokenPrice
  const yamDifferencePercent = (yamDifference / realtoken.tokenPrice) * 100

  const fallback = '-'
  const tokenPriceValue = useCurrencyValue(realtoken.tokenPrice, fallback)
  const yamPriceValue = useCurrencyValue(yamPrice, fallback)
  const yamDifferenceValue = useCurrencyValue(yamDifference, fallback)
  const volumeValue = useCurrencyValue(statistics.volume, fallback)

  return yamPriceValue !== fallback ? (
    <>
      <tr key={realtoken.id}>
        <td>{realtoken.shortName}</td>
        <td>{tokenPriceValue}</td>
        <td>{yamPriceValue}</td>
        <td>
          {yamDifferenceValue} {'('}
          {tNumbers('percent', { value: yamDifferencePercent })}
          {')'}
        </td>
        <td>{volumeValue}</td>
      </tr>

      <tr>
        <td colSpan={5}>
          <Divider my={'xs'} />
        </td>
      </tr>
    </>
  ) : null
}

const YamStatisticsPage = () => {
  const { t } = useTranslation('common', { keyPrefix: 'yamStatisticsPage' })
  const router = useRouter()
  const realtokens = useSelector(selectAllUserRealtokens)
  const realtokensWithYam = useMemo(() => {
    return realtokens.filter(
      (realtoken) => realtoken.blockchainAddresses.xDai.contract,
    )
  }, [realtokens])

  const [yamStatistics, setYamStatistics] = useState<YamStatistics[]>(
    realtokensWithYam.map(() => {
      return {
        quantity: 0,
        volume: 0,
        days: [],
      }
    }),
  )
  const [page, setPage] = useState<number>(1)
  const pageSize = 100

  const [currentFilter, setCurrentFilter] =
    useState<YamStatisticsPageFilterValue>('owned')
  const filteredRealtokens = useMemo(() => {
    return getFilteredRealtokens(currentFilter, realtokensWithYam)
  }, [realtokensWithYam, currentFilter])

  const [isLoading, setIsLoading] = useState(true)

  function onPageChange(page: number) {
    setPage(page)
    // Scroll to top of grid
    document.getElementsByClassName('history-list')[0]?.scrollIntoView()
  }

  const yamStatisticsPromise: Promise<YamStatistics[]> = useMemo(async () => {
    if (!filteredRealtokens.length) return Promise.resolve([])

    const statsPromises = filteredRealtokens.map((realtoken) =>
      GetYamStatistics({ realtoken }),
    )
    const data = await Promise.all(statsPromises)
    return data
  }, [filteredRealtokens, currentFilter])

  useEffect(() => {
    setIsLoading(true)
    yamStatisticsPromise.then((data) => {
      setYamStatistics(data)
      setIsLoading(false)
    })
  }, [yamStatisticsPromise])

  const paginationYamStatistics: YamStatistics[] = useMemo(() => {
    const start = (page - 1) * pageSize
    const end = start + pageSize
    return yamStatistics.slice(start, end)
  }, [yamStatistics, page, pageSize])

  if (isLoading) {
    return <div>{'Loading...'}</div>
  }

  return (
    <Flex my={'lg'} mx={0} direction={'column'} align={'center'}>
      <div
        style={{ maxWidth: '900px', width: '100%' }}
        className={'history-list'}
      >
        <Breadcrumbs>
          <Anchor onClick={() => router.push('/')}>{t('home')}</Anchor>
          {t('title')}
        </Breadcrumbs>
        <h2 style={{ textAlign: 'center' }}>{`${t('title')}`}</h2>

        <YamStatisticsPageFilter {...{ currentFilter, setCurrentFilter }} />

        <div style={{ width: '100%', marginTop: '20px' }}>
          <table style={{ width: '100%' }}>
            <tr style={{ textAlign: 'left' }}>
              <th>{t('columns.token')}</th>
              <th>{t('columns.tokenPrice')}</th>
              <th>{t('columns.yamPrice')}</th>
              <th>{t('columns.yamDifference')}</th>
              <th>{t('columns.yamVolume')}</th>
            </tr>
            {paginationYamStatistics.map((statistics, index) => (
              <YamStatisticsRow
                key={index}
                statistics={statistics}
                realtoken={
                  filteredRealtokens[index]?.tokenPrice
                    ? (filteredRealtokens[index] as UserRealtoken)
                    : null
                }
              />
            ))}
          </table>
          <Group
            justify={'center'}
            align={'center'}
            gap={8}
            py={'xs'}
            style={{ width: '100%' }}
          >
            <Pagination
              value={page}
              total={Math.ceil(yamStatistics.length / pageSize)}
              boundaries={1}
              siblings={1}
              size={'sm'}
              onChange={onPageChange}
            />
          </Group>
        </div>
      </div>
    </Flex>
  )
}

const getFilteredRealtokens = (
  filter: YamStatisticsPageFilterValue,
  realtokens: UserRealtoken[],
) => {
  switch (filter) {
    case 'all':
      return realtokens
    case 'owned':
      return realtokens.filter((realtoken) => realtoken.amount > 0)
    case AssetSubsidyType.SUBSIDIZED:
      return realtokens.filter((realtoken) => realtoken.subsidyStatus !== 'no')
    case AssetSubsidyType.FULLY_SUBSIDIZED:
      return realtokens.filter(
        (realtoken) =>
          realtoken.subsidyStatus === 'yes' && !!realtoken.subsidyStatusValue,
      )
    default:
      return realtokens
  }
}

type YamStatisticsPageFilterValue =
  | 'all'
  | 'owned'
  | AssetSubsidyType.SUBSIDIZED
  | AssetSubsidyType.FULLY_SUBSIDIZED
  | AssetSubsidyType.NOT_SUBSIDIZED

const YamStatisticsPageFilter = ({
  currentFilter,
  setCurrentFilter,
}: {
  currentFilter: YamStatisticsPageFilterValue
  setCurrentFilter: (value: YamStatisticsPageFilterValue) => void
}) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'yamStatisticsPage.filter',
  })
  const { classes: inputClasses } = useInputStyles()

  const filterOptions: {
    value: YamStatisticsPageFilterValue
    label: string
  }[] = [
    { value: 'all', label: t('all') },
    { value: 'owned', label: t('owned') },
    { value: AssetSubsidyType.SUBSIDIZED, label: t('subsidized') },
    { value: AssetSubsidyType.FULLY_SUBSIDIZED, label: t('fullySubsidized') },
    {
      value: AssetSubsidyType.NOT_SUBSIDIZED,
      label: t('notSubsidized'),
    },
  ]

  return (
    <Flex my={'lg'} mx={0} direction={'column'} align={'left'}>
      <div
        style={{ maxWidth: '450px', width: '100%' }}
        className={'history-list'}
      >
        <Select
          label={t('field')}
          data={filterOptions}
          value={currentFilter}
          onChange={(value) =>
            setCurrentFilter(value as YamStatisticsPageFilterValue)
          }
          classNames={inputClasses}
        />
      </div>
    </Flex>
  )
}

export default YamStatisticsPage
