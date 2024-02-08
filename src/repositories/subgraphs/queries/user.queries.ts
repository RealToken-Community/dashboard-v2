import { gql } from '@apollo/client'

import { useCacheWithLocalStorage } from 'src/utils/useCache'

import { GnosisClient } from '../clients'

export async function getUserId(address: string): Promise<string | null> {
  const result = await executeGetUserIdQuery(address.toLowerCase())
  return result.data.account.userIds[0].userId ?? null
}

export async function getUserDetails(id: string) {
  const trustedIntermediaries = await executeGetTrustedIntermediaryQuery()
  const trustedIntermediary =
    trustedIntermediaries.data.trustedIntermediaries[0].id

  const userId = `${trustedIntermediary}-${id}`
  const result = await executeGetUserDetailsQuery(userId)
  return { id, ...formatUserDetails(result.data) }
}

function formatUserDetails(result: GetUserDetailsResult) {
  return {
    addressList: result.accounts.map((item) => item.address),
    whitelistAttributeKeys: result.whitelist.attributeKeys.reduce<string[]>(
      (acc, key, index) => {
        if (result.whitelist.attributeValues[index] === '1') {
          acc.push(key)
        }
        return acc
      },
      [],
    ),
  }
}

const executeGetUserIdQuery = useCacheWithLocalStorage(
  async (address: string) =>
    GnosisClient.query<GetUserIdResult>({
      query: GetUserIdQuery,
      variables: { address },
    }),
  {
    duration: 1000 * 60 * 60 * 24, // 1 day
    key: 'GetUserIdQuery',
    usePreviousValueOnError: true,
  },
)

const executeGetTrustedIntermediaryQuery = useCacheWithLocalStorage(
  async () =>
    GnosisClient.query<GetTrustedIntermediaryResult>({
      query: GetTrustedIntermediaryQuery,
    }),
  {
    duration: 1000 * 60 * 60 * 24, // 1 day
    key: 'GetTrustedIntermediaryQuery',
    usePreviousValueOnError: true,
  },
)

const executeGetUserDetailsQuery = useCacheWithLocalStorage(
  async (userId: string) =>
    GnosisClient.query<GetUserDetailsResult>({
      query: GetUserDetailsQuery,
      variables: { userId },
    }),
  {
    duration: 1000 * 60 * 60 * 24, // 1 day
    key: 'GetUserDetailsQuery',
    usePreviousValueOnError: true,
  },
)

const GetUserIdQuery = gql`
  query GetUserIdQuery($address: String!) {
    account(id: $address) {
      userIds(orderBy: timestamp, orderDirection: desc, first: 1) {
        userId
      }
    }
  }
`

interface GetUserIdResult {
  account: {
    userIds: {
      userId: string
    }[]
  }
}

const GetTrustedIntermediaryQuery = gql`
  query GetTrustedIntermediaryQuery {
    trustedIntermediaries(orderBy: weight, orderDirection: desc, first: 1) {
      id
    }
  }
`

interface GetTrustedIntermediaryResult {
  trustedIntermediaries: {
    id: string
  }[]
}

const GetUserDetailsQuery = gql`
  query GetUserDetailsQuery($userId: String!) {
    accounts(where: { userIds: [$userId] }) {
      address
    }
    whitelist: userId(id: $userId) {
      attributeKeys
      attributeValues
    }
  }
`

interface GetUserDetailsResult {
  accounts: {
    address: string
  }[]
  whitelist: {
    attributeKeys: string[]
    attributeValues: string[]
  }
}
