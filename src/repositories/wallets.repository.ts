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
      reserves(
        where: {
          or: [{ currentATokenBalance_gt: "0" }, { currentTotalDebt_gt: "0" }]
        }
      ) {
        reserve {
          underlyingAsset
          name
          decimals
          usageAsCollateralEnabled
        }
        currentATokenBalance
        currentTotalDebt
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
        name: string
        decimals: number
        usageAsCollateralEnabled: boolean
      }
      currentATokenBalance: string
      currentTotalDebt: string
    }[]
  }[]
}

enum WalletType {
  Gnosis = 'gnosis',
  Ethereum = 'ethereum',
  RMM = 'rmm',
  RMMProtocol = 'rmmProtocol',
}

interface StandardWallet {
  type: WalletType.Gnosis | WalletType.Ethereum | WalletType.RMM
  address: string
  balances: {
    address: string
    amount: number
  }[]
}

interface RMMProtocolWallet {
  type: WalletType.RMMProtocol
  address: string
  balances: {
    address: string
    name: string
    amount: number
    debt: number
  }[]
}

type Wallet = StandardWallet | RMMProtocolWallet

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

  const gnosisWallets: StandardWallet[] = gnosisResult.data.accounts.map(
    (account) => ({
      type: WalletType.Gnosis,
      address: account.address,
      balances: account.balances.map((balance) => ({
        address: balance.token.address,
        amount: parseFloat(balance.amount),
      })),
    })
  )

  const ethereumWallets: StandardWallet[] = ethereumResult.data.accounts.map(
    (account) => ({
      type: WalletType.Ethereum,
      address: account.address,
      balances: account.balances.map((balance) => ({
        address: balance.token.address,
        amount: parseFloat(balance.amount),
      })),
    })
  )

  const rmmWallets: StandardWallet[] = rmmResult.data.users.map((user) => ({
    type: WalletType.RMM,
    address: user.id,
    balances: user.reserves.map((reserve) => ({
      address: reserve.reserve.underlyingAsset,
      amount:
        parseInt(reserve.currentATokenBalance) / 10 ** reserve.reserve.decimals,
    })),
  }))

  const rmmProtocol: RMMProtocolWallet[] = rmmResult.data.users.map((user) => ({
    type: WalletType.RMMProtocol,
    address: user.id,
    balances: user.reserves.map((reserve) => ({
      address: reserve.reserve.underlyingAsset,
      name: reserve.reserve.name,
      amount:
        parseInt(reserve.currentATokenBalance) / 10 ** reserve.reserve.decimals,
      debt: parseInt(reserve.currentTotalDebt) / 10 ** reserve.reserve.decimals,
      isCollateral: reserve.reserve.usageAsCollateralEnabled,
    })),
  }))

  return [...gnosisWallets, ...ethereumWallets, ...rmmWallets, ...rmmProtocol]
}

interface WalletBalance {
  address: string
  amount: number
}

interface GetRMMProtocolBalance {
  address: string
  name: string
  amount: number
  debt: number
}

export interface GetWalletBalance {
  gnosis: WalletBalance[]
  ethereum: WalletBalance[]
  rmm: WalletBalance[]
  rmmProtocol: GetRMMProtocolBalance[]
  computed: WalletBalance[]
}

function getRMMProtocol(wallets: Wallet[]): GetRMMProtocolBalance[] {
  const rmmProtocolWalletList = wallets.filter(
    (item) => item.type === WalletType.RMMProtocol
  ) as RMMProtocolWallet[]

  return rmmProtocolWalletList.reduce((acc, wallet) => {
    wallet.balances.forEach((balance) => {
      const existingBalance = acc.find((b) => b.address === balance.address)

      if (existingBalance) {
        existingBalance.amount += balance.amount
        existingBalance.debt += balance.debt
      } else {
        acc.push(balance)
      }
    })

    return acc
  }, [] as GetRMMProtocolBalance[])
}

export const WalletsRepository = {
  async getBalances(addressList: string[]): Promise<GetWalletBalance> {
    const walletsResult = await getWalletsResult(addressList)

    const response: GetWalletBalance = {
      [WalletType.Gnosis]: [],
      [WalletType.Ethereum]: [],
      [WalletType.RMM]: [],
      [WalletType.RMMProtocol]: getRMMProtocol(walletsResult),
      computed: [],
    }

    const standardWalletList = walletsResult.filter(
      (item) => item.type !== WalletType.RMMProtocol
    ) as StandardWallet[]

    return standardWalletList.reduce((acc, wallet) => {
      wallet.balances.forEach((balance) => {
        const existingBalance = acc[wallet.type].find(
          (b) => b.address === balance.address
        )

        if (existingBalance) {
          existingBalance.amount += balance.amount
        } else {
          acc[wallet.type].push({ ...balance })
        }

        const computedBalance = acc.computed.find(
          (b) => b.address === balance.address
        )

        if (computedBalance) {
          computedBalance.amount += balance.amount
        } else {
          acc.computed.push({ ...balance })
        }
      })

      return acc
    }, response)
  },
}
