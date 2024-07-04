import { FC, ReactNode } from 'react'

import { MantineColorScheme, MantineProvider } from '@mantine/core'
import { ModalsProvider } from '@mantine/modals'
import { Notifications } from '@mantine/notifications'

import { modals } from 'src/components/modals'
import { modalStyles, theme } from 'src/theme'

type MantineProvidersProps = {
  initialColorScheme: MantineColorScheme
  children: ReactNode
}

export const MantineProviders: FC<MantineProvidersProps> = ({
  children,
  initialColorScheme,
}) => {
  return (
    <MantineProvider
      theme={theme}
      defaultColorScheme={initialColorScheme}
      cssVariablesResolver={() => ({
        variables: {
          '--indicator-z-index': '199',
        },
        dark: {},
        light: {},
      })}
    >
      <Notifications autoClose={6000} />
      <ModalsProvider
        modals={modals}
        modalProps={{
          centered: true,
          withCloseButton: false,
          styles: modalStyles,
        }}
      >
        {children}
      </ModalsProvider>
    </MantineProvider>
  )
}
