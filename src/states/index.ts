import { atomWithStorage } from 'jotai/utils'

import {
  AssetRentStatusType,
  AssetRmmStatusType,
  AssetSortType,
  AssetSubsidyType,
  AssetUserProtocolType,
  AssetUserStatusType,
  AssetViewType,
} from 'src/components/assetsView/types'

export const assetViewChoosedAtom = atomWithStorage<AssetViewType>(
  'displayChoosed',
  AssetViewType.GRID,
)

export interface AssetsViewFilterType {
  sortBy: AssetSortType
  sortReverse: boolean
  subsidy: AssetSubsidyType
  userStatus: AssetUserStatusType
  rentStatus: AssetRentStatusType
  rmmStatus: AssetRmmStatusType
  userProtocol: AssetUserProtocolType
}

export const assetsViewDefaultFilter: AssetsViewFilterType = {
  sortBy: AssetSortType.VALUE,
  sortReverse: false,
  subsidy: AssetSubsidyType.ALL,
  userStatus: AssetUserStatusType.OWNED,
  rentStatus: AssetRentStatusType.ALL,
  rmmStatus: AssetRmmStatusType.ALL,
  userProtocol: AssetUserProtocolType.ALL,
}

export const assetsViewFilterAtom = atomWithStorage<AssetsViewFilterType>(
  'assetsViewFilter',
  assetsViewDefaultFilter,
)
