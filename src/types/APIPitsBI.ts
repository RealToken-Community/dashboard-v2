import { APIRealToken } from "./APIRealToken"

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
  NoExhibit = "No Exhibit",
  UpgradedAndReady = "Upgraded & Ready",
  Scheduled = "Scheduled",
}

export interface RealTokenPitsBI_Actions {
  exhibit_number: number // 0 = no exhibit, 1+ = exhibit number
  volume: number // Volume = no exhibit, 1+ = volume number
  priority: RealTokenToBeRepairedPriority // Priority of the action
  realt_status: RealTokenToBeFixedStatus // Status of the action
}

/*
"historic": {
            "yields": [
                {
                    "timsync": "2021-05-28T00:00:00",
                    "yield": 11.132823004248758,
                    "days_rented": 505.0
                },
                {
                    "timsync": "2022-10-15T00:00:00",
                    "yield": 10.408984244049615,
                    "days_rented": 268.5789364164699
                },
                {
                    "timsync": "2023-07-10T13:53:40.106383",
                    "yield": 0.0,
                    "days_rented": 126.77158973641204
                },
                {
                    "timsync": "2023-11-14T08:24:45.459609",
                    "yield": 11.69024472008,
                    "days_rented": 292.92324358310185
                },
                {
                    "timsync": "2024-09-02T06:34:13.705189",
                    "yield": 11.873281930942,
                    "days_rented": 321.1213302743287
                }
            ],
            "prices": [
                {
                    "timsync": "2021-05-28T00:00:00",
                    "price": 50.71
                },
                {
                    "timsync": "2022-10-15T00:00:00",
                    "price": 54.24
                }
            ],
            "avg_yield": 10.337340648126746,
            "init_yield": 11.132823004248758,
            "init_price": 50.71
        },
*/

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
  uuid: string

  // Only declare fields useful for us
  actions: RealTokenPitsBI_Actions
  historic: RealTokenPitsBI_Historic
}


export interface APIRealTokenPitsBI extends APIRealToken, APIRealTokenPitsBI_ExtraData {
  // PITS BI is 100% compliant with the APIRealToken structure
  // uuid, ...
  // PITS BI specific fields
  // Only declare fields useful for us
  // actions: RealTokenPitsBI_Actions
  // historic: RealTokenPitsBI_Historic
}
