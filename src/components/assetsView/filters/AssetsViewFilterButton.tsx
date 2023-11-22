import { FC, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button, Indicator } from '@mantine/core'
import { useModals } from '@mantine/modals'

import { useAtom } from 'jotai'
import { isEqual as _isEqual } from 'lodash'

import { assetsViewDefaultFilter, assetsViewFilterAtom } from 'src/states'

export const AssetsViewFilterButton: FC = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'assetsViewFilterButton',
  })
  const modals = useModals()
  const [currentFilter] = useAtom(assetsViewFilterAtom)
  const [hasActiveFilter, setHasActiveFilter] = useState(false)

  useEffect(() => {
    setHasActiveFilter(!_isEqual(currentFilter, assetsViewDefaultFilter))
  })

  function openModal() {
    modals.openContextModal('assetsViewFilterModal', { innerProps: {} })
  }
  return (
    <div>
      <Indicator inline={true} color={'red'} disabled={!hasActiveFilter}>
        <Button variant={'subtle'} onClick={openModal} compact={true}>
          {t('filter')}
        </Button>
      </Indicator>
    </div>
  )
}
