import { gql } from '@apollo/client'

import { useCacheWithLocalStorage } from 'src/utils/useCache'

import { GnosisClient } from '../clients'

export async function getRealTokenTransfers(
  addressList: string[],
  tokenList: string[]
) {
  const result = await executeQuery(
    addressList.map((item) => item.toLowerCase()),
    tokenList.map((item) => item.toLowerCase())
  )
  return result.data.transferEvents
}

const executeQuery = useCacheWithLocalStorage(
  async (addressList: string[], tokenList: string[]) =>
    GnosisClient.query<RealTokenTransferResult>({
      query: RealTokenTransferQuery,
      variables: { addressList, tokenList },
    }),
  {
    duration: 1000 * 60 * 10, // 10 minutes
    key: 'RealTokenTransferQuery',
    usePreviousValueOnError: true,
  }
)

const RealTokenTransferQuery = gql`
  query RealTokenTransferQuery(
    $addressList: [String!]!
    $tokenList: [String!]!
  ) {
    transferEvents(
      where: {
        and: [
          { token_in: $tokenList }
          {
            or: [{ source_in: $addressList }, { destination_in: $addressList }]
          }
        ]
      }
      orderBy: timestamp
      orderDirection: desc
      first: 1000
    ) {
      amount
      source
      destination
      sender
      timestamp
      token {
        id
      }
      transaction {
        id
        to
      }
    }
  }
`

export interface TransferEvent {
  amount: string
  source: string
  destination: string
  timestamp: string
  token: { id: string }
  transaction: { id: string; to: string }
}

interface RealTokenTransferResult {
  transferEvents: TransferEvent[]
}
