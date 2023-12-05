import { createSelector } from '@reduxjs/toolkit'

import _mapValues from 'lodash/mapValues'
import _sumBy from 'lodash/sumBy'
import moment from 'moment'

import { WalletBalances, WalletType } from 'src/repositories'
import { RootState } from 'src/store/store'
import { RentCalculation } from 'src/types/RentCalculation'
import { numberOfDaysIn } from 'src/utils/date'
import { getAverageTokenMult } from 'src/utils/math'

import { Realtoken, selectRealtokens } from '../realtokens/realtokensSelector'
import { selectUserRentCalculation } from '../settings/settingsSelector'

export interface UserRealtoken extends Realtoken {
  id: string
  isWhitelisted: boolean
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

export const selectUserRealtokens = createSelector(
  (state: RootState) => state.settings.user,
  selectRealtokens,
  (state: RootState) => state.wallets.balances,
  (user, realtokens, walletBalances) =>
    realtokens.map<UserRealtoken>((realtoken) => {
      const balances = getRealtokenBalances(realtoken, walletBalances)
      return {
        ...realtoken,
        isWhitelisted: (user?.whitelistAttributeKeys ?? []).includes(
          realtoken.tokenIdRules.toString()
        ),
        id: realtoken.uuid,
        balance: balances,
        amount: _sumBy(Object.values(balances), 'amount'),
        value: _sumBy(Object.values(balances), 'value'),
      }
    })
)

export const selectOwnedRealtokens = createSelector(
  selectUserRealtokens,
  (realtokens) => realtokens.filter((item) => item.amount > 0)
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
  selectUserRentCalculation,
  selectOwnedRealtokens,
  (rentCalculation, realTokens) => {
    const rents = { daily: 0, weekly: 0, monthly: 0, yearly: 0 }
    if (rentCalculation === RentCalculation.Global) {
      return realTokens.reduce(
        (acc, item) => ({
          daily: acc.daily + item.netRentDayPerToken * item.amount,
          weekly: acc.weekly + item.netRentDayPerToken * 7 * item.amount,
          monthly: acc.monthly + item.netRentMonthPerToken * item.amount,
          yearly: acc.yearly + item.netRentYearPerToken * item.amount,
        }),
        rents
      )
    }

    const now = moment(new Date().toUTCString())
    //here you can play with date to inspect different behaviors
    //const now = moment(new Date().toUTCString()).add(125, 'day')
    const rentDay = 'Monday'
    const oneWeekLater = now.clone().add(1, 'w')
    const oneMonthLater = now.clone().add(1, 'M')
    const oneYearLater = now.clone().add(1, 'y')
    const [, nbRentDayInMonth] = numberOfDaysIn(
      now,
      oneMonthLater,
      now,
      rentDay
    )
    const [, nbRentDayInYear] = numberOfDaysIn(now, oneYearLater, now, rentDay)

    for (const item of realTokens) {
      const rentStartDate = moment(item.rentStartDate.date)
      const rentPerWeek = item.netRentDayPerToken * 7 * item.amount
      const [weekDiff] = numberOfDaysIn(
        now,
        oneWeekLater,
        rentStartDate,
        rentDay
      )
      if (weekDiff === undefined) {
        const nbDaysMonthArr = numberOfDaysIn(
          now,
          oneMonthLater,
          rentStartDate,
          rentDay
        )
        const avgTokenDiffMonth = nbDaysMonthArr[0]
        const nbDaysYearArr = numberOfDaysIn(
          now,
          oneYearLater,
          rentStartDate,
          rentDay
        )
        const avgTokenDiffYear = nbDaysYearArr[0]
        const avgTokenMultMonth = getAverageTokenMult(avgTokenDiffMonth)
        const avgTokenMultYear = getAverageTokenMult(avgTokenDiffYear)
        const nbRentDayInMonth = nbDaysMonthArr[1] - 1 + avgTokenMultMonth
        const nbRentDayInYear = nbDaysYearArr[1] - 1 + avgTokenMultYear
        rents.monthly += rentPerWeek * nbRentDayInMonth
        rents.yearly += rentPerWeek * nbRentDayInYear
      } else if (weekDiff <= 0) {
        const avgTokenMult = getAverageTokenMult(weekDiff)
        rents.daily += item.netRentDayPerToken * item.amount * avgTokenMult
        rents.weekly += rentPerWeek * avgTokenMult
        rents.monthly += rentPerWeek * (nbRentDayInMonth - 1 + avgTokenMult)
        rents.yearly += rentPerWeek * (nbRentDayInYear - 1 + avgTokenMult)
      }
    }

    return rents
  }
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
