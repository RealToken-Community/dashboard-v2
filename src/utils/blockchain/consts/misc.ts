const CHAIN_ID_GNOSIS_XDAI = 100
const CHAIN_ID_ETHEREUM = 1
// const CHAIN_ID_POLYGON = 137

const CHAIN_NAME__GNOSIS_XDAI = 'gnosis'
const CHAIN_NAME__ETHEREUM = 'ethereum'
// const CHAIN_NAME__POLYGON = 'polygon'

// Array of supported chain IDs
const SUPPORTED_CHAINS_IDS = [CHAIN_ID_GNOSIS_XDAI, CHAIN_ID_ETHEREUM]

// Mapping chain IDs to their respective names
const CHAINS_NAMES: { [key: number]: string } = {
  [CHAIN_ID_GNOSIS_XDAI]: CHAIN_NAME__GNOSIS_XDAI,
  [CHAIN_ID_ETHEREUM]: CHAIN_NAME__ETHEREUM,
}

type ChainId = number
type Address = string
type Decimals = number

const CHAIN_ID__GNOSIS_XDAI: ChainId = 100
const CHAIN_ID__ETHEREUM: ChainId = 1
// const CHAIN_ID__POLYGON: ChainId = 137

// export declare enum ChainIds {
//   GNOSIS_XDAI,
//   ETHEREUM,
//   // POLYGON, // Todo
// }

// Reg Vault only deployed on Gnosis/xDai
const REG_Vault_Gnosis_ContractAddress =
  '0xe1877d33471e37fe0f62d20e60c469eff83fb4a0'
// Reg Voting Power only deployed on Gnosis/xDai

const HoneySwapFactory_Address = '0xA818b4F111Ccac7AA31D0BCc0806d64F2E0737D7'

// SushiSwap Quoter deployed on Gnosis/xDai
const SushiSwap_Factory__GnosisXdai_Address =
  '0xf78031CBCA409F2FB6876BDFDBc1b2df24cF9bEf'
const SushiSwap_Router__GnosisXdai_Address =
  '0x4F54dd2F4f30347d841b7783aD08c050d8410a9d'
const SushiSwap_Quoter__GnosisXdai_Address =
  '0xb1E835Dc2785b52265711e17fCCb0fd018226a6e'

// interface UniV2DeployedAddresses {
//   factory: Address
//   router: Address
// }

// interface UniV3DeployedAddresses extends UniV2DeployedAddresses {
//   quoter: Address
// }

// const SUSHISWAP_DEPLOYMENTS: { [key: ChainId]: UniV3DeployedAddresses } = {
//   [CHAIN_ID__GNOSIS_XDAI]: {
//     factory: SushiSwap_Factory__GnosisXdai_Address,
//     router: SushiSwap_Router__GnosisXdai_Address,
//     quoter: SushiSwap_Quoter__GnosisXdai_Address,
//   },
// }

interface UniV2DeployedAddresses {
  factory: Address
  router: Address
}

interface UniV3DeployedAddresses extends UniV2DeployedAddresses {
  quoter: Address
}

// Define type for deployments
// export
type UniV3Deployment = { [key: ChainId]: UniV3DeployedAddresses }

const SUSHISWAP_DEPLOYMENTS: UniV3Deployment = {
  [CHAIN_ID__GNOSIS_XDAI]: {
    factory: SushiSwap_Factory__GnosisXdai_Address,
    router: SushiSwap_Router__GnosisXdai_Address,
    quoter: SushiSwap_Quoter__GnosisXdai_Address,
  },
}

// console.dir(SUSHISWAP_DEPLOYMENTS)
// console.dir(ChainIds)

// Export type for SUSHISWAP_DEPLOYMENTS
// export type SushiswapDeployments = typeof SUSHISWAP_DEPLOYMENTS

export {
  CHAIN_ID__GNOSIS_XDAI,
  CHAIN_ID__ETHEREUM,
  // CHAIN_ID__POLYGON,
  SUPPORTED_CHAINS_IDS,
  CHAINS_NAMES,
  REG_Vault_Gnosis_ContractAddress,
  HoneySwapFactory_Address,
  SUSHISWAP_DEPLOYMENTS,
}
// export declare const SUPPORTED_CHAINS: readonly [
//   // ChainId.GNOSIS_XDAI,
//   // ChainIds.ETHEREUM,
//   CHAIN_ID__GNOSIS_XDAI,
//   CHAIN_ID__ETHEREUM,
// ]

export type {
  Address,
  ChainId,
  Decimals,
  UniV2DeployedAddresses,
  UniV3DeployedAddresses,
  UniV3Deployment,
}
