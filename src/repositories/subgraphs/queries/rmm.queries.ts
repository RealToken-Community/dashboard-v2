import { gql } from '@apollo/client'

import _keyBy from 'lodash/keyBy'

import { useCacheWithLocalStorage } from 'src/utils/useCache'

import { RMM2Client, RMM3Client, RMM3WrapperClient } from '../clients'

const WRAPPER_ADDRESS = '0xd3dff217818b4f33eb38a243158fbed2bbb029d3'

export async function getRmmBalances(addressList: string[]) {
  const addresses = addressList.map((item) => item.toLowerCase())
  const [resultRMM2, resultRMM3] = await Promise.all([
    executeRMM2Query(addresses),
    executeRMM3Query(addresses),
  ])
  return formatBalances([...resultRMM2.data.users, ...resultRMM3.data.users])
}

export async function getRmmPositions(addressList: string[]) {
  const addresses = addressList.map((item) => item.toLowerCase())
  const [resultRMM2, resultRMM3] = await Promise.all([
    executeRMM2Query(addresses),
    executeRMM3Query(addresses),
  ])
  return formatPositions([...resultRMM2.data.users, ...resultRMM3.data.users])
}

export interface RmmPosition {
  address: string
  positions: {
    token: string
    name: string
    amount: number
    debt: number
  }[]
}

const executeRMM2Query = useCacheWithLocalStorage(
  async (addressList: string[]) =>
    RMM2Client().query<RmmResult>({
      query: RmmQuery,
      variables: { addressList },
    }),
  {
    duration: 1000 * 60 * 10, // 10 minutes
    usePreviousValueOnError: true,
    key: 'Rmm2Query',
  },
)

const executeRMM3Query = useCacheWithLocalStorage(
  async (addressList: string[]) => {
    const result = await RMM3WrapperClient().query<RmmWrapperResult>({
      query: RmmWrapperQuery,
      variables: { addressList },
    })

    return {
      data: {
        users: result.data.users.map((user) => ({
          id: user.id,
          reserves: user.balances.map((balance) => ({
            reserve: {
              underlyingAsset: balance.token.address,
              name: balance.token.name,
              decimals: balance.token.decimals,
            },
            currentATokenBalance: balance.amount,
            currentTotalDebt: '0',
          })),
        })),
      },
    }
  },
  {
    duration: 1000 * 60 * 10, // 10 minutes
    usePreviousValueOnError: true,
    key: 'Rmm3Query',
  },
)

const RmmQuery = gql`
  query RmmQuery($addressList: [String]!) {
    users(where: { id_in: $addressList }) {
      id
      reserves(
        first: 1000
        where: {
          or: [{ currentATokenBalance_gt: "0" }, { currentTotalDebt_gt: "0" }]
        }
      ) {
        reserve {
          underlyingAsset
          name
          decimals
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
      }
      currentATokenBalance: string
      currentTotalDebt: string
    }[]
  }[]
}

const RmmWrapperQuery = gql`
  query RmmQuery($addressList: [String]!) {
    users(where: { id_in: $addressList }) {
      id
      balances(first: 1000) {
        token {
          name
          address
          decimals
        }
        amount
      }
    }
  }
`

interface RmmWrapperResult {
  users: {
    id: string
    balances: {
      token: {
        name: string
        address: string
        decimals: number
      }
      amount: string
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
    })),
  }))
}
