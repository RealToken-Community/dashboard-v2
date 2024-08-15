import { useMemo } from 'react'
import { useSelector } from 'react-redux'

import moment from 'moment'

import { selectUserRentCalculation } from 'src/store/features/settings/settingsSelector'
import { UserRealtoken } from 'src/store/features/wallets/walletsSelector'
import { RentCalculationState } from 'src/types/RentCalculation'

const fullyRentedAPREstimation = (token: UserRealtoken) => {
  // Case of fully rented property
  if (token.rentedUnits === token.totalUnits) {
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
    const realtimeDate = moment(new Date(rentCalculation.date))
    const rentStartDate = new Date(token.rentStartDate.date)
    const isDisabled =
      rentCalculation.state === RentCalculationState.Realtime &&
      rentStartDate > realtimeDate.toDate()
    if (isDisabled) return 0
    return fullyRentedAPREstimation(token)
  }, [token, rentCalculation])

  return fullyRentedAPR
}
