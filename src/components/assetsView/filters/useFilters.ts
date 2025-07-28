import { useSelector } from 'react-redux'

import { useAtom } from 'jotai'

import { assetsViewDefaultFilter, assetsViewFilterAtom } from 'src/states'
import { selectUserDisplayAdditionalData } from 'src/store/features/settings/settingsSelector'
import {
  OtherRealtoken,
  UserRealtoken,
} from 'src/store/features/wallets/walletsSelector'

import { useAssetsViewProductTypeFilter } from './AssetsViewFilterProductType'
import { useAssetsViewIssuePriorityFilter } from './AssetsViewIssuePriorityFilter'
import { useAssetsViewIssueStatusFilter } from './AssetsViewIssuesStatusFilter'
import { useAssetsViewRentStatusFilter } from './AssetsViewRentStatusFilter'
import { useAssetsViewRmmStatusFilter } from './AssetsViewRmmStatusFilter'
import { useAssetsViewSort } from './AssetsViewSort'
import { useAssetsViewSubsidyFilter } from './AssetsViewSubsidyFilter'
import { useAssetsViewUserProtocolFilter } from './AssetsViewUserProtocolFilter'
import { useAssetsViewUserStatusFilter } from './AssetsViewUserStatusFilter'

export function useAssetsViewFilters() {
  const [currentFilter] = useAtom(assetsViewFilterAtom)
  const activeFilter = Object.assign({}, assetsViewDefaultFilter, currentFilter)
  const userDisplayAdditionalData = useSelector(selectUserDisplayAdditionalData)

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
  const { assetIssueStatusFilterFunction } =
    useAssetsViewIssueStatusFilter(activeFilter)
  const { assetIssuePriorityFilterFunction } =
    useAssetsViewIssuePriorityFilter(activeFilter)

  function assetsViewFilterFunction(
    tokenList: (UserRealtoken | OtherRealtoken)[],
  ) {
    return tokenList
      .filter(assetUserStatusFilterFunction)
      .filter(assetUserProtocolFilterFunction)
      .filter(assetProductTypeFilterFunction)
      .filter(assetRentStatusFilterFunction)
      .filter(assetSubsidyFilterFunction)
      .filter(assetRmmStatusFilterFunction)
      .filter(
        userDisplayAdditionalData ? assetIssueStatusFilterFunction : () => true,
      )
      .filter(
        userDisplayAdditionalData ? assetIssueStatusFilterFunction : () => true,
      )
      .filter(
        userDisplayAdditionalData
          ? assetIssuePriorityFilterFunction
          : () => true,
      )
      .sort(assetSortFunction)
  }

  return { assetsViewFilterFunction }
}
