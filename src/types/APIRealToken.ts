export enum APIRealTokenCanal {
  Release = 'release',
  ExitComplete = 'exit_complete',
}

export enum APIRealTokenCurrency {
  USD = 'USD',
}

export enum APIRealTokenPropertyType {
  SingleFamily = 1,
  MultiFamily = 2,
  Commercial = 3,
}

export enum APIRealTokenSellPropertyTo {
  UsInvestorsOnly = 'us_investors_only',
  IntlInvestorsOnly = 'intl_investors_only',
}

export enum APIRealTokenRentCalculationType {
  Constant = 'constant',
  Average = 'average',
}

export enum APIRealTokenRentalType {
  LongTerm = 'long_term',
  ShortTerm = 'short_term',
}

interface APIRealTokenDate {
  date: string
  timezone_type: number
  timezone: string
}

export interface APIRealToken {
  fullName: string
  shortName: string
  symbol: string
  tokenPrice: number
  canal: APIRealTokenCanal
  currency: APIRealTokenCurrency
  totalTokens: number
  totalTokensRegSummed: number
  uuid: string
  ethereumContract: string | null
  xDaiContract: string | null
  gnosisContract: string | null
  goerliContract: string | null
  totalInvestment: number
  grossRentYear: number
  grossRentMonth: number
  propertyManagement: number
  propertyManagementPercent: number
  realtPlatform: number
  realtPlatformPercent: number
  insurance: number
  propertyTaxes: number
  utilities: number
  initialMaintenanceReserve: number | null
  netRentDay: number
  netRentMonth: number
  netRentYear: number
  netRentDayPerToken: number
  netRentMonthPerToken: number
  netRentYearPerToken: number
  annualPercentageYield: number
  coordinate: {
    lat: string
    lng: string
  }
  marketplaceLink: string
  imageLink: string[]
  propertyType: APIRealTokenPropertyType
  squareFeet: number | null
  lotSize: number | null
  bedroomBath: string | null
  hasTenants: boolean
  rentedUnits: number
  totalUnits: number
  termOfLease: null
  renewalDate: null
  section8paid: number
  sellPropertyTo: APIRealTokenSellPropertyTo
  secondaryMarketplace: {
    UniswapV1: true | 0
    UniswapV2: string | 0
  }
  secondaryMarketplaces: {
    chainId: number
    chainName: string
    dexName: string
    contractPool: string | 0
    pair: {
      contract: string
      symbol: string
      name: string
    }
  }[]
  blockchainAddresses: {
    ethereum: {
      chainName: string
      chainId: number
      contract: string | 0
      distributor: string | 0
      maintenance: string | 0
    }
    xDai: {
      chainName: string
      chainId: number
      contract: string
      distributor: string | 0
      rmmPoolAddress: string | 0
      chainlinkPriceContract: string | 0
    }
    goerli: {
      chainName: string
      chainId: number
      contract: string | 0
      distributor: string | 0
      rmmPoolAddress: string | 0
      chainlinkPriceContract: string | 0
    }
  }
  underlyingAssetPrice: number
  renovationReserve: number | null
  propertyMaintenanceMonthly: number
  rentStartDate: APIRealTokenDate
  lastUpdate: APIRealTokenDate
  originSecondaryMarketplaces: {
    chainId: number
    chainName: string
    dexName: string
    contractPool: string
  }[]
  initialLaunchDate: APIRealTokenDate
  seriesNumber: number
  constructionYear: number
  constructionType: string | null
  roofType: string | null
  assetParking: string | null
  foundation: string | null
  heating: string | null
  cooling: string | null
  tokenIdRules: number
  rentCalculationType: APIRealTokenRentCalculationType
  realtListingFeePercent: number | null
  realtListingFee: number | null
  miscellaneousCosts: number | null
  propertyStories: number | null
  rentalType: APIRealTokenRentalType
}
