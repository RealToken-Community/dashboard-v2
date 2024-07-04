import { createSelector } from '@reduxjs/toolkit'

import _mapValues from 'lodash/mapValues'
import _max from 'lodash/max'
import _sumBy from 'lodash/sumBy'
import moment from 'moment'

import { WalletBalances, WalletType } from 'src/repositories'
import { UserRealTokenTransfer } from 'src/repositories/transfers/transfers.type'
import { RootState } from 'src/store/store'
import { RealToken, RealTokenCanal } from 'src/types/RealToken'
import {
  RentCalculation,
  RentCalculationState,
} from 'src/types/RentCalculation'
import { computeUCP } from 'src/utils/transfer/computeUCP'

import { selectRealtokens } from '../realtokens/realtokensSelector'
import { selectUserRentCalculation } from '../settings/settingsSelector'

export interface UserRealtoken extends RealToken {
  id: string
  isWhitelisted: boolean
  amount: number
  value: number
  transfers: UserRealTokenTransfer[]
  unitPriceCost?: number
  priceCost?: number
  unrealizedCapitalGain?: number
  lastChanges: string
  balance: Record<
    WalletType,
    {
      amount: number
      value: number
    }
  >
}

const DAYS_PER_YEAR = 365
const MONTHS_PER_YEAR = 12
const AVG_DAYS_PER_MONTH = DAYS_PER_YEAR / MONTHS_PER_YEAR

function getRealtokenBalances(
  realtoken: RealToken,
  walletBalances: WalletBalances,
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

export const selectAllUserRealtokens = createSelector(
  (state: RootState) => state.settings.user,
  selectRealtokens,
  (state: RootState) => state.wallets.balances,
  (state: RootState) => state.transfers.transfers,
  (user, realtokens, walletBalances, allTransfers) =>
    realtokens.map<UserRealtoken>((realtoken) => {
      const balance = getRealtokenBalances(realtoken, walletBalances)
      const transfers = allTransfers.filter(
        (item) => item.realtoken === realtoken.uuid,
      )
      const amount = _sumBy(Object.values(balance), 'amount')
      const value = _sumBy(Object.values(balance), 'value')
      const unitPriceCost = computeUCP(transfers) ?? realtoken.tokenPrice
      const priceCost = unitPriceCost * amount
      const unrealizedCapitalGain = value - priceCost
      const lastChanges = _max(realtoken.history.map((item) => item.date))!

      return {
        ...realtoken,
        isWhitelisted: (user?.whitelistAttributeKeys ?? []).includes(
          realtoken.tokenIdRules.toString(),
        ),
        id: realtoken.uuid,
        balance,
        amount,
        value,
        transfers,
        unitPriceCost,
        priceCost,
        unrealizedCapitalGain,
        lastChanges,
      }
    }),
)

export const selectUserRealtokens = createSelector(
  selectAllUserRealtokens,
  (realtokens) => {
    const hiddenRealtokenCanals = [
      RealTokenCanal.OfferingClosed,
      RealTokenCanal.TokensMigrated,
    ]
    return realtokens.filter(
      (item) => !hiddenRealtokenCanals.includes(item.canal),
    )
  },
)

export const selectOwnedRealtokens = createSelector(
  selectUserRealtokens,
  (realtokens) => realtokens.filter((item) => item.amount > 0),
)

export const selectOwnedRealtokensValue = createSelector(
  selectOwnedRealtokens,
  (realtokens) => ({
    total: _sumBy(realtokens, 'value'),
    totalPriceCost: _sumBy(realtokens, 'priceCost'),
    ethereum: _sumBy(realtokens, (item) => item.balance.ethereum.value),
    gnosis: _sumBy(realtokens, (item) => item.balance.gnosis.value),
    rmm: _sumBy(realtokens, (item) => item.balance.rmm.value),
    levinSwap: _sumBy(realtokens, (item) => item.balance.levinSwap.value),
  }),
)

export const calculateTokenRent = (
  token: UserRealtoken,
  rentCalculation: RentCalculation = {
    state: RentCalculationState.Global,
    date: new Date().getTime(),
  },
) => {
  const realtimeDate = moment(new Date(rentCalculation.date))
  const rent = {
    daily: token.netRentDayPerToken * token.amount,
    weekly: token.netRentDayPerToken * 7 * token.amount,
    monthly: token.netRentMonthPerToken * token.amount,
    yearly: token.netRentYearPerToken * token.amount,
  }

  if (rentCalculation.state === RentCalculationState.Realtime) {
    const rentStartDate = moment(token.rentStartDate.date)
    const nbDaysBeforeRentStart = rentStartDate.diff(realtimeDate, 'days')

    if (nbDaysBeforeRentStart >= 0) {
      rent.daily -= token.netRentDayPerToken * token.amount
      rent.weekly -=
        Math.min(7, nbDaysBeforeRentStart) *
        token.netRentDayPerToken *
        token.amount
      rent.monthly -=
        Math.min(AVG_DAYS_PER_MONTH, nbDaysBeforeRentStart) *
        token.netRentDayPerToken *
        token.amount
      rent.yearly -=
        Math.min(DAYS_PER_YEAR, nbDaysBeforeRentStart) *
        token.netRentDayPerToken *
        token.amount
    }
  }

  return rent
}

export const selectOwnedRealtokensRents = createSelector(
  selectUserRentCalculation,
  selectOwnedRealtokens,
  (rentCalculation, realTokens) => {
    const rents = { daily: 0, weekly: 0, monthly: 0, yearly: 0 }
    return realTokens.reduce((acc, realToken) => {
      const rent = calculateTokenRent(realToken, rentCalculation)
      return {
        daily: acc.daily + rent.daily,
        weekly: acc.weekly + rent.weekly,
        monthly: acc.monthly + rent.monthly,
        yearly: acc.yearly + rent.yearly,
      }
    }, rents)
  },
)

export const selectOwnedRealtokensAPY = createSelector(
  selectOwnedRealtokensRents,
  selectOwnedRealtokensValue,
  (rents, value) => (value.total > 0 ? rents.yearly / value.total : 0),
)

export const selectRmmDetails = createSelector(
  selectRealtokens,
  (state: RootState) => state.wallets.rmmPositions,
  (state: RootState) => state.currencies.rates,
  (realtokens, rmmProtocol, rates) => {
    const rmmDetails = rmmProtocol.reduce(
      (acc, item) => {
        const realtoken = realtokens.find(
          (realtoken) => item.token === realtoken.gnosisContract?.toLowerCase(),
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
      { stableDeposit: 0, totalDeposit: 0, stableDebt: 0 },
    )

    return _mapValues(rmmDetails, (value) => value / rates.XDAI)
  },
)
