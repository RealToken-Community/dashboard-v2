import { useAtom } from 'jotai'

import { assetsViewDefaultFilter, assetsViewFilterAtom } from 'src/states'
import { UserRealtoken } from 'src/store/features/wallets/walletsSelector'

import { useAssetsViewRentStatusFilter } from './AssetsViewRentStatusFilter'
import { useAssetsViewSort } from './AssetsViewSort'
import { useAssetsViewSubsidyFilter } from './AssetsViewSubsidyFilter'
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

  function assetsViewFilterFunction(tokenList: UserRealtoken[]) {
    return tokenList
      .filter(assetUserStatusFilterFunction)
      .filter(assetRentStatusFilterFunction)
      .filter(assetSubsidyFilterFunction)
      .sort(assetSortFunction)
  }

  return { assetsViewFilterFunction }
}
