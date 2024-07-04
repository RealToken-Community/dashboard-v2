import { gql } from '@apollo/client'

import { EthereumClient, GnosisClient } from '../clients'

export async function getRealTokenTransfers(options: {
  addressList: string[]
  timestamp?: number
}) {
  const addressList = options.addressList.map((item) => item.toLowerCase())
  const timestamp = options.timestamp
  const [ethereumResults, gnosisResults] = await Promise.all([
    executeQuery(addressList, 1, timestamp),
    executeQuery(addressList, 100, timestamp),
  ])
  return [...ethereumResults, ...gnosisResults].sort(
    (a, b) => parseInt(a.timestamp) - parseInt(b.timestamp),
  )
}

async function executeQuery(
  addressList: string[],
  chainId: number,
  timestamp?: number,
) {
  const limit = 1000

  const client = {
    [1]: EthereumClient,
    [100]: GnosisClient,
  }[chainId]

  if (!client) throw new Error(`Chain ID ${chainId} is not supported`)

  const execute = async (lastId: string) =>
    client().query<RealTokenTransferResult>({
      query: RealTokenTransferQuery,
      variables: { addressList, limit, lastId, timestamp },
    })

  // Run execute until there is less than 1000 results
  const results = []
  let lastId = ''
  while (true) {
    const result = await execute(lastId)
    results.push(
      result.data.transferEvents.map((item) => ({ ...item, chainId })),
    )
    if (result.data.transferEvents.length < limit) break
    lastId = result.data.transferEvents[limit - 1].id
  }
  return results.flat()
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
  chainId: number
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
