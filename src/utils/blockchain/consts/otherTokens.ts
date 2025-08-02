// Each asset must have a different ID (used as KEY assets view)
const RWA_asset_ID = 0
const REG_asset_ID = 1
const REGVotingPower_asset_ID = 2

// Gnosis/xDai, Ethereum
const RWA_ContractAddress = '0x0675e8F4A52eA6c845CB6427Af03616a2af42170'
// Gnosis/xDai, Ethereum
const REG_ContractAddress = '0x0AA1e96D2a46Ec6beB2923dE1E61Addf5F5f1dce'
// Reg Voting Power only deployed on Gnosis/xDai
const RegVotingPower_Gnosis_ContractAddress =
  '0x6382856a731Af535CA6aea8D364FCE67457da438'
// Gnosis/xDai, Ethereum
const REUSD_ContractAddress = '0x3390742ac0dce14ea6fcbd5ae02e2303c5d62ad9'

const REUSD_asset_ID = REUSD_ContractAddress

// Gnosis/xDai tokens for prices calculation
const WXDAI_ContractAddress = '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d'
const USDConXdai_ContractAddress = '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83'

const DEFAULT_RWA_PRICE = 50 // USD
const DEFAULT_REG_PRICE = 0 // USD
const DEFAULT_REUSD_PRICE = 1 // USD
const DEFAULT_REGVotingPower_PRICE = 0 // USD

const DEFAULT_XDAI_USD_RATE = 1
const DEFAULT_USDC_USD_RATE = 1

const RWAtokenDecimals = 9
const REGtokenDecimals = 18
const REGVotingPowertokenDecimals = 18
const REGUSDtokenDecimals = 18
const USDCtokenDecimals = 6
const WXDAItokenDecimals = 18

export {
  RWA_ContractAddress,
  REG_ContractAddress,
  REUSD_ContractAddress,
  RegVotingPower_Gnosis_ContractAddress,
  WXDAI_ContractAddress,
  USDConXdai_ContractAddress,
  WXDAItokenDecimals,
  RWAtokenDecimals,
  USDCtokenDecimals,
  REGtokenDecimals,
  REGUSDtokenDecimals,
  REGVotingPowertokenDecimals,
  DEFAULT_RWA_PRICE,
  DEFAULT_REG_PRICE,
  DEFAULT_REUSD_PRICE,
  DEFAULT_REGVotingPower_PRICE,
  DEFAULT_XDAI_USD_RATE,
  DEFAULT_USDC_USD_RATE,
  RWA_asset_ID,
  REG_asset_ID,
  REUSD_asset_ID,
  REGVotingPower_asset_ID,
  // CHAIN_ID_GNOSIS_XDAI,
  // CHAIN_ID_ETHEREUM,
  // CHAIN_ID_POLYGON,
  // CHAIN_NAME_GNOSIS_XDAI,
  // CHAIN_NAME_ETHEREUM,
  // CHAIN_NAME_POLYGON,
  // CHAINS_NAMES,
}
