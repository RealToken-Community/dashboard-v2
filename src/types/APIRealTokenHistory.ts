import { RealTokenCanal } from './RealToken'

export interface RealTokenHistoryItem {
  date: string
  values: Partial<{
    canal: RealTokenCanal
    tokenPrice: number
    underlyingAssetPrice: number
    initialMaintenanceReserve: number
    renovationReserve: number
    totalInvestment: number
    grossRentYear: number
    netRentYear: number
    rentedUnits: number
  }>
}

export interface APIRealTokenHistory {
  uuid: string
  history: RealTokenHistoryItem[]
}
