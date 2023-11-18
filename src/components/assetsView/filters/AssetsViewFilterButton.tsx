import { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@mantine/core'
import { useModals } from '@mantine/modals'

export const AssetsViewFilterButton: FC = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'assetsViewFilterButton',
  })
  const modals = useModals()

  function openModal() {
    modals.openContextModal('assetsViewFilterModal', { innerProps: {} })
  }
  return (
    <Button variant={'subtle'} onClick={openModal}>
      {t('filter')}
    </Button>
  )
}
