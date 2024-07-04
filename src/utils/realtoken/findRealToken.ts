import { RealToken } from 'src/types/RealToken'

export function findRealToken(
  contract: string,
  realtokenList: RealToken[],
  chainId = 100,
) {
  const blockchain = { 1: 'ethereum', 100: 'xDai' }[chainId] as
    | 'ethereum'
    | 'xDai'
  return realtokenList.find((item) => {
    const itemContract = item.blockchainAddresses[blockchain]?.contract
    return itemContract && itemContract.toLowerCase() === contract.toLowerCase()
  })
}
