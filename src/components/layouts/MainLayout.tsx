import { FC, ReactNode, useEffect } from 'react'
import { useSelector } from 'react-redux'

import { createStyles } from '@mantine/core'
import { useModals } from '@mantine/modals'

import {
  selectCleanedAddressList,
  selectIsInitialized,
} from 'src/store/features/settings/settingsSelector'

import { Footer } from './Footer'
import { Header } from './Header'

type MainLayoutProps = { children: ReactNode }

const useStyles = createStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
  },
  main: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    overflowY: 'auto',
    padding: `0 ${theme.spacing.xl}px`,
  },
}))

export const MainLayout: FC<MainLayoutProps> = ({ children }) => {
  const { classes } = useStyles()

  const isInitialized = useSelector(selectIsInitialized)
  const addressList = useSelector(selectCleanedAddressList)
  const modals = useModals()

  useEffect(() => {
    if (isInitialized && addressList.length === 0) {
      modals.openContextModal('manageWallets', { innerProps: {} })
    }
  }, [isInitialized]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={classes.container}>
      <Header />
      <div id={'main-layout-container'} className={classes.main}>
        {children}
      </div>
      <Footer />
    </div>
  )
}
