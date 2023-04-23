import { FC, useMemo } from 'react'

import { Flex, Select } from '@mantine/core'

import { useAtom } from 'jotai'

import { assetViewChoosedAtom } from 'src/states'

import { AssetGrid } from '../AssetGrid/AssetGrid'
import { AssetViewType } from '../assetViewType'

interface AssetView {
  display: AssetViewType
  title: string
  component: React.ReactElement
  disabled?: boolean
}

export const AssetView: FC = () => {
  const [choosenAssetView, setChoosenAssetView] = useAtom(assetViewChoosedAtom)

  const availableDisplays = useMemo(() => {
    return new Map<AssetViewType, AssetView>([
      [
        AssetViewType.TABLE,
        {
          display: AssetViewType.TABLE,
          title: 'Table',
          component: <AssetGrid key={'table'} />,
          disabled: true,
        },
      ],
      [
        AssetViewType.GRID,
        {
          display: AssetViewType.GRID,
          title: 'Grid',
          component: <AssetGrid key={'grid'} />,
        },
      ],
    ])
  }, [])

  const datas = useMemo(() => {
    return [...availableDisplays].map(([, value]) => ({
      value: value.display,
      label: value.title,
      disabled: value.disabled,
    }))
  }, [availableDisplays])

  const getDisplay = (): AssetView | undefined => {
    return [...availableDisplays.values()].find(
      (display) => display.display == choosenAssetView
    )
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
      {getDisplay() ? getDisplay()?.component : undefined}
    </>
  )
}
