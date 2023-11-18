import { FC, forwardRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

import { Badge, Box, Button, ButtonProps, Flex, Menu } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useModals } from '@mantine/modals'
import { IconChevronDown, IconChevronUp } from '@tabler/icons'
import { useWeb3React } from '@web3-react/core'

import { useAppDispatch } from 'src/hooks/react-hooks'
import { selectAddressList } from 'src/store/features/settings/settingsSelector'
import { setUserAddress } from 'src/store/features/settings/settingsSlice'
import { FRC } from 'src/types'

const WalletButton: FRC<
  ButtonProps & { addressList: string[] },
  HTMLButtonElement
> = forwardRef(({ addressList, ...props }, ref) => {
  const { t } = useTranslation('common', { keyPrefix: 'wallets' })
  const count = addressList.filter((item) => item).length

  return (
    <Button {...props} ref={ref} aria-label={t('value', { count })}>
      {t('value', { count })}
    </Button>
  )
})
WalletButton.displayName = 'WalletButton'

interface WalletItemProps {
  address: string
}

const WalletItem: FC<WalletItemProps> = (props) => {
  return (
    <Badge size={'md'} variant={'dot'} fullWidth={true}>
      {props.address}
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

  return (
    <Box ta={'center'} mb={'xs'} mt={'sm'}>
      {account ? (
        <Button onClick={onDisconnect}>{t('disconnectWallet')}</Button>
      ) : (
        <Button onClick={openWalletModal}>{t('connectWallet')}</Button>
      )}
    </Box>
  )
}
ConnectWalletButton.displayName = 'ConnectWalletButton'

export const WalletMenu: FC = () => {
  const [isOpen, handlers] = useDisclosure(false)
  const addressList = useSelector(selectAddressList)
  const cleanedAddressList = addressList.filter((item) => item)

  return (
    <Menu
      closeOnItemClick={false}
      opened={isOpen}
      onOpen={handlers.open}
      onClose={handlers.close}
    >
      <Menu.Target>
        <WalletButton
          addressList={addressList}
          rightIcon={
            isOpen ? (
              <IconChevronUp size={16} stroke={3} />
            ) : (
              <IconChevronDown size={16} stroke={3} />
            )
          }
        />
      </Menu.Target>
      <Menu.Dropdown>
        <WalletItemList addressList={addressList} />

        {cleanedAddressList.length ? <Menu.Divider mt={'xs'} /> : ''}

        <ConnectWalletButton onClick={handlers.close} />
      </Menu.Dropdown>
    </Menu>
  )
}
