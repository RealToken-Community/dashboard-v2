import _sumBy from 'lodash/sumBy'

import { GetWalletBalance } from 'src/repositories/wallets.repository'
import { RootState } from 'src/store/store'
import { Realtoken, selectRealtokens } from '../realtokens/realtokensSelector'

export interface OwnedRealtoken extends Realtoken {
  id: string
  amount: number
  value: number
}

function isContractRelated(realtoken: Realtoken, contractAddress: string) {
  return [
    realtoken.xDaiContract,
    realtoken.gnosisContract,
    realtoken.ethereumContract,
  ]
    .filter((item) => item)
    .map((item) => (item ?? '').toLowerCase())
    .includes(contractAddress.toLowerCase())
}

function getOwnedRealtokens(type: keyof GetWalletBalance) {
  return (state: RootState) => {
    const realtokens = selectRealtokens(state)
    const balances = state.wallets.balances

    return realtokens
      .map((realtoken) => {
        const realtokenId = realtoken.uuid
        const balance = balances[type].find((balance) =>
          isContractRelated(realtoken, balance.address)
        )

        return {
          id: realtokenId,
          ...realtoken,
          amount: balance ? balance.amount : 0,
          value: balance ? balance.amount * realtoken.tokenPrice : 0,
        }
      })
      .filter((item) => item.amount > 0)
      .sort((a, b) => b.value - a.value)
  }
}

export const selectOwnedRealtokens = (state: RootState) =>
  getOwnedRealtokens('computed')(state)
export const selectOwnedRealtokensGnosis = (state: RootState) =>
  getOwnedRealtokens('gnosis')(state)
export const selectOwnedRealtokensEthereum = (state: RootState) =>
  getOwnedRealtokens('ethereum')(state)
export const selectOwnedRealtokensRmm = (state: RootState) =>
  getOwnedRealtokens('rmm')(state)

export const selectOwnedRealtokensValue = (state: RootState) =>
  _sumBy(selectOwnedRealtokens(state), 'value')
export const selectOwnedRealtokensValueGnosis = (state: RootState) =>
  _sumBy(selectOwnedRealtokensGnosis(state), 'value')
export const selectOwnedRealtokensValueEthereum = (state: RootState) =>
  _sumBy(selectOwnedRealtokensEthereum(state), 'value')
export const selectOwnedRealtokensValueRmm = (state: RootState) =>
  _sumBy(selectOwnedRealtokensRmm(state), 'value')

export const selectOwnedRealtokensRents = (state: RootState) => {
  const realtokens = selectOwnedRealtokens(state)

  const rentsSummary = {
    daily: 0,
    weekly: 0,
    monthly: 0,
    yearly: 0,
  }

  return realtokens.reduce(
    (acc, item) => ({
      daily: acc.daily + item.netRentDayPerToken * item.amount,
      weekly: acc.weekly + item.netRentDayPerToken * 7 * item.amount,
      monthly: acc.monthly + item.netRentMonthPerToken * item.amount,
      yearly: acc.yearly + item.netRentYearPerToken * item.amount,
    }),
    rentsSummary
  )
}

export const selectOwnedRealtokensAPY = (state: RootState) => {
  const rents = selectOwnedRealtokensRents(state)
  const value = selectOwnedRealtokensValue(state)
  return value > 0 ? rents.yearly / value : 0
}
