import {
  RealTokenCanal,
  RealTokenCurrency,
  RealTokenPropertyType,
  RealTokenRentCalculationType,
  RealTokenRentalType,
  RealTokenSellPropertyTo,
} from './RealToken'

export enum APIRealTokenProductType {
  RealEstateRental = 'real_estate_rental',
  EquityToken = 'equity_token',
  LoanIncome = 'loan_income',
}

interface APIRealTokenDate {
  date: string
  timezone_type: number
  timezone: string
}

export interface APIRealToken {
  uuid: string
  seriesNumber: number
  tokenIdRules: number

  // General
  productType: APIRealTokenProductType
  fullName: string
  shortName: string
  symbol: string
  marketplaceLink: string
  canal: RealTokenCanal
  sellPropertyTo: RealTokenSellPropertyTo
  totalTokens: number
  totalTokensRegSummed: number
  tokenPrice: number
  currency: RealTokenCurrency

  // Dates
  rentStartDate: APIRealTokenDate
  lastUpdate: APIRealTokenDate
  initialLaunchDate: APIRealTokenDate

  // Contracts
  originSecondaryMarketplaces: {
    chainId: number
    chainName: string
    dexName: string
    contractPool: string
  }[]
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
  ethereumContract: string | null
  xDaiContract: string | null
  gnosisContract: string | null
  goerliContract: string | null

  // Property details
  propertyType: RealTokenPropertyType
  coordinate: { lat: string; lng: string }
  imageLink: string[]
  squareFeet: number | null
  lotSize: number | null
  bedroomBath: string | null
  termOfLease: null
  renewalDate: null
  constructionYear: number
  constructionType: string | null
  roofType: string | null
  assetParking: string | null
  foundation: string | null
  heating: string | null
  cooling: string | null
  propertyStories: number | null
  totalUnits: number

  // Rent related
  rentedUnits: number
  rentalType: RealTokenRentalType
  rentCalculationType: RealTokenRentCalculationType
  netRentDay: number
  netRentMonth: number
  netRentYear: number
  netRentDayPerToken: number
  netRentMonthPerToken: number
  netRentYearPerToken: number
  annualPercentageYield: number
  hasTenants: boolean
  section8paid: number
  grossRentYear: number
  grossRentMonth: number
  subsidyBy: string | null
  subsidyStatus: string
  subsidyStatusValue: number

  // Monthly expenses
  insurance: number
  propertyTaxes: number
  propertyManagement: number
  propertyManagementPercent: number
  realtPlatform: number
  realtPlatformPercent: number
  utilities: number
  propertyMaintenanceMonthly: number

  // Initial investment
  underlyingAssetPrice: number
  renovationReserve: number | null
  realtListingFeePercent: number | null
  realtListingFee: number | null
  miscellaneousCosts: number | null
  initialMaintenanceReserve: number | null
  totalInvestment: number
}
