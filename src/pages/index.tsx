import { NextPage } from 'next'

import { Box, Flex, Grid } from '@mantine/core'

import { AssetsView } from 'src/components/assetsView'
import {
  PropertiesCard,
  RentsCard,
  SummaryCard,
  WorthCard,
} from 'src/components/cards'

import {
  OtherRealtoken,
  UserRealtoken,
  selectUserRealtokens,
} from 'src/store/features/wallets/walletsSelector'

import { useSelector } from 'react-redux'
import { useAssetsViewFilters } from 'src/components/assetsView/filters/useFilters'

import { useREG } from 'src/hooks/useREG'
import { useRegVotingPower } from 'src/hooks/useREGVotingPower'
import { useRWA } from 'src/hooks/useRWA'
import { useMemo } from 'react'

import { useAssetsViewSearch } from 'src/components/assetsView/AssetsViewSearch'

const HomePage: NextPage = () => {

  const { assetsViewFilterFunction } = useAssetsViewFilters()
  const { assetSearchFunction } = useAssetsViewSearch()

  const realtokens = useSelector(selectUserRealtokens)
  const rwa = useRWA()
  const reg = useREG()
  const regVotingPower = useRegVotingPower()

  const allAssetsData = useMemo(() => {
    const assets: (UserRealtoken | OtherRealtoken | null)[] = [
      ...realtokens,
      rwa,
      reg,
      regVotingPower,
    ].filter(
      // remove null/undefined values
      (asset) => asset != null && asset != undefined,
    )
    const assetsT = assets as (UserRealtoken | OtherRealtoken)[]
    return assetsViewFilterFunction(assetsT.filter(assetSearchFunction))
  }, [
    realtokens,
    rwa,
    reg,
    regVotingPower,
    assetSearchFunction,
    assetsViewFilterFunction,
  ])

  const otherAssetsData = useMemo(() => {
    const assets = {
      rwa,
      reg,
      regVotingPower,
    }
    return assets
  }, [
    rwa,
    reg,
    regVotingPower,
  ])

  return (
    <Flex my={'lg'} direction={'column'}>
      <Grid>
        <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
          <SummaryCard otherAssetsData={otherAssetsData} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
          <WorthCard />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
          <RentsCard />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
          <PropertiesCard />
        </Grid.Col>
      </Grid>
      <Box my={'md'}>
        <AssetsView allAssetsData={allAssetsData} />
      </Box>
    </Flex>
  )
}

export default HomePage
