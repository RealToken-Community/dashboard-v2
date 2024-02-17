import { FC, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

import { ActionIcon, Badge, Box, Button, Flex, Menu } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useModals } from '@mantine/modals'
import { IconWallet } from '@tabler/icons'
import { useWeb3React } from '@web3-react/core'

import { ethers } from 'ethers'

import { useAppDispatch } from 'src/hooks/react-hooks'
import {
  selectIsInitialized,
  selectUser,
} from 'src/store/features/settings/settingsSelector'
import { User, setUserAddress } from 'src/store/features/settings/settingsSlice'

import { IntegerField, StringField } from '../commons'
import styles from './WalletMenu.module.sass'

interface WalletItemProps {
  address: string
  isVisible?: boolean
}

const WalletItem: FC<WalletItemProps> = (props) => {
  return (
    <Badge
      size={'md'}
      variant={'dot'}
      fullWidth={true}
      className={styles.address}
      style={{
        textTransform: 'none',
        justifyContent: 'space-between',
        opacity: props.isVisible ? 0.5 : 1,
      }}
    >
      {ethers.getAddress(props.address)}
    </Badge>
  )
}
WalletItem.displayName = 'WalletItem'

const AddWalletButton: FC<{ onClick?: () => void }> = (props) => {
  const modals = useModals()
  const { t } = useTranslation('common', { keyPrefix: 'manageWalletModal' })

  function openModal() {
    props.onClick?.()
    modals.openContextModal('manageWalletModal', {
      innerProps: {},
      closeOnClickOutside: false,
      closeOnEscape: false,
    })
  }

  return (
    <>
      <Button onClick={openModal} size={'compact-xs'} variant={'outline'}>
        {t('open')}
      </Button>
    </>
  )
}
AddWalletButton.displayName = 'AddWalletButton'

const WalletItemList: FC<{ user: User }> = (props) => {
  const addresses = [
    ...(props.user?.addressList ?? []),
    ...(props.user?.customAddressList ?? []),
  ]

  const hiddenAddressList = props.user?.hiddenAddressList ?? []

  return (
    <Flex direction={'column'} gap={'xs'}>
      {addresses
        .filter((item) => item)
        .map((item) => (
          <WalletItem
            key={item}
            address={item}
            isVisible={hiddenAddressList.includes(item)}
          />
        ))}
    </Flex>
  )
}
WalletItemList.displayName = 'WalletItemList'

const ConnectWalletButton: FC<{ onClick?: () => void }> = (props) => {
  const { t } = useTranslation('common', { keyPrefix: 'walletButton' })
  const modals = useModals()
  const dispatch = useAppDispatch()
  const { account, connector } = useWeb3React()

  const onDisconnect = useCallback(async () => {
    props.onClick?.()
    if (connector.deactivate) {
      await connector.deactivate()
    } else {
      await connector.resetState()
    }
    dispatch(setUserAddress(''))
  }, [connector])

  const openWalletModal = () => {
    props.onClick?.()
    modals.openContextModal('web3Wallets', { innerProps: {} })
  }

  return account ? (
    <Button onClick={onDisconnect}>{t('disconnectWallet')}</Button>
  ) : (
    <Button onClick={openWalletModal}>{t('connectWallet')}</Button>
  )
}
ConnectWalletButton.displayName = 'ConnectWalletButton'

export const WalletMenu: FC = () => {
  const { t } = useTranslation('common', { keyPrefix: 'walletMenu' })
  const [isOpen, handlers] = useDisclosure(false)
  const user = useSelector(selectUser)
  const isInitialized = useSelector(selectIsInitialized)

  if (!user) {
    return isInitialized ? (
      <ConnectWalletButton />
    ) : (
      <ActionIcon size={36} color={'brand'}>
        <IconWallet size={20} aria-label={'Wallet'} />
      </ActionIcon>
    )
  }

  return (
    <Menu
      closeOnItemClick={false}
      opened={isOpen}
      onOpen={handlers.open}
      onClose={handlers.close}
    >
      <Menu.Target>
        <ActionIcon size={36} color={'brand'}>
          <IconWallet size={20} aria-label={'Wallet'} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        {user ? (
          <>
            <Box mx={'sm'} mt={'xs'}>
              <StringField label={t('userId')} value={user.id} />
              <IntegerField
                label={t('addresses')}
                value={user.addressList.length}
              />
              <IntegerField
                label={t('whitelists')}
                value={user.whitelistAttributeKeys.length}
              />
            </Box>

            <Menu.Divider my={'xs'} />

            <WalletItemList user={user} />

            <Box ta={'center'} mb={'xs'} mt={'sm'}>
              <AddWalletButton onClick={handlers.close} />
            </Box>

            <Menu.Divider mt={'xs'} />
          </>
        ) : undefined}

        <Box ta={'center'} mb={'xs'} mt={'sm'}>
          <ConnectWalletButton onClick={handlers.close} />
        </Box>
      </Menu.Dropdown>
    </Menu>
  )
}
