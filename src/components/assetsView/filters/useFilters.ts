import { useAtom } from 'jotai'

import { assetsViewDefaultFilter, assetsViewFilterAtom } from 'src/states'
import {
  OtherRealtoken,
  UserRealtoken,
} from 'src/store/features/wallets/walletsSelector'

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
  const { assetRentStatusFilterFunction } =
    useAssetsViewRentStatusFilter(activeFilter)
  const { assetRmmStatusFilterFunction } =
    useAssetsViewRmmStatusFilter(activeFilter)
  const { assetUserProtocolFilterFunction } =
    useAssetsViewUserProtocolFilter(activeFilter)

  function assetsViewFilterFunction(
    tokenList: (UserRealtoken | OtherRealtoken)[],
  ) {
    return tokenList
      .filter(assetUserStatusFilterFunction)
      .filter(assetUserProtocolFilterFunction)
      .filter(assetRentStatusFilterFunction)
      .filter(assetSubsidyFilterFunction)
      .filter(assetRmmStatusFilterFunction)
      .sort(assetSortFunction)
  }

  return { assetsViewFilterFunction }
}
