import { useEffect } from 'react'
import { useSelector } from 'react-redux'

import { useWeb3React } from '@web3-react/core'

import { fetchCurrenciesRates } from 'src/store/features/currencies/currenciesSlice'
import { selectRealtokens } from 'src/store/features/realtokens/realtokensSelector'
import { fetchRealtokens } from 'src/store/features/realtokens/realtokensSlice'
import { selectCleanedAddressList } from 'src/store/features/settings/settingsSelector'
import {
  initializeSettings,
  setUserAddress,
} from 'src/store/features/settings/settingsSlice'
import {
  fetchWallets,
  resetWallets,
} from 'src/store/features/wallets/walletsSlice'

import { useAppDispatch } from './react-hooks'

export default function useInitStore() {
  const dispatch = useAppDispatch()

  const addressList = useSelector(selectCleanedAddressList)
  const realtokens = useSelector(selectRealtokens)
  const { account } = useWeb3React()

  useEffect(() => {
    const accountAddress = account?.toLowerCase()
    if (accountAddress && !addressList.includes(accountAddress)) {
      dispatch(setUserAddress(accountAddress))
    }
  }, [account, addressList])

  useEffect(() => {
    dispatch(initializeSettings())
    dispatch(fetchRealtokens())
    dispatch(fetchCurrenciesRates())
  }, [dispatch])

  const addresses = addressList.join(',')

  useEffect(() => {
    if (addressList.length) {
      if (realtokens.length) {
        dispatch(fetchWallets(realtokens))
      }
    } else {
      dispatch(resetWallets())
    }
  }, [realtokens, addresses, dispatch])
}
