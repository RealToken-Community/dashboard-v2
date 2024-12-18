import { useMemo } from 'react'
import { useSelector } from 'react-redux'

import { NextPage } from 'next'

import { Box, Flex, Grid } from '@mantine/core'

import { AssetsView } from 'src/components/assetsView'
import {
  PropertiesCard,
  RentsCard,
  SummaryCard,
  WorthCard,
} from 'src/components/cards'
import { useREG } from 'src/hooks/useREG'
import { useRegVotingPower } from 'src/hooks/useREGVotingPower'
import { useRWA } from 'src/hooks/useRWA'
import {
  OtherRealtoken,
  UserRealtoken,
  selectUserRealtokens,
} from 'src/store/features/wallets/walletsSelector'

const HomePage: NextPage = () => {
  const realtokens = useSelector(selectUserRealtokens)
  const rwa = useRWA()
  const reg = useREG()
  const regVotingPower = useRegVotingPower()

  const allAssetsData = useMemo(() => {
    // remove potential null/undefined values, return filtered value with the right type(s)
    const assets: (UserRealtoken | OtherRealtoken | null)[] = [
      ...realtokens,
      rwa,
      reg,
      regVotingPower,
    ].filter((asset) => !!asset)
    return assets as (UserRealtoken | OtherRealtoken)[]
  }, [realtokens, rwa, reg, regVotingPower])

  const otherAssetsData = useMemo(() => {
    const assets = {
      rwa,
      reg,
      regVotingPower,
    }
    return assets
  }, [rwa, reg, regVotingPower])

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
