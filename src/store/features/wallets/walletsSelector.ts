import _sumBy from 'lodash/sumBy'

import { RealToken } from 'src/repositories'
import { GetWalletBalance } from 'src/repositories/wallets.repository'
import { RootState } from 'src/store/store'

export interface RealtokenItem extends RealToken {
  id: string
  amount: number
  value: number
}

function getOwnedRealtokens(type: keyof GetWalletBalance) {
  return (state: RootState) => {
    const realtokens = state.realtokens.realtokens
    const balances = state.wallets.balances

    return realtokens
      .map((realtoken) => {
        const realtokenId = realtoken.token.id
        const balance = balances[type].find(
          (balance) => balance.address === realtokenId
        )
        return {
          id: realtokenId,
          ...realtoken,
          amount: balance ? balance.amount : 0,
          value: balance ? balance.amount * realtoken.token.value : 0,
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
      daily: acc.daily + item.return.perDay * item.amount,
      weekly: acc.weekly + item.return.perDay * 7 * item.amount,
      monthly: acc.monthly + item.return.perMonth * item.amount,
      yearly: acc.yearly + item.return.perYear * item.amount,
    }),
    rentsSummary
  )
}

export const selectOwnedRealtokensAPY = (state: RootState) => {
  const rents = selectOwnedRealtokensRents(state)
  const value = selectOwnedRealtokensValue(state)
  return value > 0 ? rents.yearly / value : 0
}
