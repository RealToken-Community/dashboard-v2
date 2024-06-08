import { FC, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button, Indicator } from '@mantine/core'
import { useModals } from '@mantine/modals'

import { useAtom } from 'jotai'
import { isEqual as _isEqual, omit as _omit } from 'lodash'

import { assetsViewDefaultFilter, assetsViewFilterAtom } from 'src/states'

export const AssetsViewFilterButton: FC = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'assetsViewFilterButton',
  })
  const modals = useModals()
  const [currentFilter] = useAtom(assetsViewFilterAtom)
  const [hasActiveFilter, setHasActiveFilter] = useState(false)

  useEffect(() => {
    setHasActiveFilter(
      !_isEqual(
        _omit(currentFilter, 'sortBy', 'sortReverse'),
        _omit(assetsViewDefaultFilter, 'sortBy', 'sortReverse'),
      ),
    )
  })

  function openModal() {
    modals.openContextModal('assetsViewFilterModal', { innerProps: {} })
  }
  return (
    <Indicator inline={true} color={'red'} disabled={!hasActiveFilter}>
      <Button variant={'subtle'} onClick={openModal} size={'compact-md'}>
        {t('filter')}
      </Button>
    </Indicator>
  )
}
