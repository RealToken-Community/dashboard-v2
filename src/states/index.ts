import { atomWithStorage } from 'jotai/utils'

import {
  AssetSortType,
  AssetSubsidyType,
  AssetUserStatusType,
  AssetViewType,
} from 'src/components/assetsView/types'

export const assetViewChoosedAtom = atomWithStorage<AssetViewType>(
  'displayChoosed',
  AssetViewType.GRID
)

export interface AssetsViewFilterType {
  sortBy: AssetSortType
  sortReverse: boolean
  subsidy: AssetSubsidyType
  userStatus: AssetUserStatusType
}

export const assetsViewDefaultFilter: AssetsViewFilterType = {
  sortBy: AssetSortType.VALUE,
  sortReverse: false,
  subsidy: AssetSubsidyType.ALL,
  userStatus: AssetUserStatusType.OWNED,
}

export const assetsViewFilterAtom = atomWithStorage<AssetsViewFilterType>(
  'assetsViewFilter',
  assetsViewDefaultFilter
)
