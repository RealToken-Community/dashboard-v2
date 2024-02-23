import { ethers } from 'ethers'

import { useCacheWithLocalStorage } from 'src/utils/useCache'

import { GnosisRpcProvider } from './RpcProvider'

export interface CurrencyRates {
  XdaiUsd: number
  EurUsd: number
  ChfUsd: number
}

function getChainlinkHandler(options: {
  priceFeedContract: string
  decimals: number
}) {
  const { priceFeedContract, decimals } = options
  const ABI = ['function latestAnswer() view returns (int256)']
  const contract = new ethers.Contract(
    priceFeedContract,
    ABI,
    GnosisRpcProvider,
  )

  return useCacheWithLocalStorage(
    async () =>
      Number(ethers.formatUnits(await contract.latestAnswer(), decimals)),
    {
      duration: 1000 * 60 * 60 * 24, // 24 hours
      key: `getChainlinkHandler-${priceFeedContract}`,
      usePreviousValueOnError: true,
    },
  )
}

const getXdaiUsd = getChainlinkHandler({
  priceFeedContract: '0x678df3415fc31947dA4324eC63212874be5a82f8',
  decimals: 8,
})

const getEurUsd = getChainlinkHandler({
  priceFeedContract: '0xab70BCB260073d036d1660201e9d5405F5829b7a',
  decimals: 8,
})

const getChfUsd = getChainlinkHandler({
  priceFeedContract: '0xFb00261Af80ADb1629D3869E377ae1EEC7bE659F',
  decimals: 8,
})

export const CurrenciesRepository = {
  async getRates(): Promise<CurrencyRates> {
    const [XdaiUsd, EurUsd, ChfUsd] = await Promise.all([
      getXdaiUsd(),
      getEurUsd(),
      getChfUsd(),
    ])
    return { XdaiUsd, EurUsd, ChfUsd }
  },
}
