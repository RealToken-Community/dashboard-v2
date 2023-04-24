import { FC, useMemo } from 'react'
import { useSelector } from 'react-redux'

import { Flex, Select } from '@mantine/core'

import { useAtom } from 'jotai'

import { assetViewChoosedAtom } from 'src/states'
import { selectOwnedRealtokens } from 'src/store/features/wallets/walletsSelector'

import { AssetGrid } from '../AssetGrid/AssetGrid'
import { AssetTable } from '../AssetTable/AssetTable'
import { AssetViewType } from '../assetViewType'

interface AssetView {
  type: AssetViewType
  title: string
  component: React.ReactElement
  disabled?: boolean
}

export const AssetView: FC = () => {
  const [choosenAssetView, setChoosenAssetView] = useAtom(assetViewChoosedAtom)
  const realtokens = useSelector(selectOwnedRealtokens)

  const availableViews = useMemo(() => {
    return new Map<AssetViewType, AssetView>([
      [
        AssetViewType.TABLE,
        {
          type: AssetViewType.TABLE,
          title: 'Table',
          component: <AssetTable key={'table'} realtokens={realtokens} />,
        },
      ],
      [
        AssetViewType.GRID,
        {
          type: AssetViewType.GRID,
          title: 'Grid',
          component: <AssetGrid key={'grid'} realtokens={realtokens} />,
        },
      ],
    ])
  }, [realtokens])

  const datas = useMemo(() => {
    return [...availableViews].map(([, value]) => ({
      value: value.type,
      label: value.title,
    }))
  }, [availableViews])

  const getViewComponent = (): AssetView['component'] | undefined => {
    return [...availableViews.values()].find(
      (item) => item.type == choosenAssetView
    )?.component
  }

  return (
    <>
      <Flex justify={'space-between'} mb={16}>
        <div />
        <Select
          data={datas}
          value={choosenAssetView}
          onChange={(value) => value && setChoosenAssetView(value)}
        />
      </Flex>
      {getViewComponent()}
    </>
  )
}
