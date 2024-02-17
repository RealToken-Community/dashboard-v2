import { FC } from 'react'
import { useSelector } from 'react-redux'

import { Box, Group, Skeleton } from '@mantine/core'

import { selectIsLoading } from 'src/store/features/settings/settingsSelector'

export const StringField: FC<{ label: string; value: string }> = (props) => {
  const isLoading = useSelector(selectIsLoading)

  return (
    <Group justify={'space-between'} align={'center'} mt={8}>
      <div>{props.label}</div>

      {isLoading ? (
        <Skeleton width={100} height={15} />
      ) : (
        <Box ta={'right'}>{props.value}</Box>
      )}
    </Group>
  )
}
StringField.displayName = 'StringField'
