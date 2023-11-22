import { FC, ReactNode, useEffect } from 'react'
import { useSelector } from 'react-redux'

import { MediaQuery, createStyles } from '@mantine/core'
import { useModals } from '@mantine/modals'

import {
  selectCleanedAddressList,
  selectIsInitialized,
} from 'src/store/features/settings/settingsSelector'

import { Footer } from './Footer'
import { Header } from './Header'

type MainLayoutProps = { children: ReactNode }

const useStyles = createStyles((theme) => ({
  header: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    height: '60px',
    backgroundColor:
      theme.colorScheme === 'dark' ? theme.colors.dark[7] : '#fff',
  },
  container: {
    marginTop: '60px',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 'calc(100vh - 60px)',
  },
  main: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    padding: `0 ${theme.spacing.sm}`,
  },
}))

export const MainLayout: FC<MainLayoutProps> = ({ children }) => {
  const { classes } = useStyles()

  const isInitialized = useSelector(selectIsInitialized)
  const addressList = useSelector(selectCleanedAddressList)
  const modals = useModals()

  useEffect(() => {
    if (isInitialized && addressList.length === 0) {
      modals.openContextModal('web3Wallets', { innerProps: {} })
    }
  }, [isInitialized]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <Header />
      </div>
      <div id={'main-layout-container'} className={classes.main}>
        {children}
      </div>
      <MediaQuery smallerThan={'xs'} styles={{ display: 'none' }}>
        <div>
          <Footer />
        </div>
      </MediaQuery>
    </div>
  )
}
