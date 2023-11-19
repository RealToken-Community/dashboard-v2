import { FC, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Flex,
  Menu,
  createStyles,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useModals } from '@mantine/modals'
import { IconWallet } from '@tabler/icons'
import { useWeb3React } from '@web3-react/core'

import { utils as EthersUtils } from 'ethers'

import { useAppDispatch } from 'src/hooks/react-hooks'
import { selectUser } from 'src/store/features/settings/settingsSelector'
import { setUserAddress } from 'src/store/features/settings/settingsSlice'

import { IntegerField, StringField } from '../commons'

interface WalletItemProps {
  address: string
}

const useStyles = createStyles({
  address: {
    span: { fontFamily: 'monospace', fontSize: '12px' },
  },
})

const WalletItem: FC<WalletItemProps> = (props) => {
  const { classes } = useStyles()
  return (
    <Badge
      size={'md'}
      variant={'dot'}
      fullWidth={true}
      className={classes.address}
      style={{ textTransform: 'none', justifyContent: 'space-between' }}
    >
      {EthersUtils.getAddress(props.address)}
    </Badge>
  )
}
WalletItem.displayName = 'WalletItem'

const WalletItemList: FC<{ addressList: string[] }> = (props) => {
  return (
    <Flex direction={'column'} gap={'xs'}>
      {props.addressList
        .filter((item) => item)
        .map((address) => (
          <WalletItem key={address} address={address} />
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

  if (!user) {
    return <ConnectWalletButton />
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

            <WalletItemList addressList={user.addressList} />

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
