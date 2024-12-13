import { FC, useMemo } from 'react'

import { Grid } from '@mantine/core'

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

  // Apply search and filter functions
  const filteredData = useMemo(() => {
    const filteredAssets = assetsViewFilterFunction(
      assetsData.filter(assetSearchFunction),
    )
    return filteredAssets
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
