import { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { Badge } from '@mantine/core'

import { OwnedRealtoken } from 'src/store/features/wallets/walletsSelector'

export const SubsidyStatusTag: FC<{ value: OwnedRealtoken }> = (props) => {
  const { t } = useTranslation('common', { keyPrefix: 'assetCard' })
  const { subsidyStatus } = props.value;

  switch (subsidyStatus) {
    case 'yes':
      return (
        <Badge size={'xs'} variant={'dot'} color={'blue'}>
          {t('subsidyStatus.full')}
        </Badge>
      )
    case 'partial':
      return (
        <Badge size={'xs'} variant={'filled'} color={'cyan.4'}>
          {t('subsidyStatus.partial')}
        </Badge>
      )
    default:
      return (<></>)
  }
}
SubsidyStatusTag.displayName = 'SubsidyStatusTag'
