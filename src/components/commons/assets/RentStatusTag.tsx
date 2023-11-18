import { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { Badge } from '@mantine/core'

import { UserRealtoken } from 'src/store/features/wallets/walletsSelector'

export const RentStatusTag: FC<{ value: UserRealtoken }> = (props) => {
  const { t } = useTranslation('common', { keyPrefix: 'assetCard' })

  switch (props.value.rentStatus) {
    case 'full':
      return (
        <Badge size={'xs'} variant={'dot'} color={'green'}>
          {t('rentStatus.full')}
        </Badge>
      )
    case 'partial':
      return (
        <Badge size={'xs'} variant={'filled'} color={'orange'}>
          {t('rentStatus.partial')}
        </Badge>
      )
    default:
      return (
        <Badge size={'xs'} variant={'filled'} color={'red'}>
          {t('rentStatus.none')}
        </Badge>
      )
  }
}
RentStatusTag.displayName = 'RentStatusTag'
