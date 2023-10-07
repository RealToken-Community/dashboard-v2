import { FC, useEffect, useMemo, useState } from 'react'

import { Grid, Group, Pagination } from '@mantine/core'

import useEURUSDRate from 'src/store/features/rates/useEURUSDRate'
import { OwnedRealtoken } from 'src/store/features/wallets/walletsSelector'

import { AssetCard } from '../../cards'

export const AssetGrid: FC<{ realtokens: OwnedRealtoken[] }> = (props) => {
  const eURUSDRate = useEURUSDRate()
  const [page, setPage] = useState<number>(1)
  const pageSize = 24

  function onPageChange(page: number) {
    setPage(page)
    // Scroll to top of grid
    document.getElementsByClassName('asset-grid')[0]?.scrollIntoView()
  }

  const paginationOffers: OwnedRealtoken[] = useMemo(() => {
    const start = (page - 1) * pageSize
    const end = start + pageSize
    return props.realtokens.slice(start, end)
  }, [props.realtokens, page, pageSize])

  // Go to first page when data changes (e.g. search, filter, order, ...)
  useEffect(() => setPage(1), [props.realtokens])

  return (
    <>
      <Grid className={'asset-grid'}>
        {paginationOffers.map((item) => (
          <Grid.Col key={item.id} span={12} sm={6} lg={4} xl={3}>
            <AssetCard value={item} eurusdrate={eURUSDRate} />
          </Grid.Col>
        ))}
      </Grid>
      <Group
        position={'center'}
        align={'center'}
        spacing={8}
        p={'sm'}
        style={{ width: '100%' }}
      >
        <Pagination
          page={page}
          total={Math.ceil(props.realtokens.length / pageSize)}
          boundaries={1}
          siblings={1}
          onChange={onPageChange}
        />
      </Group>
    </>
  )
}
