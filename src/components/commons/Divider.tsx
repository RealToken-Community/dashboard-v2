import {
  Box,
  CSSObject,
  DefaultProps,
  MantineGradient,
  Selectors,
  createStyles,
} from '@mantine/core'

type DividerStylesParams = {
  height?: number | string
  width?: number | string
  gradient?: MantineGradient
  vertical?: boolean
  inverted?: boolean
}

const useStyles = createStyles(
  (
    theme,
    { vertical, height, width, inverted, gradient }: DividerStylesParams,
  ) => ({
    divider: {
      height: vertical ? width : height,
      width: vertical ? height : width,
      background: theme.fn.gradient({
        ...(gradient ?? theme.defaultGradient),
        deg: vertical ? (inverted ? 180 : 360) : inverted ? 270 : 90,
      }),
    },
  }),
)

type DividerStylesNames = Selectors<typeof useStyles>

type DividerProps = DefaultProps<DividerStylesNames, DividerStylesParams> &
  DividerStylesParams

export const Divider = ({
  classNames,
  styles,
  unstyled,
  height = 4,
  width = '100%',
  vertical = false,
  gradient,
  inverted = false,
  className,
  ...others
}: DividerProps) => {
  const { classes, cx } = useStyles(
    { height, width, vertical, gradient, inverted },
    {
      name: 'NewDivider',
      classNames: classNames,
      styles: styles as Record<string, CSSObject>,
      unstyled: unstyled,
    },
  )

  return <Box className={cx(classes.divider, className)} {...others} />
}
