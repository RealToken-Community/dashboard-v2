import { FC, useMemo } from 'react'
import { useSelector } from 'react-redux'

import { Flex, Grid } from '@mantine/core'

import { selectOwnedRealtokens } from 'src/store/features/wallets/walletsSelector'

import { AssetsSearch, useAssetsSearch } from './AssetsSearch'
import { AssetsSort, useAssetsSort } from './AssetsSort'
import {
  AssetsSubsidyFilter,
  useAssetsSubsidyFilter,
} from './AssetsSubsidyFilter'
import { AssetsViewSelect, useAssetsViewSelect } from './assetsViewSelect'
import { AssetViewType } from './types'
import { AssetGrid, AssetTable } from './views'

export const AssetsView: FC = () => {
  const { assetSortFunction } = useAssetsSort()
  const { assetSearchFunction, assetSearchProps } = useAssetsSearch()
  const { choosenAssetView } = useAssetsViewSelect()

  const realtokens = useSelector(selectOwnedRealtokens)

  const assetSubsidyFilterFunction = useAssetsSubsidyFilter()

  const data = useMemo(
    () =>
      realtokens
        .filter(assetSearchFunction)
        .filter(assetSubsidyFilterFunction)
        .sort(assetSortFunction),
    [
      realtokens,
      assetSearchFunction,
      assetSortFunction,
      assetSubsidyFilterFunction,
    ]
  )

  return (
    <>
      <Grid>
        <Grid.Col
          xs={12}
          sm={'content'}
          style={{ width: '300px', maxWidth: '100%' }}
        >
          <AssetsSearch {...assetSearchProps} />
        </Grid.Col>
        <Grid.Col span={'auto'}>
          <Flex align={'center'} gap={'sm'}>
            <AssetsSort />
          </Flex>
        </Grid.Col>
        <Grid.Col xs={12} sm={'content'}>
          <AssetsSubsidyFilter />
        </Grid.Col>
        <Grid.Col xs={12} sm={'content'}>
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
