import { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux'

import { Button, Flex, MediaQuery, Stack, TextInput, Title } from '@mantine/core'
import { ContextModalProps, useModals } from '@mantine/modals'

import { selectAddressList } from 'src/store/features/settings/settingsSelector'
import { addressListChanged } from 'src/store/features/settings/settingsSlice'
import { useWeb3React } from '@web3-react/core'

const WalletInput: FC<{
  label: string
  value: string
  onChange: (value: string) => void
}> = (props) => {
  return (
    <>
      <MediaQuery largerThan={'xs'} styles={{ display: 'none' }}>
        <TextInput
          label={props.label}
          value={props.value}
          size={'xs'}
          onChange={(event) => props.onChange(event.currentTarget.value)}
          style={{ width: '100%' }}
        />
      </MediaQuery>
      <MediaQuery smallerThan={'xs'} styles={{ display: 'none' }}>
        <TextInput
          label={props.label}
          value={props.value}
          onChange={(event) => props.onChange(event.currentTarget.value)}
          style={{ width: '100%' }}
        />
      </MediaQuery>
    </>
  )
}

export const ManageWalletsModal: FC<ContextModalProps> = ({ context, id }) => {
  const { t } = useTranslation('common', { keyPrefix: 'walletModal' })

  const dispatch = useDispatch()
  const [addressList, setAddressList] = useState<string[]>(
    useSelector(selectAddressList)
  )

  const onClose = useCallback(() => {
    context.closeModal(id)
  }, [context, id])

  const onSubmit = () => {
    dispatch(addressListChanged(addressList))
    onClose()
  }

  const setWeb3Address = (value: string) => setAddressList([value, addressList[1]])

  return (
    <Stack
      justify={'center'}
      align={'center'}
      style={{ width: '500px', maxWidth: '100%' }}
    >
      <Flex direction={'column'} gap={'xs'} style={{ width: '100%' }}>
        <WalletInput
          label={t('address', { value: 1 })}
          value={addressList[0]}
          onChange={(value) => setAddressList([value, addressList[1]])}
        />
        <WalletInput
          label={t('address', { value: 2 })}
          value={addressList[1]}
          onChange={(value) => setAddressList([addressList[0], value])}
        />
      </Flex>
      <Flex gap={'lg'}>
        <ConnectButton setWeb3Address={setWeb3Address} />
      </Flex>
      <Flex gap={'lg'}>
        <Button onClick={onClose} variant={'subtle'}>
          {t('close')}
        </Button>
        <Button onClick={onSubmit}>{t('submit')}</Button>
      </Flex>
    </Stack>
  )
}

interface ConnectButtonProps {
  setWeb3Address: (address: string) => void;
}

const ConnectButton : FC<ConnectButtonProps> = ({ setWeb3Address }) => {
  const modals = useModals();

  const { t } = useTranslation('common', { keyPrefix: 'walletButton' });
  const { account, connector } = useWeb3React();

  useEffect(() => {
    console.log('account', account)
    if (account) {
      setWeb3Address(account)
    }
  }
  , [account])

  const onDisconnect = useCallback(async () => {
    if (connector.deactivate) {
      await connector.deactivate();
    } else {
      await connector.resetState();
    }
    setWeb3Address('');
  }, [connector]);

  const openWalletModal = () =>
    modals.openContextModal('web3Wallets', { innerProps: {} })

  if (account) {
    return (
      <Button onClick={onDisconnect}>
        {t('disconnectWallet')}
      </Button>
    );
  }

  return (
    <Button onClick={openWalletModal}>
      {t('connectWallet')}
    </Button>
  );
};
