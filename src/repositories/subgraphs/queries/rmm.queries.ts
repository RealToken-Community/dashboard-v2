import { gql } from '@apollo/client'

import { useCacheWithLocalStorage } from 'src/utils/useCache'

import { RMMClient } from '../clients'

export async function getRmmBalances(addressList: string[]) {
  const result = await executeQuery(
    addressList.map((item) => item.toLowerCase())
  )
  return formatBalances(result.data.users)
}

export async function getRmmPositions(addressList: string[]) {
  const result = await executeQuery(
    addressList.map((item) => item.toLowerCase())
  )
  return formatPositions(result.data.users)
}

export interface RmmPosition {
  address: string
  positions: {
    token: string
    name: string
    amount: number
    debt: number
    isColateral: boolean
  }[]
}

const executeQuery = useCacheWithLocalStorage(
  async (addressList: string[]) =>
    RMMClient.query<RmmResult>({
      query: RmmQuery,
      variables: { addressList },
    }),
  {
    duration: 1000 * 60 * 10, // 10 minutes
    usePreviousValueOnError: true,
    key: 'RmmQuery',
  }
)

const RmmQuery = gql`
  query RmmQuery($addressList: [String]!) {
    users(where: { id_in: $addressList }) {
      id
      reserves(
        where: {
          or: [{ currentATokenBalance_gt: "0" }, { currentTotalDebt_gt: "0" }]
        }
      ) {
        reserve {
          underlyingAsset
          name
          decimals
          usageAsCollateralEnabled
        }
        currentATokenBalance
        currentTotalDebt
      }
    }
  }
`

interface RmmResult {
  users: {
    id: string
    reserves: {
      reserve: {
        underlyingAsset: string
        name: string
        decimals: number
        usageAsCollateralEnabled: boolean
      }
      currentATokenBalance: string
      currentTotalDebt: string
    }[]
  }[]
}

function formatBalances(users: RmmResult['users']) {
  return users.map((user) => ({
    address: user.id,
    balances: user.reserves.map((balance) => ({
      token: balance.reserve.underlyingAsset,
      amount:
        parseInt(balance.currentATokenBalance) / 10 ** balance.reserve.decimals,
    })),
  }))
}

function formatPositions(users: RmmResult['users']): RmmPosition[] {
  return users.map((user) => ({
    address: user.id,
    positions: user.reserves.map((position) => ({
      token: position.reserve.underlyingAsset,
      name: position.reserve.name,
      amount:
        parseInt(position.currentATokenBalance) /
        10 ** position.reserve.decimals,
      debt:
        parseInt(position.currentTotalDebt) / 10 ** position.reserve.decimals,
      isColateral: position.reserve.usageAsCollateralEnabled,
    })),
  }))
}
