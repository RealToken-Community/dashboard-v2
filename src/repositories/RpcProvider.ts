import {
  Contract,
  JsonRpcProvider,
  LogDescription,
  TransactionReceipt,
  ZeroAddress,
} from 'ethers'

import { getErc20AbiBalanceOfOnly } from 'src/utils/blockchain/ERC20'
import { REG_ContractAddress } from 'src/utils/blockchain/consts/otherTokens'
import { batchCallOneContractOneFunctionMultipleParams } from 'src/utils/blockchain/contract'
import { wait } from 'src/utils/general'
import { WaitingQueue } from 'src/utils/waitingQueue'

declare module 'ethers' {
  interface Interface {
    parseLog(log: {
      topics: ReadonlyArray<string>
      data: string
    }): null | LogDescription
  }
}

const GNOSIS_RPC_URLS = [
  'https://gnosis-rpc.publicnode.com',
  'https://rpc.ankr.com/gnosis',
  'https://gnosis.drpc.org',
  'https://rpc.gnosischain.com',
  'https://rpc.gnosis.gateway.fm',
]

const ETHEREUM_RPC_URLS = [
  'https://eth.llamarpc.com',
  'https://rpc.mevblocker.io',
  'https://eth.merkle.ioz',
  'https://rpc.ankr.com/eth',
  'https://eth-pokt.nodies.app',
]

/**
 * Test the RPC provider for finding the maximum number of concurrent requests it can handle
 * using a dummy array of addresses for checking their balances
 * @param provider RPC provider to test
 * @param erc20ContractAddress ERC20 contract address
 * @param concurrentRequestsMin Minimum number of concurrent requests
 * @param concurrentRequestsMax Maximum number of concurrent requests
 * @param requestsBatchSize Batch size
 * @param waitDelayBetweenAttemptMs Delay between each test
 *
 * @returns
 */
async function testRpcThresholds(
  provider: JsonRpcProvider,
  erc20ContractAddress: string,
  concurrentRequestsMin = 5,
  concurrentRequestsMax = 10,
  requestsBatchSize = 10,
  waitDelayBetweenAttemptMs = 500,
): Promise<number> {
  let threshold = 0
  try {
    if (!provider) {
      throw new Error('provider is not defined')
    }
    if (!erc20ContractAddress) {
      throw new Error('erc20ContractAddress is not defined')
    }
    if (concurrentRequestsMin < 1) {
      throw new Error('concurrentRequestsMin cannot be less than 1')
    }
    if (concurrentRequestsMax < 1) {
      throw new Error('concurrentRequestsMax cannot be less than 1')
    }
    if (requestsBatchSize < 1) {
      throw new Error('requestsBatchSize cannot be less than 1')
    }
    if (waitDelayBetweenAttemptMs < 1) {
      throw new Error('waitDelayBetweenAttemptMs cannot be less than 1')
    }
    if (concurrentRequestsMin > concurrentRequestsMax) {
      throw new Error('concurrentMin cannot be greater than concurrentMax')
    }
    const erc20AbiBalanceOfOnly = getErc20AbiBalanceOfOnly()
    if (!erc20AbiBalanceOfOnly) {
      throw new Error('balanceOf ABI not found')
    }

    // Create a dummy array of addresses filled with 'ZeroAddress' for fetching balances
    const batchAddressesArray = Array(requestsBatchSize).fill([ZeroAddress])
    const contract = new Contract(
      REG_ContractAddress,
      erc20AbiBalanceOfOnly,
      provider,
    )
    // Loop from max to min concurrent requests
    for (
      let currentThresold = concurrentRequestsMax;
      currentThresold >= concurrentRequestsMin;
      currentThresold--
    ) {
      const balancesPromises = []
      // Loop for each batch request : send currentThresold requests simultaneously
      for (
        let batchRequestsIdx = 0;
        batchRequestsIdx < currentThresold;
        batchRequestsIdx++
      ) {
        const resBalancesPromise =
          batchCallOneContractOneFunctionMultipleParams(
            contract,
            'balanceOf',
            batchAddressesArray,
            requestsBatchSize,
            requestsBatchSize,
            1, // only test once, no retry
            false, // silence warnings/errors
          )
        balancesPromises.push(resBalancesPromise)
      } // Batch loop
      const balances = await Promise.all(balancesPromises)
      // check if any balances array are null/undefined: if so, the provider returned an error
      const containsNull = balances.some((balance) => !balance)
      if (!containsNull) {
        threshold = currentThresold
        break
      }
      // Else, continue to next threshold
      await wait(waitDelayBetweenAttemptMs)
    } // Threshold loop
  } catch (error) {
    console.error(error)
  }
  return threshold
}

async function getWorkingRpc(urls: string[]): Promise<JsonRpcProvider> {
  let rpcConnectOk = false
  let rpcThresholdValue = 0
  let failedRpcErrorCount = 0
  for (const url of urls) {
    try {
      rpcConnectOk = false
      rpcThresholdValue = 0
      const provider = new JsonRpcProvider(url)
      const network = provider.getNetwork()
      const currentBlockNumber = provider.getBlockNumber()
      await Promise.all([network, currentBlockNumber])
      rpcConnectOk = true
      // Test for the maximum number of concurrent requests the provider can handle
      rpcThresholdValue = await testRpcThresholds(
        provider,
        REG_ContractAddress,
        5,
        5,
        5,
        150,
      )
      if (rpcThresholdValue < 1) {
        // Throw error if the threshold is 0
        // Means the provider is not able to handle required concurrent requests number
        // skip it and try next one
        throw new Error('rpcThresholdValue returned 0')
      }
      // If any error has occurred before, log the successful connection
      if (failedRpcErrorCount > 0) {
        console.info(
          `Successfully connected to ${url} after ${failedRpcErrorCount} failed attempts`,
        )
      }
      return provider
    } catch (error) {
      failedRpcErrorCount++
      if (!rpcConnectOk) {
        // Connection error
        console.error(`Failed to connect to ${url}, trying next one...`, error)
      } else if (rpcThresholdValue < 1) {
        // Threshold error
        console.error(
          `Successfull connection to ${url} BUT failed to test rpcThresholdValue, trying next one...`,
          error,
        )
      } else {
        // General error
        console.error(`Failed to connect to ${url}, trying next one...`, error)
      }
    }
  }
  throw new Error(`All RPC URLs (${urls?.length}) failed`)
}

interface Providers {
  GnosisRpcProvider: JsonRpcProvider
  EthereumRpcProvider: JsonRpcProvider
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
): Promise<TransactionReceipt | null> {
  let attempt = 0
  let receipt: TransactionReceipt | null = null

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
