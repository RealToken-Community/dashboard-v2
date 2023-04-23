import { FC, useCallback, useState } from 'react'
import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux'

import { Button, Flex, Stack, TextInput } from '@mantine/core'
import { ContextModalProps } from '@mantine/modals'

import { selectAddressList } from 'src/store/features/settings/settingsSelector'
import { addressListChanged } from 'src/store/features/settings/settingsSlice'

export const ManageWalletModal: FC<ContextModalProps> = ({ context, id }) => {
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

  return (
    <Stack justify={'center'} align={'center'} style={{ width: '500px' }}>
      <Flex direction='column' gap='xs' style={{ width: '100%' }}>
        <TextInput
          label='Address 1'
          value={addressList[0]}
          onChange={(event) =>
            setAddressList([event.currentTarget.value, addressList[1]])
          }
          style={{ width: '100%' }}
        />
        <TextInput
          label='Address 2'
          value={addressList[1]}
          onChange={(event) =>
            setAddressList([addressList[0], event.currentTarget.value])
          }
          style={{ width: '100%' }}
        />
      </Flex>
      <Flex gap='lg'>
        <Button onClick={onClose} variant='subtle'>
          Close
        </Button>
        <Button onClick={onSubmit}>Submit</Button>
      </Flex>
    </Stack>
  )
}
