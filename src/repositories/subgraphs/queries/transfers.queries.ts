import { gql } from '@apollo/client'

import { GnosisClient } from '../clients'

export async function getRealTokenTransfers(options: {
  addressList: string[]
  timestamp?: number
}) {
  const results = await executeQuery(
    options.addressList.map((item) => item.toLowerCase()),
    options.timestamp,
  )
  return results
    .map((item) => item.data.transferEvents)
    .flat()
    .sort((a, b) => parseInt(a.timestamp) - parseInt(b.timestamp))
}

async function executeQuery(addressList: string[], timestamp?: number) {
  const limit = 1000

  const execute = async (lastId: string) =>
    GnosisClient.query<RealTokenTransferResult>({
      query: RealTokenTransferQuery,
      variables: { addressList, limit, lastId, timestamp },
    })

  // Run execute until there is less than 1000 results
  const results = []
  let lastId = ''
  while (true) {
    const result = await execute(lastId)
    results.push(result)
    if (result.data.transferEvents.length < limit) break
    lastId = result.data.transferEvents[limit - 1].id
  }
  return results
}

const RealTokenTransferQuery = gql`
  query RealTokenTransferQuery(
    $addressList: [String!]!
    $limit: Int!
    $lastId: String!
    $timestamp: Int
  ) {
    transferEvents(
      where: {
        and: [
          {
            or: [{ source_in: $addressList }, { destination_in: $addressList }]
          }
          { timestamp_gte: $timestamp }
          { id_gt: $lastId }
        ]
      }
      first: $limit
    ) {
      id
      amount
      source
      destination
      sender
      timestamp
      block
      token {
        id
      }
      transaction {
        id
        to
        input
      }
    }
  }
`

export interface TransferEvent {
  id: string
  amount: string
  source: string
  destination: string
  timestamp: string
  block: string
  token: { id: string }
  transaction: { id: string; to: string }
}

interface RealTokenTransferResult {
  transferEvents: TransferEvent[]
}
