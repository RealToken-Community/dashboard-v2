import { FC, useEffect, useMemo, useState } from 'react'

import { useRouter } from 'next/router'

import { Grid, Group, Pagination } from '@mantine/core'

import { UserRealtoken } from 'src/store/features/wallets/walletsSelector'

import { AssetCard } from '../../cards'

export const AssetGrid: FC<{ realtokens: UserRealtoken[] }> = (props) => {
  const router = useRouter()
  const [page, setPage] = useState<number>(1)
  const pageSize = 24

  function onPageChange(page: number) {
    setPage(page)
    // Scroll to top of grid
    document.getElementsByClassName('asset-grid')[0]?.scrollIntoView()
  }

  const paginationOffers: UserRealtoken[] = useMemo(() => {
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
          <Grid.Col key={item.id} span={{ base: 12, sm: 6, lg: 4, xl: 3 }}>
            <AssetCard
              value={item}
              onClick={(id) => router.push(`/asset/${id}`)}
            />
          </Grid.Col>
        ))}
      </Grid>
      <Group
        justify={'center'}
        align={'center'}
        gap={8}
        p={'xs'}
        style={{ width: '100%' }}
      >
        <Pagination
          value={page}
          total={Math.ceil(props.realtokens.length / pageSize)}
          boundaries={1}
          siblings={1}
          size={'sm'}
          onChange={onPageChange}
        />
      </Group>
    </>
  )
}
