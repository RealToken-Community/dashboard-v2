import {
  Divider as MantineDivider,
  DividerProps as MantineDividerProps,
} from '@mantine/core'

export const Divider = ({
  height = 4,
  ...props
}: MantineDividerProps & { height?: number }) => {
  return (
    <MantineDivider
      {...props}
      style={{
        background: 'linear-gradient(90deg, #F6CA79 0%, #E79B0D 100%)',
        height: `${height + 1}px`,
      }}
    />
  )
}
