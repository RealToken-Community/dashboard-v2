import { ApolloClient, InMemoryCache, gql } from '@apollo/client'

import { APIRealToken } from 'src/types/APIRealToken'

const RealtokenClient = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/realtoken-thegraph/realtoken-xdai',
  cache: new InMemoryCache(),
})

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

interface RealTokenTransferResult {
  transferEvents: {
    amount: string
    source: string
    destination: string
    timestamp: string
    token: { id: string }
    transaction: { id: string; to: string }
  }[]
}

export enum TransferOrigin {
  primary = 'primary',
  reinvest = 'reinvest',
  swapcat = 'swapcat',
  yam = 'yam',
  rmm = 'rmm',
  internal = 'internal',
  other = 'other',
}

export enum TransferDirection {
  in = 'in',
  out = 'out',
}

export interface RealTokenTransfer {
  timestamp: number
  amount: number
  direction: TransferDirection
  origin: TransferOrigin
}

export async function GetRealTokenTransfers(params: {
  addressList: string[]
  realtokenList: APIRealToken[]
}) {
  const addressList = params.addressList.map((item) => item.toLowerCase())
  const tokenList = params.realtokenList.map((item) =>
    item.blockchainAddresses.xDai.contract.toLowerCase()
  )

  const result = await RealtokenClient.query<RealTokenTransferResult>({
    query: RealTokenTransferQuery,
    variables: { addressList, tokenList },
  })

  return result.data.transferEvents.map<RealTokenTransfer>((transfer) => ({
    timestamp: Number(transfer.timestamp),
    amount: Number(transfer.amount),
    direction: addressList.includes(transfer.source)
      ? TransferDirection.out
      : TransferDirection.in,
    origin: getTransferOrigin(
      transfer,
      addressList,
      params.realtokenList.find(
        (item) =>
          item.blockchainAddresses.xDai.contract.toLowerCase() ===
          transfer.token.id.toLowerCase()
      )
    ),
  }))
}

const SWAPCAT_CONTRACT = '0xb18713ac02fc2090c0447e539524a5c76f327a3b'
const YAM_CONTRACT = '0xc759aa7f9dd9720a1502c104dae4f9852bb17c14'

function getTransferOrigin(
  item: RealTokenTransferResult['transferEvents'][0],
  addressList: string[],
  realtoken?: APIRealToken
) {
  const addresses = [item.source, item.destination]
  const { distributor, rmmPoolAddress } =
    realtoken?.blockchainAddresses.xDai ?? {}

  if (
    addressList.includes(item.source) &&
    addressList.includes(item.destination)
  ) {
    return TransferOrigin.internal
  }

  if (addresses.includes((distributor || '').toLowerCase())) {
    return Number(item.amount) % 1 === 0
      ? TransferOrigin.primary
      : TransferOrigin.reinvest
  }

  if (item.transaction.to === SWAPCAT_CONTRACT) {
    return TransferOrigin.swapcat
  }

  if (item.transaction.to === YAM_CONTRACT) {
    return TransferOrigin.yam
  }

  if (addresses.includes((rmmPoolAddress || '').toLowerCase())) {
    return TransferOrigin.rmm
  }

  return TransferOrigin.other
}
