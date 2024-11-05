import { gql } from '@apollo/client'

import { useCacheWithLocalStorage } from 'src/utils/useCache'

import { GnosisClient } from '../clients'

export async function getUserId(address: string): Promise<string | null> {
  return executeGetUserIdQuery(address.toLowerCase())
}

export async function getUserDetails(id: string) {
  return executeGetUserDetailsQuery(id)
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
  async (address: string) => {
    const response = await GnosisClient().query<GetUserIdResult>({
      query: GetUserIdQuery,
      variables: { address },
    })
    return response.data?.account?.userIds[0].userId ?? null
  },
  {
    duration: 1000 * 60 * 60 * 24 * 7, // 7 days
    key: 'GetUserIdQuery',
    usePreviousValueOnError: true,
  },
)

const executeGetUserDetailsQuery = useCacheWithLocalStorage(
  async (userId: string) => {
    const trustedIntermediary = '0x296033cb983747b68911244ec1a3f01d7708851b'
    const response = await GnosisClient().query<GetUserDetailsResult>({
      query: GetUserDetailsQuery,
      variables: { userId: `${trustedIntermediary}-${userId}` },
    })

    return { id: userId, ...formatUserDetails(response.data) }
  },
  {
    duration: 1000 * 60 * 60 * 24 * 7, // 7 days
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
