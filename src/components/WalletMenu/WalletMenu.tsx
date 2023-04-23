import { FC, forwardRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

import { Badge, Box, Button, ButtonProps, Flex, Menu } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useModals } from '@mantine/modals'
import { IconChevronDown, IconChevronUp } from '@tabler/icons'

import { selectAddressList } from 'src/store/features/settings/settingsSelector'
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
    <Badge size='lg' variant='dot' fullWidth>
      {props.address}
    </Badge>
  )
}
WalletItem.displayName = 'WalletItem'

const WalletItemList: FC<{ addressList: string[] }> = (props) => {
  return (
    <Flex direction='column' gap='xs'>
      {props.addressList
        .filter((item) => item)
        .map((address) => (
          <WalletItem key={address} address={address} />
        ))}
    </Flex>
  )
}
WalletItemList.displayName = 'WalletItemList'

const ManageWalletButton: FC<{ onClick: () => void }> = (props) => {
  const { t } = useTranslation('common', { keyPrefix: 'wallets' })
  const modals = useModals()

  const openManageWalletModal = () =>
    modals.openContextModal('manageWallets', { innerProps: {} })

  return (
    <Box ta='center' mb='xs' mt='sm'>
      <Button
        onClick={() => {
          props.onClick()
          openManageWalletModal()
        }}
      >
        {t('manage')}
      </Button>
    </Box>
  )
}
ManageWalletButton.displayName = 'ManageWalletButton'

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
        {cleanedAddressList.length ? <Menu.Divider mt='xs' /> : ''}
        <ManageWalletButton onClick={handlers.close} />
      </Menu.Dropdown>
    </Menu>
  )
}
