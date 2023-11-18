import { FC, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { TextInput } from '@mantine/core'

import { UserRealtoken } from 'src/store/features/wallets/walletsSelector'

import { useInputStyles } from '../inputs/useInputStyles'

interface AssetsSearchProps {
  value: string
  onChange: (event: string) => void
}
export const AssetsSearch: FC<AssetsSearchProps> = (props) => {
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
AssetsSearch.displayName = 'AssetsSearch'

export function useAssetsSearch() {
  const [assetSearch, setAssetSearch] = useState('')

  const cleanSearch = useMemo(
    () => assetSearch.trim().toLowerCase(),
    [assetSearch]
  )

  function assetSearchFunction(realtoken: UserRealtoken) {
    return (
      !cleanSearch ||
      realtoken.shortName.toLowerCase().includes(cleanSearch) ||
      realtoken.fullName.toLowerCase().includes(cleanSearch)
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
