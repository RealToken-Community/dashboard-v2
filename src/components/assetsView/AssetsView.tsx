import { FC, useMemo } from 'react'
import { useSelector } from 'react-redux'

import { Grid } from '@mantine/core'

import { selectUserIncludesOtherAssets } from 'src/store/features/settings/settingsSelector'
import {
  OtherRealtoken,
  UserRealtoken,
} from 'src/store/features/wallets/walletsSelector'

import { AssetsViewSearch, useAssetsViewSearch } from './AssetsViewSearch'
import { AssetsViewSelect, useAssetsViewSelect } from './assetsViewSelect'
import { AssetsViewFilterButton } from './filters/AssetsViewFilterButton'
import { useAssetsViewFilters } from './filters/useFilters'
import { RealtimeIndicator } from './indicators/RealtimeIndicator'
import { AssetViewType } from './types'
import { AssetGrid, AssetTable } from './views'

interface AssetsViewProps {
  allAssetsData: (UserRealtoken | OtherRealtoken)[]
}

export const AssetsView: FC<AssetsViewProps> = ({
  allAssetsData: assetsData,
}) => {
  const { assetsViewFilterFunction } = useAssetsViewFilters()
  const { assetSearchFunction, assetSearchProps } = useAssetsViewSearch()
  const { choosenAssetView } = useAssetsViewSelect()
  const showOtherAssets = useSelector(selectUserIncludesOtherAssets)

  // Check if asset is a UserRealtoken or OtherRealtoken
  const isOtherAsset = (asset: UserRealtoken | OtherRealtoken) => {
    return !asset.hasOwnProperty('rentStatus') // rely on rentStatus to determine if it's a UserRealtoken
  }

  // Apply search and filter functions
  const filteredData = useMemo(() => {
    // First filter by user advanced filters
    const advancedFilteredAssets = assetsViewFilterFunction(
      assetsData.filter(assetSearchFunction),
    )
    // Then filter out OtherRealtoken
    const othersAssetsFiltering = showOtherAssets
      ? advancedFilteredAssets
      : advancedFilteredAssets.filter((asset) => !isOtherAsset(asset))
    return othersAssetsFiltering
  }, [assetsData, assetSearchFunction, assetsViewFilterFunction])

  return assetsData.length ? (
    <>
      <Grid align={'center'}>
        <Grid.Col
          span={{ base: 'auto', sm: 'content' }}
          style={{ width: '300px', maxWidth: '100%' }}
        >
          <AssetsViewSearch {...assetSearchProps} />
        </Grid.Col>
        <Grid.Col span={{ base: 'content', sm: 'auto' }} pl={'0px'}>
          <AssetsViewFilterButton />
          <RealtimeIndicator />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 'content' }}>
          <AssetsViewSelect />
        </Grid.Col>
      </Grid>
      {choosenAssetView == AssetViewType.TABLE && (
        <AssetTable key={'table'} realtokens={filteredData} />
      )}
      {choosenAssetView == AssetViewType.GRID && (
        <AssetGrid key={'grid'} realtokens={filteredData} />
      )}
    </>
  ) : null
}
AssetsView.displayName = 'AssetsView'
