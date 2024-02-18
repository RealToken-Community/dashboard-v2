import { FC, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button, Flex, Stack } from '@mantine/core'
import { ContextModalProps } from '@mantine/modals'

import { useAtom } from 'jotai'

import {
  AssetsViewFilterType,
  assetsViewDefaultFilter,
  assetsViewFilterAtom,
} from 'src/states'

import { AssetsViewRentStatusFilter } from './AssetsViewRentStatusFilter'
import { AssetsViewRmmStatusFilter } from './AssetsViewRmmStatusFilter'
import { AssetsViewSort } from './AssetsViewSort'
import { AssetsViewSubsidyFilter } from './AssetsViewSubsidyFilter'
import { AssetsViewUserProtocolFilter } from './AssetsViewUserProtocolFilter'
import { AssetsViewUserStatusFilter } from './AssetsViewUserStatusFilter'

const ResetFilterButton: FC<{ onClick?: () => void }> = ({ onClick }) => {
  const { t } = useTranslation('common', { keyPrefix: 'assetsViewFilterModal' })
  const [currentFilter, applyFilter] = useAtom(assetsViewFilterAtom)
  function reset() {
    applyFilter({
      ...assetsViewDefaultFilter,
      sortBy: currentFilter.sortBy,
      sortReverse: currentFilter.sortReverse,
    })
    onClick?.()
  }

  return (
    <Button onClick={reset} variant={'subtle'}>
      {t('resetFilter')}
    </Button>
  )
}

export const AssetsViewFilterModal: FC<ContextModalProps> = ({
  context,
  id,
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'assetsViewFilterModal' })

  const [currentFilter, applyFilter] = useAtom(assetsViewFilterAtom)
  const activeFilter = Object.assign({}, assetsViewDefaultFilter, currentFilter)
  const [filterModel, setFilterModel] =
    useState<AssetsViewFilterType>(activeFilter)

  const onClose = useCallback(() => {
    context.closeModal(id)
  }, [context, id])

  const onSubmit = () => {
    applyFilter(filterModel)
    onClose()
  }

  return (
    <Stack
      justify={'space-between'}
      style={{ width: '500px', maxWidth: '100%' }}
    >
      <Flex direction={'column'} gap={'xs'} style={{ width: '100%' }}>
        <AssetsViewSort
          filter={filterModel}
          onChange={(value) => {
            setFilterModel({ ...filterModel, ...value })
          }}
        />
        <AssetsViewUserStatusFilter
          filter={filterModel}
          onChange={(value) => {
            setFilterModel({ ...filterModel, ...value })
          }}
        />
        <AssetsViewUserProtocolFilter
          filter={filterModel}
          onChange={(value) => {
            setFilterModel({ ...filterModel, ...value })
          }}
        />
        <AssetsViewRentStatusFilter
          filter={filterModel}
          onChange={(value) => {
            setFilterModel({ ...filterModel, ...value })
          }}
        />
        <AssetsViewSubsidyFilter
          filter={filterModel}
          onChange={(value) => {
            setFilterModel({ ...filterModel, ...value })
          }}
        />
        <AssetsViewRmmStatusFilter
          filter={filterModel}
          onChange={(value) => {
            setFilterModel({ ...filterModel, ...value })
          }}
        />
      </Flex>
      <Flex justify={'space-between'}>
        <ResetFilterButton onClick={onClose} />
        <div>
          <Flex gap={'sm'}>
            <Button onClick={onClose} variant={'subtle'}>
              {t('close')}
            </Button>
            <Button onClick={onSubmit}>{t('submit')}</Button>
          </Flex>
        </div>
      </Flex>
    </Stack>
  )
}

AssetsViewFilterModal.displayName = 'AssetsViewFilterModal'
