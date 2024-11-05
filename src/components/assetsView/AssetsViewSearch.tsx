import { FC, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { TextInput } from '@mantine/core'

import {
  OtherRealtoken,
  UserRealtoken,
} from 'src/store/features/wallets/walletsSelector'

import { useInputStyles } from '../inputs/useInputStyles'

interface AssetsViewSearchProps {
  value: string
  onChange: (event: string) => void
}
export const AssetsViewSearch: FC<AssetsViewSearchProps> = (props) => {
  const { t } = useTranslation('common', { keyPrefix: 'assetView' })
  const { classes: inputClasses } = useInputStyles()

  return (
    <TextInput
      label={t('search')}
      value={props.value}
      size={'xs'}
      onChange={(event) => props.onChange(event.currentTarget.value)}
      style={{ width: '100%' }}
      classNames={inputClasses}
    />
  )
}
AssetsViewSearch.displayName = 'AssetsViewSearch'

export function useAssetsViewSearch() {
  const [assetSearch, setAssetSearch] = useState('')

  const cleanSearch = useMemo(
    () => assetSearch.trim().toLowerCase(),
    [assetSearch],
  )

  function assetSearchFunction(asset: UserRealtoken | OtherRealtoken) {
    return (
      !cleanSearch ||
      asset?.shortName?.toLowerCase().includes(cleanSearch) ||
      asset?.fullName?.toLowerCase().includes(cleanSearch)
    )
  }

  const assetSearchProps = {
    value: assetSearch,
    onChange: (value: string) => setAssetSearch(value),
  }

  return {
    assetSearchFunction,
    assetSearchProps,
  }
}
