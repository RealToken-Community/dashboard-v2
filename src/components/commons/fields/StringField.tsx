import { FC } from 'react'
import { useSelector } from 'react-redux'

import { Box, Grid, Skeleton } from '@mantine/core'

import { selectIsLoading } from 'src/store/features/settings/settingsSelector'

export const StringField: FC<{ label: string; value: string }> = (props) => {
  const isLoading = useSelector(selectIsLoading)

  return (
    <Grid justify={'space-between'} align={'center'}>
      <Grid.Col span={'auto'}>
        <div>{props.label}</div>
      </Grid.Col>
      <Grid.Col span={'content'}>
        {isLoading ? (
          <Skeleton width={100} height={15} />
        ) : (
          <Box ta={'right'}>{props.value}</Box>
        )}
      </Grid.Col>
    </Grid>
  )
}
StringField.displayName = 'StringField'
