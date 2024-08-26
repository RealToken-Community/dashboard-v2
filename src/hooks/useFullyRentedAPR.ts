import { useMemo } from 'react'
import { useSelector } from 'react-redux'

import moment from 'moment'

import { selectUserRentCalculation } from 'src/store/features/settings/settingsSelector'
import { UserRealtoken } from 'src/store/features/wallets/walletsSelector'
import {
  RentCalculation,
  RentCalculationState,
} from 'src/types/RentCalculation'

const fullyRentedAPREstimation = (token: UserRealtoken) => {
  // VEFA
  if (token.shortName === 'Playa Caracol Cottage 10') return 10.77
  else if (token.shortName === 'Playa Caracol 303300') return 10.69
  else if (token.shortName === 'Playa Caracol 303200') return 10.8
  else if (token.shortName === 'PH Pinoalto A002') return 10.11
  else if (token.shortName === 'PH Pinoalto A003') return 10.11
  else if (token.shortName === 'Vervana T1 ') return 11.33

  if (token.rentedUnits === token.totalUnits) {
    // Case of fully rented property
    return token.annualPercentageYield
  }

  // Case of property with no rented unit but with APR (e.g. RMM or rent paid by inssurance)
  if (token.rentedUnits === 0 && token.annualPercentageYield !== 0) {
    return token.annualPercentageYield
  }

  if (token.history.length > 0) {
    let propInfo = token.history[0].values
    const history = token.history.map((h) => {
      propInfo = { ...propInfo, ...h.values }
      return propInfo
    })

    const previousAPR = history
      .map((h) => {
        if (
          h.rentedUnits &&
          h.rentedUnits !== 0 &&
          h.netRentYear &&
          h.tokenPrice
        ) {
          return (
            ((h.netRentYear * token.totalUnits) /
              (token.totalTokens * h.tokenPrice * h.rentedUnits)) *
            100
          )
        }
        return 0
      })
      .filter((apr) => apr !== undefined)

    // Assuming the highest APR is the most accurate
    return Math.max(...previousAPR, token.annualPercentageYield)
  }

  return Math.max(token.annualPercentageYield, 0)
}

export const useFullyRentedAPR = (token: UserRealtoken) => {
  const rentCalculation = useSelector(selectUserRentCalculation)

  const fullyRentedAPR = useMemo(() => {
    const isDisabled = APRDisabled(rentCalculation, token)
    if (isDisabled) return 0
    return fullyRentedAPREstimation(token)
  }, [token, rentCalculation])

  return fullyRentedAPR
}

export const useGeneralFullyRentedAPR = (tokens: UserRealtoken[]) => {
  const rentCalculation = useSelector(selectUserRentCalculation)
  // Fully rented APR average using valuation ponderation
  const fullyRentedAPR = useMemo(() => {
    const totalValue = tokens.reduce((acc, token) => {
      const isDisabled = APRDisabled(rentCalculation, token)
      if (isDisabled) return acc
      return acc + token.value
    }, 0)
    const totalAPR = tokens.reduce((acc, token) => {
      const isDisabled = APRDisabled(rentCalculation, token)
      if (isDisabled) return acc
      return acc + token.value * fullyRentedAPREstimation(token)
    }, 0)
    return totalAPR / totalValue
  }, [tokens, rentCalculation])

  return fullyRentedAPR
}

const APRDisabled = (
  rentCalculation: RentCalculation,
  token: UserRealtoken,
) => {
  const realtimeDate = moment(new Date(rentCalculation.date))
  const rentStartDate = new Date(token.rentStartDate.date)
  const isDisabled =
    rentCalculation.state === RentCalculationState.Realtime &&
    rentStartDate > realtimeDate.toDate()
  return isDisabled
}
