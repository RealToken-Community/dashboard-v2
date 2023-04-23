interface Token {
  id: string
  from: string
  uniswap: string
  name: string
  supply: number
  value: number
}

interface BlockchainAddress {
  chainName: string
  chainId: number
  contract: string
  distributor: string
  maintenance: string
  rmmPoolAddress?: string
  chainlinkPriceContract?: string
}

interface SecondaryMarketplace {
  chainId: number
  chainName: string
  dexName: string
  contractPool: string
  pair?: {
    contract: string
    symbol: string
    name: string
  }
}

interface Return {
  apr: string
  perYear: number
  perMonth: number
  perDay: number
}

interface Property {
  name: string
  shortName: string
  url: string
  location: {
    lat: string
    lng: string
    city: string
    state: string
    country: string
  }
  images: string[]
}

export interface RealToken {
  token: Token
  blockchainAddresses: {
    ethereum: BlockchainAddress
    xDai: BlockchainAddress
    goerli: BlockchainAddress
  }
  secondaryMarketplaces: SecondaryMarketplace[]
  return: Return
  property: Property
}

export const RealtokenRepository = {
  async getTokens() {
    // TODO: remove usage of mock data and use community API
    const response = await fetch('/mock/realt.min.json', { method: 'GET' })

    if (!response.ok) {
      throw new Error(response.statusText)
    }

    return response.json() as Promise<RealToken[]>
  },
}
