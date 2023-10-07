import { useEffect } from 'react'
import { useSelector } from 'react-redux'

import { fetchRates } from 'src/store/features/rates/ratesSlice'
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
    dispatch(fetchRates())
  }, [dispatch])

  const addresses = addressList.join(',')

  useEffect(() => {
    if (addressList.length) {
      dispatch(fetchWallets())
    } else {
      dispatch(resetWallets())
    }
  }, [addressList.length, addresses, dispatch])
}
