import { FC } from 'react'
import { useSelector } from 'react-redux'

import { Box, Flex, Group, Skeleton } from '@mantine/core'

import { selectIsLoading } from 'src/store/features/settings/settingsSelector'

export const StringField: FC<{
  label: string
  labelIcon?: React.ReactNode
  value: string
  unitIcon?: React.ReactNode
}> = (props) => {
  const isLoading = useSelector(selectIsLoading)

  return (
    <Group justify={'space-between'} align={'center'} mt={8}>
      <Flex>
        <div>{props.label}</div>
        {props.labelIcon && (
          <Box
            ml={5}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {props.labelIcon}
          </Box>
        )}
      </Flex>

      {isLoading ? (
        <Skeleton width={100} height={15} />
      ) : (
        <Flex ta={'right'}>
          {props.value}
          <Box
            ml={4}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          ></Box>
          {props.unitIcon && <Box mt={1}>{props.unitIcon}</Box>}
        </Flex>
      )}
    </Group>
  )
}
StringField.displayName = 'StringField'
