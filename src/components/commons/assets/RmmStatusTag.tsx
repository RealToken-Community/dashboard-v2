import { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { Badge } from '@mantine/core'

export const RmmStatusTag: FC = () => {
  const { t } = useTranslation('common', { keyPrefix: 'assetCard' })

  return (
    <Badge size={'xs'} variant={'dot'}>
      {t('isRmmAvailable')}
    </Badge>
  )
}
RmmStatusTag.displayName = 'RmmStatusTag'
