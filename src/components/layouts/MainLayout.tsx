import { FC, ReactNode, useEffect } from 'react'
import { useSelector } from 'react-redux'

import { useModals } from '@mantine/modals'

import {
  selectIsInitialized,
  selectUserAddressList,
} from 'src/store/features/settings/settingsSelector'

import { Footer } from './Footer'
import { Header } from './Header'
import { InitialTransfersLoader } from './InitialTransfersLoader'
import styles from './MainLayout.module.sass'

type MainLayoutProps = { children: ReactNode }

export const MainLayout: FC<MainLayoutProps> = ({ children }) => {
  const isInitialized = useSelector(selectIsInitialized)
  const addressList = useSelector(selectUserAddressList)
  const modals = useModals()

  useEffect(() => {
    if (isInitialized && addressList.length === 0) {
      modals.openContextModal('web3Wallets', { innerProps: {} })
    }
  }, [isInitialized])

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Header />
      </div>
      <div id={'main-layout-container'} className={styles.main}>
        <InitialTransfersLoader />
        {children}
      </div>
      <div className={styles.footer}>
        <Footer />
      </div>
    </div>
  )
}
