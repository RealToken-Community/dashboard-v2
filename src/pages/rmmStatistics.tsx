import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useRouter } from 'next/router'

import {
  Anchor,
  Breadcrumbs,
  Button,
  Card,
  Flex,
  Group,
  SimpleGrid,
} from '@mantine/core'

import {
  RmmDailyStats,
  RmmMetric,
  RmmStatisticsResult,
  getRmmStatistics,
} from 'src/repositories'

const DAYS_WINDOW = 7
const amountFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

type SeriesKey = 'supply' | 'withdraw' | 'borrow' | 'repay' | 'liquidation'

const SERIES: { key: SeriesKey; color: string }[] = [
  { key: 'supply', color: '#2fa66f' },
  { key: 'repay', color: '#3b82f6' },
  { key: 'liquidation', color: '#d9469f' },
  { key: 'withdraw', color: '#f97316' },
  { key: 'borrow', color: '#d4a017' },
]

function ChartBars({
  days,
  onHoverDay,
  onMove,
}: {
  days: RmmDailyStats[]
  onHoverDay: (day: RmmDailyStats | null) => void
  onMove: (position: { x: number; y: number }) => void
}) {
  const maxValue = useMemo(() => {
    const all = days.flatMap((day) => [
      day.supply.amount,
      day.withdraw.amount,
      day.borrow.amount,
      day.repay.amount,
      day.liquidation.amount,
    ])
    return Math.max(1, ...all)
  }, [days])

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${days.length}, minmax(90px, 1fr))`,
        gap: '12px',
        alignItems: 'end',
        marginBottom: '14px',
      }}
    >
      {days.map((day) => (
        <div
          key={day.date}
          style={{ textAlign: 'center' }}
          onMouseEnter={() => onHoverDay(day)}
          onMouseLeave={() => onHoverDay(null)}
          onMouseMove={(event) =>
            onMove({ x: event.clientX, y: event.clientY })
          }
        >
          <div
            style={{
              height: '170px',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            {SERIES.map((serie) => {
              const value = day[serie.key].amount
              const height = Math.max(2, Math.round((value / maxValue) * 160))
              return (
                <div
                  key={serie.key}
                  style={{
                    width: '10px',
                    height: `${height}px`,
                    borderRadius: '5px',
                    background: serie.color,
                  }}
                  title={`${serie.key}: ${value}`}
                />
              )
            })}
          </div>
          <div style={{ marginTop: '8px', fontSize: '13px' }}>
            {day.date.slice(5)}
          </div>
        </div>
      ))}
    </div>
  )
}

const RmmStatisticsPage = () => {
  const router = useRouter()
  const { t } = useTranslation('common', { keyPrefix: 'rmmStatisticsPage' })

  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [statistics, setStatistics] = useState<RmmStatisticsResult | null>(null)
  const [windowOffset, setWindowOffset] = useState(0)
  const [hoveredDay, setHoveredDay] = useState<RmmDailyStats | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const TOOLTIP_WIDTH = 280
  const TOOLTIP_GAP = 14
  const VIEWPORT_MARGIN = 8

  useEffect(() => {
    const hasPreviousData = !!statistics
    if (hasPreviousData) {
      setIsRefreshing(true)
    } else {
      setIsLoading(true)
    }
    setError(null)
    getRmmStatistics(DAYS_WINDOW, windowOffset)
      .then((result) => {
        setStatistics(result)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Unknown error')
      })
      .finally(() => {
        setIsLoading(false)
        setIsRefreshing(false)
      })
  }, [windowOffset])

  const formatAmount = (value: number) =>
    `${amountFormatter.format(value).replaceAll(',', ' ')} $`
  const formatSigned = (value: number) => {
    if (Math.abs(value) < 1e-9) return formatAmount(0)
    const sign = value > 0 ? '+' : '-'
    return `${sign}${formatAmount(Math.abs(value))}`
  }

  const formatMetric = (metric: RmmMetric) =>
    `${formatAmount(metric.amount)} (${metric.txCount} ${t('tx')})`

  const handleTooltipMove = (mouse: { x: number; y: number }) => {
    let x = mouse.x + TOOLTIP_GAP
    let y = mouse.y + TOOLTIP_GAP

    if (typeof window !== 'undefined') {
      if (x + TOOLTIP_WIDTH > window.innerWidth - VIEWPORT_MARGIN) {
        x = mouse.x - TOOLTIP_WIDTH - TOOLTIP_GAP
      }
      if (x < VIEWPORT_MARGIN) {
        x = VIEWPORT_MARGIN
      }
      const maxY = window.innerHeight - 260
      if (y > maxY) {
        y = maxY
      }
      if (y < VIEWPORT_MARGIN) {
        y = VIEWPORT_MARGIN
      }
    }

    setTooltipPosition({ x, y })
  }

  const cumulativeNetByDate = useMemo(() => {
    if (!statistics) return {}
    let running = 0
    const result: Record<string, number> = {}
    statistics.days.forEach((day) => {
      running += day.net
      result[day.date] = running
    })
    return result
  }, [statistics])

  if (isLoading && !statistics) {
    return <div>{t('loading')}</div>
  }

  if (error) {
    return <div>{`${t('error')}: ${error}`}</div>
  }

  if (!statistics) {
    return <div>{t('noData')}</div>
  }

  const windowRange = `${statistics.period.startDate} -> ${statistics.period.endDate}`

  return (
    <Flex my={'lg'} mx={0} direction={'column'} align={'center'}>
      <div style={{ maxWidth: '1200px', width: '100%' }}>
        <Breadcrumbs>
          <Anchor onClick={() => router.push('/')}>{t('home')}</Anchor>
          {t('title')}
        </Breadcrumbs>

        <h2 style={{ textAlign: 'center' }}>{t('title')}</h2>
        <p
          style={{ textAlign: 'center' }}
        >{`${t('window')}: ${windowRange}`}</p>

        <SimpleGrid cols={{ base: 1, sm: 2, md: 5 }} spacing={'sm'} mt={'md'}>
          <Card withBorder={true} radius={'md'} p={'sm'}>
            <div>{t('cards.supply')}</div>
            <strong>{formatMetric(statistics.totals.supply)}</strong>
          </Card>
          <Card withBorder={true} radius={'md'} p={'sm'}>
            <div>{t('cards.withdraw')}</div>
            <strong>{formatMetric(statistics.totals.withdraw)}</strong>
          </Card>
          <Card withBorder={true} radius={'md'} p={'sm'}>
            <div>{t('cards.borrow')}</div>
            <strong>{formatMetric(statistics.totals.borrow)}</strong>
          </Card>
          <Card withBorder={true} radius={'md'} p={'sm'}>
            <div>{t('cards.repay')}</div>
            <strong>{formatMetric(statistics.totals.repay)}</strong>
          </Card>
          <Card withBorder={true} radius={'md'} p={'sm'}>
            <div>{t('cards.liquidation')}</div>
            <strong>{formatMetric(statistics.totals.liquidation)}</strong>
          </Card>
        </SimpleGrid>

        <Group justify={'space-between'} mt={'xl'} mb={'sm'}>
          <strong>{t('dailyTitle')}</strong>
          <Group gap={'xs'}>
            <Button
              variant={'default'}
              loading={isRefreshing}
              onClick={() => setWindowOffset((value) => value + 1)}
            >
              {t('previous')}
            </Button>
            <Button
              variant={'default'}
              loading={isRefreshing}
              disabled={statistics.period.isCurrentWindow}
              onClick={() => setWindowOffset((value) => Math.max(0, value - 1))}
            >
              {t('next')}
            </Button>
          </Group>
        </Group>
        {isRefreshing ? (
          <div style={{ marginBottom: '10px', fontSize: '13px', opacity: 0.8 }}>
            {t('loading')}
          </div>
        ) : null}

        <Card withBorder={true} radius={'md'} p={'md'} mb={'md'}>
          <div style={{ position: 'relative' }}>
            {hoveredDay ? (
              <div
                style={{
                  position: 'fixed',
                  left: tooltipPosition.x,
                  top: tooltipPosition.y,
                  zIndex: 9999,
                  pointerEvents: 'none',
                  background: '#17213c',
                  color: '#fff',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  minWidth: '260px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: '8px' }}>
                  {hoveredDay.date}
                </div>
                <div>{`${t('columns.supply')}: ${formatSigned(
                  hoveredDay.supply.amount,
                )}`}</div>
                <div>{`${t('columns.withdraw')}: ${formatSigned(
                  -hoveredDay.withdraw.amount,
                )}`}</div>
                <div>{`${t('columns.borrow')}: ${formatSigned(
                  -hoveredDay.borrow.amount,
                )}`}</div>
                <div>{`${t('columns.repay')}: ${formatSigned(
                  hoveredDay.repay.amount,
                )}`}</div>
                <div>{`${t('columns.liquidation')}: ${formatSigned(
                  hoveredDay.liquidation.amount,
                )}`}</div>
                <div>{`${t('columns.net')}: ${formatSigned(hoveredDay.net)}`}</div>
                <div>{`${t('columns.diffLiquidity')}: ${formatSigned(
                  cumulativeNetByDate[hoveredDay.date] ?? 0,
                )}`}</div>
              </div>
            ) : null}
            <ChartBars
              days={statistics.days}
              onHoverDay={setHoveredDay}
              onMove={handleTooltipMove}
            />
          </div>
          <Group gap={'md'}>
            {SERIES.map((serie) => (
              <Group key={serie.key} gap={6}>
                <div
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: serie.color,
                  }}
                />
                <span style={{ fontSize: '13px' }}>
                  {t(`columns.${serie.key}`)}
                </span>
              </Group>
            ))}
          </Group>
        </Card>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left' }}>
                <th>{t('columns.date')}</th>
                <th>{t('columns.supply')}</th>
                <th>{t('columns.withdraw')}</th>
                <th>{t('columns.borrow')}</th>
                <th>{t('columns.repay')}</th>
                <th>{t('columns.liquidation')}</th>
                <th>{t('columns.net')}</th>
              </tr>
            </thead>
            <tbody>
              {statistics.days.map((day) => (
                <tr key={day.date}>
                  <td>{day.date}</td>
                  <td>{formatMetric(day.supply)}</td>
                  <td>{formatMetric(day.withdraw)}</td>
                  <td>{formatMetric(day.borrow)}</td>
                  <td>{formatMetric(day.repay)}</td>
                  <td>{formatMetric(day.liquidation)}</td>
                  <td>{formatAmount(day.net)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Flex>
  )
}

export default RmmStatisticsPage
