// Each asset must have a different ID (used as KEY assets view)
const RWA_asset_ID = 0
const REG_asset_ID = 1
const REGVotingPower_asset_ID = 2

// Gnosis/xDai, Ethereum
const RWA_ContractAddress = '0x0675e8F4A52eA6c845CB6427Af03616a2af42170'
// Gnosis/xDai, Ethereum
const REG_ContractAddress = '0x0AA1e96D2a46Ec6beB2923dE1E61Addf5F5f1dce'
// Reg Vault only deployed on Gnosis/xDai
const REG_Vault_Gnosis_ContractAddress =
  '0xe1877d33471e37fe0f62d20e60c469eff83fb4a0'
// Reg Voting Power only deployed on Gnosis/xDai
const RegVotingPower_Gnosis_ContractAddress =
  '0x6382856a731Af535CA6aea8D364FCE67457da438'

// Gnosis/xDai tokens for prices calculation
const WXDAI_ContractAddress = '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d'
const USDConXdai_ContractAddress = '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83'

const DEFAULT_RWA_PRICE = 50 // USD
const DEFAULT_REG_PRICE = 0 // USD
const DEFAULT_REGVotingPower_PRICE = 0 // USD

const DEFAULT_XDAI_USD_RATE = 1
const DEFAULT_USDC_USD_RATE = 1

const RWAtokenDecimals = 9
const REGtokenDecimals = 18
const REGVotingPowertokenDecimals = 18
const USDCtokenDecimals = 6
const WXDAItokenDecimals = 18

const HoneySwapFactory_Address = '0xA818b4F111Ccac7AA31D0BCc0806d64F2E0737D7'

export {
  RWA_ContractAddress,
  REG_ContractAddress,
  REG_Vault_Gnosis_ContractAddress,
  RegVotingPower_Gnosis_ContractAddress,
  WXDAI_ContractAddress,
  USDConXdai_ContractAddress,
  WXDAItokenDecimals,
  RWAtokenDecimals,
  USDCtokenDecimals,
  REGtokenDecimals,
  HoneySwapFactory_Address,
  REGVotingPowertokenDecimals,
  DEFAULT_RWA_PRICE,
  DEFAULT_REG_PRICE,
  DEFAULT_REGVotingPower_PRICE,
  DEFAULT_XDAI_USD_RATE,
  DEFAULT_USDC_USD_RATE,
  RWA_asset_ID,
  REG_asset_ID,
  REGVotingPower_asset_ID,
}
