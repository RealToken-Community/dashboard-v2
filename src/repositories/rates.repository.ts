import { ethers } from 'ethers'

export interface CurrencyRates {
  XdaiUsd: number
}

const RPC_URL = 'https://rpc.ankr.com/gnosis'
const RpcProvider = new ethers.providers.JsonRpcBatchProvider(RPC_URL)

function getChainlinkHandler(options: {
  priceFeedContract: string
  decimals: number
}) {
  const { priceFeedContract, decimals } = options
  const ABI = ['function latestAnswer() view returns (int256)']
  const contract = new ethers.Contract(priceFeedContract, ABI, RpcProvider)
  return async () =>
    Number(ethers.utils.formatUnits(await contract.latestAnswer(), decimals))
}

const getXdaiUsd = getChainlinkHandler({
  priceFeedContract: '0x678df3415fc31947dA4324eC63212874be5a82f8',
  decimals: 8,
})

export const RatesRepository = {
  async getRates(): Promise<CurrencyRates> {
    const [XdaiUsd] = await Promise.all([getXdaiUsd()])
    return { XdaiUsd }
  },
}
