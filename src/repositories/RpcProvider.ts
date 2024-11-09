import { ethers } from 'ethers'

import { WaitingQueue } from 'src/utils/waitingQueue'

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

async function getWorkingRpc(urls: string[]): Promise<ethers.JsonRpcProvider> {
  for (const url of urls) {
    const provider = new ethers.JsonRpcProvider(url)
    try {
      await provider.getBlockNumber()
      return provider
    } catch (error) {
      console.error(`Failed to connect to ${url}, trying next one...`)
    }
  }

  throw new Error('All RPC URLs failed')
}

interface Providers {
  GnosisRpcProvider: ethers.JsonRpcProvider
  EthereumRpcProvider: ethers.JsonRpcProvider
}

let initializeProvidersQueue: WaitingQueue<Providers> | null = null
let providers: Providers | undefined = undefined

export const initializeProviders = async () => {
  if (initializeProvidersQueue) {
    return initializeProvidersQueue.wait()
  }
  initializeProvidersQueue = new WaitingQueue()

  const [GnosisRpcProvider, EthereumRpcProvider] = await Promise.all([
    getWorkingRpc(GNOSIS_RPC_URLS),
    getWorkingRpc(ETHEREUM_RPC_URLS),
  ])

  providers = { GnosisRpcProvider, EthereumRpcProvider }
  initializeProvidersQueue.resolve(providers)
  return providers
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
