import { atomWithStorage } from 'jotai/utils'

import { AssetViewType } from 'src/components/assets/assetViewType'

export const assetViewChoosedAtom = atomWithStorage<string>(
  'displayChoosed',
  AssetViewType.GRID
)
