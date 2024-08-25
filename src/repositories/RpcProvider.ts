import { ethers } from 'ethers'

declare module 'ethers' {
  interface Interface {
    parseLog(log: {
      topics: ReadonlyArray<string>
      data: string
    }): null | ethers.LogDescription
  }
}

const GNOSIS_RPC_URLS = [
  'https://gnosis-rpc.publicnode.com',
  'https://rpc.ankr.com/gnosis',
  'https://gnosis.drpc.org',
]
const ETHEREUM_RPC_URLS = [
  'https://rpc.ankr.com/eth',
  'https://eth.llamarpc.com',
  'https://eth-pokt.nodies.app',
]

async function getWorkingRpcUrl(urls: string[]): Promise<string> {
  for (const url of urls) {
    const provider = new ethers.JsonRpcProvider(url)
    try {
      await provider.getBlockNumber()
      return url
    } catch (error) {
      console.error(`Failed to connect to ${url}, trying next one...`)
    }
  }

  throw new Error('All RPC URLs failed')
}

export const initializeProviders = async () => {
  const gnosisRpcUrl = await getWorkingRpcUrl(GNOSIS_RPC_URLS)
  const ethereumRpcUrl = await getWorkingRpcUrl(ETHEREUM_RPC_URLS)

  const GnosisRpcProvider = new ethers.JsonRpcProvider(gnosisRpcUrl)
  const EthereumRpcProvider = new ethers.JsonRpcProvider(ethereumRpcUrl)

  return { GnosisRpcProvider, EthereumRpcProvider }
}

/**
 * Get transaction receipt
 * Retry 3 times if the receipt is null, with a 100ms delay between each attempt
 * @param transactionId Transaction hash
 * @returns Transaction receipt
 */
export async function getTransactionReceipt(
  transactionId: string,
  chainId: number,
): Promise<ethers.TransactionReceipt | null> {
  let attempt = 0
  let receipt: ethers.TransactionReceipt | null = null

  const { GnosisRpcProvider, EthereumRpcProvider } = await initializeProviders()

  const RpcProvider = chainId === 1 ? EthereumRpcProvider : GnosisRpcProvider

  do {
    receipt = await RpcProvider.getTransactionReceipt(transactionId)
    if (receipt === null) {
      attempt++
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  } while (receipt === null && attempt < 3)

  return receipt
}
