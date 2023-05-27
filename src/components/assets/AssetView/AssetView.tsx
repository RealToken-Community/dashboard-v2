import { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

import { Flex, Grid, Select, Switch } from '@mantine/core'

import { useAtom } from 'jotai'

import {
  assetSortChoosedAtom,
  assetSortReverseAtom,
  assetViewChoosedAtom,
} from 'src/states'
import { selectOwnedRealtokens } from 'src/store/features/wallets/walletsSelector'

import { AssetGrid } from '../AssetGrid/AssetGrid'
import { AssetTable } from '../AssetTable/AssetTable'
import { AssetSortType } from '../assetSortType'
import { AssetViewType } from '../assetViewType'

interface AssetView {
  type: AssetViewType
  title: string
  component: React.ReactElement
  disabled?: boolean
}

export const AssetView: FC = () => {
  const { t } = useTranslation('common', { keyPrefix: 'assetView' })

  const [choosenAssetView, setChoosenAssetView] = useAtom(assetViewChoosedAtom)
  const [choosenAssetSort, setChoosenAssetSort] = useAtom(assetSortChoosedAtom)
  const [choosenAssetSortReverse, setChoosenAssetSortReverse] =
    useAtom(assetSortReverseAtom)
  const realtokens = useSelector(selectOwnedRealtokens)

  const realtokensData = useMemo(() => {
    const result = realtokens.slice()
    result.sort((a, b) => {
      switch (choosenAssetSort) {
        case AssetSortType.VALUE:
          return b.value - a.value
        case AssetSortType.APR:
          return b.annualPercentageYield - a.annualPercentageYield
        case AssetSortType.RENT:
          return (
            b.amount * b.netRentDayPerToken - a.amount * a.netRentDayPerToken
          )
        case AssetSortType.NAME:
          return a.shortName.localeCompare(b.shortName)
        case AssetSortType.SUPPLY:
          return b.totalInvestment - a.totalInvestment
        default:
          return 0
      }
    })

    if (choosenAssetSortReverse) {
      result.reverse()
    }

    return result
  }, [choosenAssetSort, choosenAssetSortReverse, realtokens])

  const sortOptions = [
    { value: AssetSortType.NAME, label: t('sortOptions.name') },
    { value: AssetSortType.VALUE, label: t('sortOptions.value') },
    { value: AssetSortType.SUPPLY, label: t('sortOptions.supply') },
    { value: AssetSortType.APR, label: t('sortOptions.apr') },
    { value: AssetSortType.RENT, label: t('sortOptions.rent') },
  ]

  const availableViews = useMemo(() => {
    return new Map<AssetViewType, AssetView>([
      [
        AssetViewType.TABLE,
        {
          type: AssetViewType.TABLE,
          title: 'Table',
          component: <AssetTable key={'table'} realtokens={realtokensData} />,
        },
      ],
      [
        AssetViewType.GRID,
        {
          type: AssetViewType.GRID,
          title: 'Grid',
          component: <AssetGrid key={'grid'} realtokens={realtokensData} />,
        },
      ],
    ])
  }, [realtokensData])

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
      <Grid>
        <Grid.Col span={'auto'}>
          <Flex align={'center'} gap={'sm'}>
            <span>{t('sort')}</span>
            <Select
              data={sortOptions}
              value={choosenAssetSort}
              onChange={(value) => value && setChoosenAssetSort(value)}
            />
            <span>{t('sortReverse')}</span>
            <Switch
              checked={choosenAssetSortReverse}
              onChange={(value) =>
                setChoosenAssetSortReverse(value.currentTarget.checked)
              }
            />
          </Flex>
        </Grid.Col>
        <Grid.Col xs={12} sm={'content'}>
          <Select
            data={datas}
            value={choosenAssetView}
            onChange={(value) => value && setChoosenAssetView(value)}
          />
        </Grid.Col>
      </Grid>
      {getViewComponent()}
    </>
  )
}
