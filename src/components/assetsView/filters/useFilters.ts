import { useAtom } from 'jotai'

import { assetsViewDefaultFilter, assetsViewFilterAtom } from 'src/states'
import {
  RWARealtoken,
  UserRealtoken,
} from 'src/store/features/wallets/walletsSelector'

import { useAssetsViewProductTypeFilter } from './AssetsViewFilterType'
import { useAssetsViewRentStatusFilter } from './AssetsViewRentStatusFilter'
import { useAssetsViewRmmStatusFilter } from './AssetsViewRmmStatusFilter'
import { useAssetsViewSort } from './AssetsViewSort'
import { useAssetsViewSubsidyFilter } from './AssetsViewSubsidyFilter'
import { useAssetsViewUserProtocolFilter } from './AssetsViewUserProtocolFilter'
import { useAssetsViewUserStatusFilter } from './AssetsViewUserStatusFilter'

export function useAssetsViewFilters() {
  const [currentFilter] = useAtom(assetsViewFilterAtom)
  const activeFilter = Object.assign({}, assetsViewDefaultFilter, currentFilter)

  const { assetSortFunction } = useAssetsViewSort(activeFilter)
  const { assetSubsidyFilterFunction } =
    useAssetsViewSubsidyFilter(activeFilter)
  const { assetUserStatusFilterFunction } =
    useAssetsViewUserStatusFilter(activeFilter)
  const { assetProductTypeFilterFunction } =
    useAssetsViewProductTypeFilter(activeFilter)
  const { assetRentStatusFilterFunction } =
    useAssetsViewRentStatusFilter(activeFilter)
  const { assetRmmStatusFilterFunction } =
    useAssetsViewRmmStatusFilter(activeFilter)
  const { assetUserProtocolFilterFunction } =
    useAssetsViewUserProtocolFilter(activeFilter)

  function assetsViewFilterFunction(
    tokenList: (UserRealtoken | RWARealtoken)[],
  ) {
    return tokenList
      .filter(assetUserStatusFilterFunction)
      .filter(assetUserProtocolFilterFunction)
      .filter(assetProductTypeFilterFunction)
      .filter(assetRentStatusFilterFunction)
      .filter(assetSubsidyFilterFunction)
      .filter(assetRmmStatusFilterFunction)
      .sort(assetSortFunction)
  }

  return { assetsViewFilterFunction }
}
