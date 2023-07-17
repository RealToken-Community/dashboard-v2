import { createSelector } from '@reduxjs/toolkit'

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

function findBalances(
  realtoken: Realtoken,
  balances: GetWalletBalance,
  type: keyof GetWalletBalance
) {
  return balances[type].find((balance) => {
    const address = balance.address.toLowerCase()
    return {
      ['ethereum']: address === realtoken.ethereumContract?.toLowerCase(),
      ['gnosis']: address === realtoken.gnosisContract?.toLowerCase(),
      ['rmm']: address === realtoken.gnosisContract?.toLowerCase(),
      ['rmmProtocol']: false,
    }[type]
  })
}

function mapOwnedRealtoken(
  realtoken: Realtoken,
  balances: GetWalletBalance,
  type: keyof GetWalletBalance
) {
  const realtokenId = realtoken.uuid
  const balance = findBalances(realtoken, balances, type)

  return {
    id: realtokenId,
    ...realtoken,
    amount: balance?.amount ?? 0,
    value: (balance?.amount ?? 0) * realtoken.tokenPrice,
  }
}

function getOwnedRealtokens(
  realtokens: Realtoken[],
  balances: GetWalletBalance,
  type: keyof GetWalletBalance
) {
  return realtokens
    .map((realtoken) => mapOwnedRealtoken(realtoken, balances, type))
    .filter((item) => item.amount > 0)
    .sort((a, b) => b.value - a.value)
}

export const selectOwnedRealtokensGnosis = createSelector(
  selectRealtokens,
  (state: RootState) => state.wallets.balances,
  (realtokens, balances) => getOwnedRealtokens(realtokens, balances, 'gnosis')
)

export const selectOwnedRealtokensEthereum = createSelector(
  selectRealtokens,
  (state: RootState) => state.wallets.balances,
  (realtokens, balances) => getOwnedRealtokens(realtokens, balances, 'ethereum')
)

export const selectOwnedRealtokensRmm = createSelector(
  selectRealtokens,
  (state: RootState) => state.wallets.balances,
  (realtokens, balances) => getOwnedRealtokens(realtokens, balances, 'rmm')
)

export const selectOwnedRealtokens = createSelector(
  selectOwnedRealtokensGnosis,
  selectOwnedRealtokensEthereum,
  selectOwnedRealtokensRmm,
  (...realtokens) =>
    realtokens.flat().reduce((acc, realtoken) => {
      const existingRealtoken = acc.find((item) => item.id === realtoken.id)

      if (existingRealtoken) {
        existingRealtoken.amount += realtoken.amount
        existingRealtoken.value += realtoken.value
      } else {
        acc.push({ ...realtoken })
      }

      return acc
    }, [] as OwnedRealtoken[])
)

export const selectOwnedRealtokensValue = createSelector(
  selectOwnedRealtokens,
  (realtokens) => _sumBy(realtokens, 'value')
)
export const selectOwnedRealtokensValueGnosis = createSelector(
  selectOwnedRealtokensGnosis,
  (realtokens) => _sumBy(realtokens, 'value')
)
export const selectOwnedRealtokensValueEthereum = createSelector(
  selectOwnedRealtokensEthereum,
  (realtokens) => _sumBy(realtokens, 'value')
)
export const selectOwnedRealtokensValueRmm = createSelector(
  selectOwnedRealtokensRmm,
  (realtokens) => _sumBy(realtokens, 'value')
)

export const selectOwnedRealtokensRents = createSelector(
  selectOwnedRealtokens,
  (realtokens) =>
    realtokens.reduce(
      (acc, item) => ({
        daily: acc.daily + item.netRentDayPerToken * item.amount,
        weekly: acc.weekly + item.netRentDayPerToken * 7 * item.amount,
        monthly: acc.monthly + item.netRentMonthPerToken * item.amount,
        yearly: acc.yearly + item.netRentYearPerToken * item.amount,
      }),
      { daily: 0, weekly: 0, monthly: 0, yearly: 0 }
    )
)

export const selectOwnedRealtokensAPY = createSelector(
  selectOwnedRealtokensRents,
  selectOwnedRealtokensValue,
  (rents, value) => (value > 0 ? rents.yearly / value : 0)
)

export const selectRmmDetails = createSelector(
  selectRealtokens,
  (state: RootState) => state.wallets.balances.rmmProtocol,
  (realtokens, rmmProtocol) =>
    rmmProtocol.reduce(
      (acc, item) => {
        const realtoken = realtokens.find((realtoken) =>
          isContractRelated(realtoken, item.address)
        )

        if (realtoken) {
          acc.totalDeposit += item.amount * realtoken.tokenPrice
        } else {
          acc.totalDeposit += item.amount
          acc.stableDeposit += item.amount
          acc.stableDebt += item.debt
        }
        return acc
      },
      { stableDeposit: 0, totalDeposit: 0, stableDebt: 0 }
    )
)
