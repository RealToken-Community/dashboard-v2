import { NextPage } from 'next'

import { Box, Flex, Grid } from '@mantine/core'

import { AssetsView } from 'src/components/assetsView'
import {
  PropertiesCard,
  RentsCard,
  SummaryCard,
  WorthCard,
} from 'src/components/cards'

const HomePage: NextPage = () => {
  return (
    <Flex my={'xl'} direction={'column'}>
      <Grid>
        <Grid.Col md={3} span={12}>
          <SummaryCard />
        </Grid.Col>
        <Grid.Col md={3} span={12}>
          <WorthCard />
        </Grid.Col>
        <Grid.Col md={3} span={12}>
          <RentsCard />
        </Grid.Col>
        <Grid.Col md={3} span={12}>
          <PropertiesCard />
        </Grid.Col>
      </Grid>
      <Box my={'md'}>
        <AssetsView />
      </Box>
    </Flex>
  )
}

export default HomePage
