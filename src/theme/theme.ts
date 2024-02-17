import { MantineTheme, ModalProps, createTheme } from '@mantine/core'

export const modalStyles: ModalProps['styles'] = {
  header: { justifyContent: 'center' },
  body: {
    maxWidth: 'calc(100vw - 20px - 32px)',
    padding: '10px !important',
    overflowY: 'unset !important' as 'unset',
  },
}

export const theme = createTheme({
  colors: {
    brand: [
      '#F6CA79',
      '#F5BC51',
      '#F4B43E',
      '#F3AD2B',
      '#F2A91E',
      '#E79B0D',
      '#D48E0C',
      '#C1810B',
      '#AE740A',
      '#9A6709',
    ],
  },
  primaryColor: 'brand',
  defaultGradient: { deg: 90, from: '#F6CA79', to: '#E79B0D' },
  defaultRadius: 'md',
  cursorType: 'pointer',
  components: {
    ActionIcon: { defaultProps: { variant: 'filled' } },
  },
  other: {
    border: (theme: MantineTheme) => `thin solid ${theme.colors.dark[4]}`,
  },
})
