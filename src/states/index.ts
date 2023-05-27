import { atomWithStorage } from 'jotai/utils'

import { AssetSortType } from 'src/components/assets/assetSortType'
import { AssetViewType } from 'src/components/assets/assetViewType'

export const assetViewChoosedAtom = atomWithStorage<string>(
  'displayChoosed',
  AssetViewType.GRID
)

export const assetSortChoosedAtom = atomWithStorage<string>(
  'sortChoosed',
  AssetSortType.VALUE
)

export const assetSortReverseAtom = atomWithStorage<boolean>(
  'sortReverse',
  false
)
