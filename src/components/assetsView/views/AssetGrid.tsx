import { FC } from 'react'

import { Grid } from '@mantine/core'

import { OwnedRealtoken } from 'src/store/features/wallets/walletsSelector'
import useEURUSDRate from 'src/store/features/rates/useEURUSDRate'

import { AssetCard } from '../../cards'

export const AssetGrid: FC<{ realtokens: OwnedRealtoken[] }> = (props) => {
  const eURUSDRate = useEURUSDRate();

  return (
    <Grid>
      {props.realtokens.map((item) => (
        <Grid.Col key={item.id} span={12} sm={6} lg={4} xl={3}>
          <AssetCard value={item} eurusdrate={eURUSDRate} />
        </Grid.Col>
      ))}
    </Grid>
  )
}
