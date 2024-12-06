import { FC } from 'react'
import { Grid } from '@mantine/core'

import {
  OtherRealtoken,
  UserRealtoken,
} from 'src/store/features/wallets/walletsSelector'

import { AssetsViewSearch, useAssetsViewSearch } from './AssetsViewSearch'
import { AssetsViewSelect, useAssetsViewSelect } from './assetsViewSelect'
import { AssetsViewFilterButton } from './filters/AssetsViewFilterButton'
import { RealtimeIndicator } from './indicators/RealtimeIndicator'
import { AssetViewType } from './types'
import { AssetGrid, AssetTable } from './views'

interface AssetsViewProps {
  allAssetsData: (UserRealtoken | OtherRealtoken)[];
}

export const AssetsView: FC<AssetsViewProps> = ({ allAssetsData }) => {
  const { assetSearchProps } = useAssetsViewSearch()
  const { choosenAssetView } = useAssetsViewSelect()

  return allAssetsData.length ? (
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
        <AssetTable key={'table'} realtokens={allAssetsData} />
      )}
      {choosenAssetView == AssetViewType.GRID && (
        <AssetGrid key={'grid'} realtokens={allAssetsData} />
      )}
    </>
  ) : null
}
AssetsView.displayName = 'AssetsView'
