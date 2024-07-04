import { gql } from '@apollo/client'

import { useCacheWithLocalStorage } from 'src/utils/useCache'

import { GnosisClient } from '../clients'

export async function getUserId(address: string): Promise<string | null> {
  const result = await executeGetUserIdQuery(address.toLowerCase())
  return result.data.account.userIds[0].userId ?? null
}

export async function getUserDetails(id: string) {
  const trustedIntermediary = '0x296033cb983747b68911244ec1a3f01d7708851b'
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
    GnosisClient().query<GetUserIdResult>({
      query: GetUserIdQuery,
      variables: { address },
    }),
  {
    duration: 1000 * 60 * 60 * 24, // 1 day
    key: 'GetUserIdQuery',
    usePreviousValueOnError: true,
  },
)

const executeGetUserDetailsQuery = useCacheWithLocalStorage(
  async (userId: string) =>
    GnosisClient().query<GetUserDetailsResult>({
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
