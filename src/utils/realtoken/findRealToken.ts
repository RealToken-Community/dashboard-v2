import { RealToken } from 'src/types/RealToken'

export function findRealToken(contract: string, realtokenList: RealToken[]) {
  return realtokenList.find(
    (item) =>
      item.blockchainAddresses.xDai.contract &&
      item.blockchainAddresses.xDai.contract.toLowerCase() ===
        contract.toLowerCase(),
  )
}
