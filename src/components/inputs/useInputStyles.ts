import { createStyles } from '@mantine/core'

export const useInputStyles = createStyles((theme) => ({
  root: {
    position: 'relative',
  },

  input: {
    height: '45px',
    paddingTop: '16px',
  },

  label: {
    position: 'absolute',
    pointerEvents: 'none',
    fontSize: theme.fontSizes.xs,
    paddingLeft: theme.spacing.sm,
    paddingTop: `calc(${theme.spacing.sm} / 2)`,
    zIndex: 1,
  },
}))
