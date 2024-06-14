import { FC, useEffect, useMemo, useState } from 'react'

import { useRouter } from 'next/router'

import {
  Combobox,
  Grid,
  Group,
  InputBase,
  Pagination,
  useCombobox,
} from '@mantine/core'

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

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  })

  const values = [24, 48, 96, 192, 384, 768, 1536]

  const [search, setSearch] = useState('')
  const [value, setValue] = useState<string | null>('24')
  const [data, setData] = useState<string[]>(
    values.map((item) => item.toString()),
  )

  const exactOptionMatch = data.some((item) => item === search)
  const filteredOptions = exactOptionMatch
    ? data
    : data.filter((item) =>
        item.toLowerCase().includes(search.toLowerCase().trim()),
      )
  const options = filteredOptions.map((item) => (
    <Combobox.Option value={item} key={item}>
      {item}
    </Combobox.Option>
  ))

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
        <Combobox
          store={combobox}
          withinPortal={false}
          onOptionSubmit={(val) => {
            if (val === '$create') {
              setData((current) => [...current, search])
              setValue(search)
            } else {
              setValue(val)
              setSearch(val)
            }

            combobox.closeDropdown()
          }}
        >
          <Combobox.Target>
            <InputBase
              rightSection={<Combobox.Chevron />}
              value={search}
              onChange={(event) => {
                combobox.openDropdown()
                combobox.updateSelectedOptionIndex()
                setSearch(event.currentTarget.value)
              }}
              onClick={() => combobox.openDropdown()}
              onFocus={() => combobox.openDropdown()}
              onBlur={() => {
                combobox.closeDropdown()
                setSearch(value || '')
              }}
              placeholder={'Search value'}
              rightSectionPointerEvents={'none'}
            />
          </Combobox.Target>

          <Combobox.Dropdown>
            <Combobox.Options>{options}</Combobox.Options>
          </Combobox.Dropdown>
        </Combobox>
      </Group>
    </>
  )
}
