import { useEffect } from 'react'
import { useSelector } from 'react-redux'

import { useWeb3React } from '@web3-react/core'

import { fetchCurrenciesRates } from 'src/store/features/currencies/currenciesSlice'
import { selectRealtokens } from 'src/store/features/realtokens/realtokensSelector'
import { fetchRealtokens, fetchRealtokensExtraData } from 'src/store/features/realtokens/realtokensSlice'
// import { fetchRealtokensExtraData } from 'src/store/features/realtokens/realtokensSliceExtraData'

import {
  selectAllUserAddressList,
  selectUserAddressList,
} from 'src/store/features/settings/settingsSelector'
import {
  initializeSettings,
  setUserAddress,
} from 'src/store/features/settings/settingsSlice'
import {
  // fetchTransfers, // unused
  resetTransfers,
} from 'src/store/features/transfers/transfersSlice'
import {
  fetchWallets,
  resetWallets,
} from 'src/store/features/wallets/walletsSlice'

import { useAppDispatch } from './react-hooks'

export default function useInitStore() {
  const dispatch = useAppDispatch()

  const allAddressList = useSelector(selectAllUserAddressList)
  const addressList = useSelector(selectUserAddressList)
  const realtokens = useSelector(selectRealtokens)
  const { account } = useWeb3React()

  useEffect(() => {
    const accountAddress = account?.toLowerCase()
    if (accountAddress && !allAddressList.includes(accountAddress)) {
      dispatch(setUserAddress(accountAddress))
    }
  }, [account, allAddressList])

  useEffect(() => {
    dispatch(initializeSettings())
    // dispatch(fetchRealtokens())
    // // dispatch(fetchRealtokensExtraData())
    dispatch(fetchRealtokens())
     .then((/* data */) => {
      console.debug('Realtokens fetched, now fetching extra data...')
      dispatch(fetchRealtokensExtraData(/* data */))
    })
    dispatch(fetchCurrenciesRates())
  }, [dispatch])

  const addresses = addressList.join(',')

  useEffect(() => {
    if (addressList.length) {
      if (realtokens.length) {
        dispatch(fetchWallets(realtokens))
        // dispatch(fetchTransfers(realtokens))
        // dispatch(fetchRealtokensExtraData(/* data */))
      }
    } else {
      dispatch(resetWallets())
      dispatch(resetTransfers())
    }
  }, [realtokens, addresses, dispatch])
}
