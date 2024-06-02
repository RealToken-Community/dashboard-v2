import { FC, useMemo } from 'react'
import { useSelector } from 'react-redux'

import { Grid } from '@mantine/core'

import { selectUserRealtokens } from 'src/store/features/wallets/walletsSelector'

import { AssetsViewSearch, useAssetsViewSearch } from './AssetsViewSearch'
import { AssetsViewSelect, useAssetsViewSelect } from './assetsViewSelect'
import { AssetsViewFilterButton } from './filters/AssetsViewFilterButton'
import { useAssetsViewFilters } from './filters/useFilters'
import { RealtimeIndicator } from './indicators/RealtimeIndicator'
import { AssetViewType } from './types'
import { AssetGrid, AssetTable } from './views'

export const AssetsView: FC = () => {
  const { assetsViewFilterFunction } = useAssetsViewFilters()
  const { assetSearchFunction, assetSearchProps } = useAssetsViewSearch()
  const { choosenAssetView } = useAssetsViewSelect()

  const realtokens = useSelector(selectUserRealtokens)

  const data = useMemo(
    () => assetsViewFilterFunction(realtokens.filter(assetSearchFunction)),
    [realtokens, assetSearchFunction, assetsViewFilterFunction]
  )

  return (
    <>
      <Grid align={'center'}>
        <Grid.Col
          span={'auto'}
          sm={'content'}
          style={{ width: '300px', maxWidth: '100%' }}
        >
          <AssetsViewSearch {...assetSearchProps} />
        </Grid.Col>
        <Grid.Col span={'content'} sm={'auto'} pl={'0px'}>
          <AssetsViewFilterButton />
          <RealtimeIndicator />
        </Grid.Col>
        <Grid.Col span={12} sm={'content'}>
          <AssetsViewSelect />
        </Grid.Col>
      </Grid>

      {choosenAssetView == AssetViewType.TABLE && (
        <AssetTable key={'table'} realtokens={data} />
      )}
      {choosenAssetView == AssetViewType.GRID && (
        <AssetGrid key={'grid'} realtokens={data} />
      )}
    </>
  )
}
AssetsView.displayName = 'AssetsView'
