import { gql } from '@apollo/client'

import { formatUnits } from 'ethers'

import { useCacheWithLocalStorage } from 'src/utils/useCache'

import { RMM3Client, RMM3WrapperClient } from '../clients'

export async function getRmmBalances(addressList: string[]) {
  const addresses = addressList.map((item) => item.toLowerCase())
  const resultRMM3Wrapper = await executeRMM3WrapperQuery(addresses)
  const balances = formatWrapperBalances([...resultRMM3Wrapper.data.users])
  if (process.env.NODE_ENV !== 'production') {
    console.info('[RMM_WRAPPER_DEBUG] RMM balances fetched', {
      addresses: addresses.length,
      wallets: balances.length,
      nonEmptyWallets: balances.filter((wallet) => wallet.balances.length > 0)
        .length,
    })
  }
  return balances
}

export async function getRmmPositions(addressList: string[]) {
  const addresses = addressList.map((item) => item.toLowerCase())
  const [resultRMM3Pool, resultRMM3Wrapper] = await Promise.all([
    executeRMM3PoolQuery(addresses),
    executeRMM3WrapperQuery(addresses),
  ])
  const merged = mergeWalletsPositions([
    ...formatPoolPositions([...resultRMM3Pool.data.users]),
    ...formatWrapperPositions([...resultRMM3Wrapper.data.users]),
  ])
  if (process.env.NODE_ENV !== 'production') {
    console.info('[RMM_WRAPPER_DEBUG] RMM positions fetched', {
      addresses: addresses.length,
      positions: merged.length,
      uniqueTokens: new Set(merged.map((item) => item.token)).size,
    })
  }
  return merged
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

const executeRMM3PoolQuery = useCacheWithLocalStorage(
  async (addressList: string[]) => {
    return RMM3Client().query<RmmPoolResult>({
      query: RmmPoolQuery,
      variables: { addressList },
    })
  },
  {
    duration: 1000 * 60 * 60 * 24, // 24 hours
    usePreviousValueOnError: true,
    key: 'Rmm3PoolQuery-v1',
  },
)

const executeRMM3WrapperQuery = useCacheWithLocalStorage(
  async (addressList: string[]) => {
    const result = await RMM3WrapperClient().query<RmmWrapperResult>({
      query: RmmWrapperQuery,
      variables: { addressList },
    })
    return result
  },
  {
    duration: 1000 * 60 * 60 * 24, // 24 hours
    usePreviousValueOnError: true,
    key: 'Rmm3WrapperQuery-v3',
  },
)

interface RmmPoolResult {
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

const RmmPoolQuery = gql`
  query RmmPoolQuery($addressList: [String]!) {
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

function formatWrapperBalances(users: RmmWrapperResult['users']) {
  return users.map((user) => ({
    address: user.id,
    balances: user.balances.map((balance) => ({
      token: balance.token.address.toLowerCase(),
      amount: parseTokenAmount(balance.amount, balance.token.decimals),
    })),
  }))
}

function formatPoolPositions(users: RmmPoolResult['users']): RmmPosition[] {
  return users.map((user) => ({
    address: user.id,
    positions: user.reserves.map((position) => ({
      token: position.reserve.underlyingAsset.toLowerCase(),
      name: position.reserve.name,
      amount:
        parseFloat(position.currentATokenBalance) /
        10 ** position.reserve.decimals,
      debt:
        parseFloat(position.currentTotalDebt) / 10 ** position.reserve.decimals,
    })),
  }))
}

function formatWrapperPositions(
  users: RmmWrapperResult['users'],
): RmmPosition[] {
  return users.map((user) => ({
    address: user.id,
    positions: user.balances.map((position) => ({
      token: position.token.address.toLowerCase(),
      name: position.token.name,
      amount: parseTokenAmount(position.amount, position.token.decimals),
      debt: 0,
    })),
  }))
}

function parseTokenAmount(rawAmount: string, decimals: number) {
  try {
    return Number(formatUnits(rawAmount, decimals))
  } catch {
    return 0
  }
}

function mergeWalletsPositions(wallets: RmmPosition[]) {
  const merged: Record<
    string,
    {
      token: string
      name: string
      amount: number
      debt: number
    }
  > = {}

  wallets.forEach((wallet) => {
    wallet.positions.forEach((position) => {
      const key = position.token
      if (!merged[key]) {
        merged[key] = { ...position }
      } else {
        merged[key].amount += position.amount
        merged[key].debt += position.debt
      }
    })
  })

  return Object.values(merged)
}
