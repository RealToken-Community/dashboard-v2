import { APIRealToken } from './APIRealToken'

export enum APIPitsBiEnv {
  VERSION = 'PITSBI_API_VERSION',
  BASE = 'PITSBI_API_BASE',
  GET_ALLTOKENS = 'PITSBI_API_GET_ALLTOKENS',
  GET_LASTUPDATE = 'PITSBI_API_GET_LASTUPDATE',
}

export enum RealTokenToBeRepairedPriority {
  None = 0,
  High = 1,
  Medium = 2,
  Low = 3,
}

export enum RealTokenToBeFixedStatus {
  NoExhibit = 'No Exhibit',
  UpgradedAndReady = 'Upgraded & Ready',
  Scheduled = 'Scheduled',
}

export interface RealTokenPitsBI_Actions {
  exhibit_number: number // 0 = no exhibit, 1+ = exhibit number
  volume: number // Volume 0 = no exhibit, 1+ = exhibit volume number
  priority: RealTokenToBeRepairedPriority // Priority of the action
  realt_status: RealTokenToBeFixedStatus // Status of the action
}

export interface RealTokenPitsBI_Historic {
  yields: {
    timsync: string
    yield: number
    days_rented: number
  }[]
  prices: {
    timsync: string
    price: number
  }[]
  avg_yield: number
  init_yield: number
  init_price: number
}

export interface APIRealTokenPitsBI_ExtraData {
  // PITS BI is 100% compliant with the APIRealToken structure
  uuid: string
  // ...
  // PITS BI specific fields
  // Only declare fields useful for us
  actions: RealTokenPitsBI_Actions
  historic: RealTokenPitsBI_Historic
}

export interface APIRealTokenPitsBI
  extends APIRealToken,
    APIRealTokenPitsBI_ExtraData {}
