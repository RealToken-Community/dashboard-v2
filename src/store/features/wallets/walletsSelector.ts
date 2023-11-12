import { createSelector } from '@reduxjs/toolkit'

import _sumBy from 'lodash/sumBy'

import { WalletBalances, WalletType } from 'src/repositories'
import { RootState } from 'src/store/store'

import { Realtoken, selectRealtokens } from '../realtokens/realtokensSelector'

export interface OwnedRealtoken extends Realtoken {
  id: string
  amount: number
  value: number
  balance: Record<
    WalletType,
    {
      amount: number
      value: number
    }
  >
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
  balances: WalletBalances,
  type: keyof WalletBalances
) {
  return balances[type].find((balance) => {
    const address = balance.token.toLowerCase()

    return {
      ['ethereum']: address === realtoken.ethereumContract?.toLowerCase(),
      ['gnosis']: address === realtoken.gnosisContract?.toLowerCase(),
      ['rmm']: address === realtoken.gnosisContract?.toLowerCase(),
      ['levinSwap']: address === realtoken.gnosisContract?.toLowerCase(),
      ['rmmProtocol']: false,
    }[type]
  })
}

function mapOwnedRealtoken(
  realtoken: Realtoken,
  balances: WalletBalances,
  type: keyof WalletBalances
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
  balances: WalletBalances,
  type: keyof WalletBalances
) {
  return realtokens
    .map((realtoken) => mapOwnedRealtoken(realtoken, balances, type))
    .filter((item) => item.amount > 0)
    .sort((a, b) => b.value - a.value)
}

export const selectOwnedRealtokensGnosis = createSelector(
  selectRealtokens,
  (state: RootState) => state.wallets.balances,
  (realtokens, balances) =>
    getOwnedRealtokens(realtokens, balances, WalletType.Gnosis)
)

export const selectOwnedRealtokensEthereum = createSelector(
  selectRealtokens,
  (state: RootState) => state.wallets.balances,
  (realtokens, balances) =>
    getOwnedRealtokens(realtokens, balances, WalletType.Ethereum)
)

export const selectOwnedRealtokensRmm = createSelector(
  selectRealtokens,
  (state: RootState) => state.wallets.balances,
  (realtokens, balances) =>
    getOwnedRealtokens(realtokens, balances, WalletType.RMM)
)

export const selectOwnedRealtokensLevinSwap = createSelector(
  selectRealtokens,
  (state: RootState) => state.wallets.balances,
  (realtokens, balances) =>
    getOwnedRealtokens(realtokens, balances, WalletType.LevinSwap)
)

export const selectOwnedRealtokens = createSelector(
  (state: RootState) => state.wallets.balances,
  selectOwnedRealtokensGnosis,
  selectOwnedRealtokensEthereum,
  selectOwnedRealtokensRmm,
  selectOwnedRealtokensLevinSwap,
  (balances, ...realtokens) =>
    realtokens.flat().reduce((acc, realtoken) => {
      const existingRealtoken = acc.find((item) => item.id === realtoken.id)

      if (existingRealtoken) {
        existingRealtoken.amount += realtoken.amount
        existingRealtoken.value += realtoken.value
      } else {
        acc.push({
          ...realtoken,
          balance: getBalancesForProperty(realtoken, balances),
        })
      }

      return acc
    }, [] as OwnedRealtoken[])
)

function getBalancesForProperty(
  realtoken: Realtoken,
  balances: WalletBalances
) {
  return {
    ethereum: getBalanceForProperty(realtoken, balances, WalletType.Ethereum),
    gnosis: getBalanceForProperty(realtoken, balances, WalletType.Gnosis),
    rmm: getBalanceForProperty(realtoken, balances, WalletType.RMM),
    levinSwap: getBalanceForProperty(realtoken, balances, WalletType.LevinSwap),
  }
}

function getBalanceForProperty(
  realtoken: Realtoken,
  balances: WalletBalances,
  type: keyof WalletBalances
) {
  const balance = balances[type].find(
    (item) =>
      item.token.toLowerCase() === realtoken.gnosisContract?.toLowerCase()
  )

  return {
    amount: balance?.amount ?? 0,
    value: (balance?.amount ?? 0) * realtoken.tokenPrice,
  }
}

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
export const selectOwnedRealtokensValueLevinSwap = createSelector(
  selectOwnedRealtokensLevinSwap,
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

const selectRmmDetailsInXdai = createSelector(
  selectRealtokens,
  (state: RootState) => state.wallets.rmmPositions,
  (realtokens, rmmProtocol) =>
    rmmProtocol.reduce(
      (acc, item) => {
        const realtoken = realtokens.find((realtoken) =>
          isContractRelated(realtoken, item.token)
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

export const selectRmmDetails = createSelector(
  selectRmmDetailsInXdai,
  (state: RootState) => state.currencies.rates,
  (rmmDetails, rates) => ({
    ...rmmDetails,
    totalDeposit: rmmDetails.totalDeposit / rates.XDAI,
    stableDeposit: rmmDetails.stableDeposit / rates.XDAI,
    stableDebt: rmmDetails.stableDebt / rates.XDAI,
  })
)
