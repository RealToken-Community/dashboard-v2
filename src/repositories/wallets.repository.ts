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

const LevinSwapClient = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/levinswap/uniswap-v2',
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

const LevinSwapQuery = gql`
  query LevinSwapQuery($addressList: [String]!) {
    users(where: { id_in: $addressList }) {
      id
      liquidityPositions(first: 400) {
        liquidityTokenBalance
        pair {
          totalSupply
          token0 {
            id
            name
          }
          token1 {
            id
            name
          }
          reserve0
          reserve1
        }
      }
    }
  }
`

interface LevinSwapResult {
  users: {
    id: string
    liquidityPositions: {
      liquidityTokenBalance: string
      pair: {
        totalSupply: string
        token0: { id: string; name: string }
        token1: { id: string; name: string }
        reserve0: string
        reserve1: string
      }
    }[]
  }[]
}

enum WalletType {
  Gnosis = 'gnosis',
  Ethereum = 'ethereum',
  RMM = 'rmm',
  RMMProtocol = 'rmmProtocol',
  LevinSwap = 'levinSwap',
}

interface StandardWallet {
  type:
    | WalletType.Gnosis
    | WalletType.Ethereum
    | WalletType.RMM
    | WalletType.LevinSwap
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
  const [gnosisResult, ethereumResult, rmmResult, levinSwapResult] =
    await Promise.all([
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
      LevinSwapClient.query<LevinSwapResult>({
        query: LevinSwapQuery,
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

  const levinSwapWallets: StandardWallet[] = levinSwapResult.data.users.map(
    (user) => {
      const balances: Record<string, number> = {}
      user.liquidityPositions.forEach((position) => {
        const share =
          parseFloat(position.liquidityTokenBalance) /
          parseFloat(position.pair.totalSupply)
        const token0 = position.pair.token0.id
        const token1 = position.pair.token1.id
        balances[token0] =
          (balances[token0] ?? 0) + parseFloat(position.pair.reserve0) * share
        balances[token1] =
          (balances[token1] ?? 0) + parseFloat(position.pair.reserve1) * share
      })

      return {
        type: WalletType.LevinSwap,
        address: user.id,
        balances: Object.entries(balances).map(([address, amount]) => ({
          address,
          amount,
        })),
      }
    }
  )

  return [
    ...gnosisWallets,
    ...ethereumWallets,
    ...rmmWallets,
    ...rmmProtocol,
    ...levinSwapWallets,
  ]
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
  levinSwap: WalletBalance[]
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
      [WalletType.LevinSwap]: [],
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
      })

      return acc
    }, response)
  },
}
