import { useEffect } from 'react'
import { useSelector } from 'react-redux'

import { fetchRealtokens } from 'src/store/features/realtokens/realtokensSlice'
import { selectCleanedAddressList } from 'src/store/features/settings/settingsSelector'
import { initializeSettings } from 'src/store/features/settings/settingsSlice'
import {
  fetchWallets,
  resetWallets,
} from 'src/store/features/wallets/walletsSlice'

import { useAppDispatch } from './react-hooks'

export default function useInitStore() {
  const dispatch = useAppDispatch()

  const addressList = useSelector(selectCleanedAddressList)

  useEffect(() => {
    dispatch(initializeSettings())
    dispatch(fetchRealtokens())
  }, [dispatch])

  useEffect(() => {
    if (addressList.length) {
      dispatch(fetchWallets())
    } else {
      dispatch(resetWallets())
    }
  }, [addressList.length, dispatch])
}
