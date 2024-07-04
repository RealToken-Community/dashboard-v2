import { APIRealToken } from './APIRealToken'
import { RealTokenHistoryItem } from './APIRealTokenHistory'

export enum RealTokenCanal {
  Release = 'release', // Active token
  ExitComplete = 'exit_complete', // Property sold
  TokensMigrated = 'tokens_migrated', // Token migrated to new contract (ex: OLD)
  OfferingClosed = 'offering_closed', // Offering closed (ex: REG D)
}

export enum RealTokenCurrency {
  USD = 'USD',
  EUR = 'EUR',
}

export enum RealTokenPropertyType {
  SingleFamily = 1,
  MultiFamily = 2,
  Duplex = 3,
  Condominium = 4,
  MixedUse = 6,
  Quadplex = 8,
  Commercial = 9,
  SFRPortfolio = 10,
}

export enum RealTokenSellPropertyTo {
  UsInvestorsOnly = 'us_investors_only',
  IntlInvestorsOnly = 'intl_investors_only',
}

export enum RealTokenRentCalculationType {
  Constant = 'constant',
  Average = 'average',
}

export enum RealTokenRentalType {
  LongTerm = 'long_term',
  ShortTerm = 'short_term',
}

export enum RealTokenRentStatus {
  full = 'full',
  partial = 'partial',
  none = 'none',
}

export interface RealToken extends APIRealToken {
  isRmmAvailable: boolean
  rentStatus: RealTokenRentStatus
  history: RealTokenHistoryItem[]
}
