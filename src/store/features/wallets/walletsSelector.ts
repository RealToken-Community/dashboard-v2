import { createSelector } from '@reduxjs/toolkit'

import _mapValues from 'lodash/mapValues'
import _sumBy from 'lodash/sumBy'

import { WalletBalances, WalletType } from 'src/repositories'
import { RootState } from 'src/store/store'

import { Realtoken, selectRealtokens } from '../realtokens/realtokensSelector'

export interface UserRealtoken extends Realtoken {
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

function getRealtokenBalances(
  realtoken: Realtoken,
  walletBalances: WalletBalances
) {
  const ethereumContract = realtoken.ethereumContract?.toLowerCase() ?? ''
  const gnosisContract = realtoken.gnosisContract?.toLowerCase() ?? ''

  return _mapValues(walletBalances, (balances, type) => {
    const balance = balances.find((item) => {
      return {
        ['ethereum']: item.token === ethereumContract,
        ['gnosis']: item.token === gnosisContract,
        ['rmm']: item.token === gnosisContract,
        ['levinSwap']: item.token === gnosisContract,
      }[type]
    })

    return {
      amount: balance?.amount ?? 0,
      value: (balance?.amount ?? 0) * realtoken.tokenPrice,
    }
  })
}

export const selectOwnedRealtokens = createSelector(
  selectRealtokens,
  (state: RootState) => state.wallets.balances,
  (realtokens, walletBalances) =>
    realtokens
      .map((realtoken) => {
        const balances = getRealtokenBalances(realtoken, walletBalances)
        return {
          ...realtoken,
          id: realtoken.uuid,
          balance: balances,
          amount: _sumBy(Object.values(balances), 'amount'),
          value: _sumBy(Object.values(balances), 'value'),
        }
      })
      .filter((item) => item.amount > 0)
)

export const selectOwnedRealtokensValue = createSelector(
  selectOwnedRealtokens,
  (realtokens) => ({
    total: _sumBy(realtokens, 'value'),
    ethereum: _sumBy(realtokens, (item) => item.balance.ethereum.value),
    gnosis: _sumBy(realtokens, (item) => item.balance.gnosis.value),
    rmm: _sumBy(realtokens, (item) => item.balance.rmm.value),
    levinSwap: _sumBy(realtokens, (item) => item.balance.levinSwap.value),
  })
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
  (rents, value) => (value.total > 0 ? rents.yearly / value.total : 0)
)

export const selectRmmDetails = createSelector(
  selectRealtokens,
  (state: RootState) => state.wallets.rmmPositions,
  (state: RootState) => state.currencies.rates,
  (realtokens, rmmProtocol, rates) => {
    const rmmDetails = rmmProtocol.reduce(
      (acc, item) => {
        const realtoken = realtokens.find(
          (realtoken) => item.token === realtoken.gnosisContract?.toLowerCase()
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

    return _mapValues(rmmDetails, (value) => value / rates.XDAI)
  }
)
