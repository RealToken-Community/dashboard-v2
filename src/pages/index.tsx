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
    <Flex my={'lg'} direction={'column'}>
      <Grid>
        <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
          <SummaryCard />
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
        <AssetsView />
      </Box>
    </Flex>
  )
}

export default HomePage
