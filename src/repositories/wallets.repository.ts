import { ApolloClient, InMemoryCache, gql } from '@apollo/client'

const GnosisClient = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/realtoken-thegraph/realtoken-xdai',
  cache: new InMemoryCache(),
})

const EthereumClient = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/realtoken-thegraph/realtoken-eth',
  cache: new InMemoryCache(),
})

const RMMClient = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/realtoken-thegraph/rmm-realt',
  cache: new InMemoryCache(),
})

const RealTokenQuery = gql`
  query RealTokenQuery($addressList: [String]!) {
    accounts(where: { address_in: $addressList }) {
      address
      balances(
        where: { amount_gt: "0" }
        first: 1000
        orderBy: amount
        orderDirection: desc
      ) {
        token {
          address
        }
        amount
      }
    }
  }
`

interface RealTokenResult {
  accounts: {
    address: string
    balances: {
      token: {
        address: string
      }
      amount: string
    }[]
  }[]
}

const RMMQuery = gql`
  query RMMQuery($addressList: [String]!) {
    users(where: { id_in: $addressList }) {
      id
      reserves(where: { currentATokenBalance_gt: "0" }) {
        reserve {
          underlyingAsset
          decimals
        }
        currentATokenBalance
      }
    }
  }
`

interface RMMResult {
  users: {
    id: string
    reserves: {
      reserve: {
        underlyingAsset: string
        decimals: number
      }
      currentATokenBalance: string
    }[]
  }[]
}

enum WalletType {
  Gnosis = 'gnosis',
  Ethereum = 'ethereum',
  RMM = 'rmm',
}

interface Wallet {
  type: WalletType
  address: string
  balances: {
    address: string
    amount: number
  }[]
}

async function getWalletsResult(addressList: string[]): Promise<Wallet[]> {
  const [gnosisResult, ethereumResult, rmmResult] = await Promise.all([
    GnosisClient.query<RealTokenResult>({
      query: RealTokenQuery,
      variables: { addressList },
    }),
    EthereumClient.query<RealTokenResult>({
      query: RealTokenQuery,
      variables: { addressList },
    }),
    RMMClient.query<RMMResult>({
      query: RMMQuery,
      variables: { addressList },
    }),
  ])

  const gnosisWallets = gnosisResult.data.accounts.map((account) => ({
    type: WalletType.Gnosis,
    address: account.address,
    balances: account.balances.map((balance) => ({
      address: balance.token.address,
      amount: parseFloat(balance.amount),
    })),
  }))

  const ethereumWallets = ethereumResult.data.accounts.map((account) => ({
    type: WalletType.Ethereum,
    address: account.address,
    balances: account.balances.map((balance) => ({
      address: balance.token.address,
      amount: parseFloat(balance.amount),
    })),
  }))

  const rmmWallets = rmmResult.data.users.map((user) => ({
    type: WalletType.RMM,
    address: user.id,
    balances: user.reserves.map((reserve) => ({
      address: reserve.reserve.underlyingAsset,
      amount:
        parseInt(reserve.currentATokenBalance) / 10 ** reserve.reserve.decimals,
    })),
  }))

  return [...gnosisWallets, ...ethereumWallets, ...rmmWallets]
}

interface WalletBalance {
  address: string
  amount: number
}

export interface GetWalletBalance {
  gnosis: WalletBalance[]
  ethereum: WalletBalance[]
  rmm: WalletBalance[]
  computed: WalletBalance[]
}

export const WalletsRepository = {
  async getBalances(addressList: string[]) {
    const walletsResult = await getWalletsResult(addressList)

    const result: GetWalletBalance = {
      [WalletType.Gnosis]: [],
      [WalletType.Ethereum]: [],
      [WalletType.RMM]: [],
      computed: [],
    }

    return walletsResult.reduce((acc, wallet) => {
      wallet.balances.forEach((balance) => {
        const existingBalance = acc[wallet.type].find(
          (b) => b.address === balance.address
        )

        if (existingBalance) {
          existingBalance.amount += balance.amount
        } else {
          acc[wallet.type].push(balance)
        }

        const computedBalance = acc.computed.find(
          (b) => b.address === balance.address
        )

        if (computedBalance) {
          computedBalance.amount += balance.amount
        } else {
          acc.computed.push(balance)
        }
      })

      return acc
    }, result)
  },
}
