import { NextPage } from 'next'

import { Box, Flex, Grid } from '@mantine/core'

import { PropertiesCard } from 'src/components/PropertiesCard/PropertiesCard'
import { RentsCard } from 'src/components/RentsCard/RentsCard'
import { WorthCard } from 'src/components/WorthCard/WorthCard'
import { AssetView } from 'src/components/assets/AssetView/AssetView'

const HomePage: NextPage = () => {
  return (
    <Flex my={'xl'} direction={'column'}>
      <Grid>
        <Grid.Col md={4} span={12}>
          <WorthCard />
        </Grid.Col>
        <Grid.Col md={4} span={12}>
          <RentsCard />
        </Grid.Col>
        <Grid.Col md={4} span={12}>
          <PropertiesCard />
        </Grid.Col>
      </Grid>
      <Box my='md'>
        <AssetView />
      </Box>
    </Flex>
  )
}

export default HomePage
