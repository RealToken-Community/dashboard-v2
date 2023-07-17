import { FC } from 'react'

import { Grid } from '@mantine/core'

import { OwnedRealtoken } from 'src/store/features/wallets/walletsSelector'

import { AssetCard } from '../../cards'

export const AssetGrid: FC<{ realtokens: OwnedRealtoken[] }> = (props) => {
  return (
    <Grid>
      {props.realtokens.map((item) => (
        <Grid.Col key={item.id} span={12} sm={6} lg={4} xl={3}>
          <AssetCard value={item} />
        </Grid.Col>
      ))}
    </Grid>
  )
}
