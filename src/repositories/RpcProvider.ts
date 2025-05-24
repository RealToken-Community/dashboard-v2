import { CHAINS as RealtCommonsDefaultChainsConfig } from '@realtoken/realt-commons'

import {
  Contract,
  JsonRpcProvider,
  LogDescription,
  TransactionReceipt,
  ZeroAddress,
} from 'ethers'

import { ERC20ABI } from 'src/utils/blockchain/abi/ERC20ABI'
import {
  CHAINS_NAMES,
  CHAIN_ID_ETHEREUM,
  CHAIN_ID_GNOSIS_XDAI,
  REG_ContractAddress,
} from 'src/utils/blockchain/consts/otherTokens'
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

/**
 * Get RPC URLs for a given chain ID from .env variables
 * @param chainId Chain ID
 * @returns Array of RPC URLs
 * @throws Error if the chain ID is not supported
 */
const getRpcUrls = (chainId: number): string[] => {
  // Get the environment variable name and default urls plus default RPC URL from realt-commons config based on the chain ID
  let envVarName = ''
  let defaultUrls: string[] = []

  switch (chainId) {
    case CHAIN_ID_ETHEREUM:
      envVarName = 'RPC_URLS_ETH_MAINNET'
      // Use the default Ethereum RPC URLs from realt-commons config
      defaultUrls = DEFAULT_ETHEREUM_RPC_URLS.concat(
        RealtCommonsDefaultChainsConfig[CHAIN_ID_ETHEREUM].rpcUrl,
      )
      break
    case CHAIN_ID_GNOSIS_XDAI:
      envVarName = 'RPC_URLS_GNOSIS_MAINNET'
      defaultUrls = DEFAULT_GNOSIS_RPC_URLS.concat(
        RealtCommonsDefaultChainsConfig[CHAIN_ID_GNOSIS_XDAI].rpcUrl,
      )
      break
    // TODO: Polygon
    default:
      throw new Error(`Unsupported chain ID: ${chainId}`)
  }
  // Get the environment variable value, split by comma, add default URLs, remove duplicates and empty values
  return Array.from(
    new Set((process.env[envVarName] ?? '').split(',').concat(defaultUrls)),
  ).filter((url) => url.trim() !== '')
}

const DEFAULT_GNOSIS_RPC_URLS = [
  'https://rpc.gnosischain.com',
  'https://rpc.gnosis.gateway.fm',
  'https://rpc.ap-southeast-1.gateway.fm/v4/gnosis/non-archival/mainnet',
  'https://gnosis-rpc.publicnode.com',
  'https://gnosis.oat.farm',
  'https://0xrpc.io/gno',
]

const DEFAULT_ETHEREUM_RPC_URLS = [
  'https://rpc.eth.gateway.fm',
  'https://ethereum-rpc.publicnode.com',
  'https://eth-mainnet.public.blastapi.io',
  'https://ethereum.blockpi.network/v1/rpc/public',
  'https://rpc.mevblocker.io/fast',
  'https://rpc.mevblocker.io',
  'https://0xrpc.io/eth',
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

    // Create a dummy array of addresses filled with 'ZeroAddress' for fetching balances
    const batchAddressesArray = Array(requestsBatchSize).fill([ZeroAddress])
    const contract = new Contract(REG_ContractAddress, ERC20ABI, provider)
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

/**
 *
 * @param chainId Chain ID
 * @description Get a working RPC provider for a given chain ID, returns both the provider and the URL
 * * This function tries to connect to each RPC URL for the given chain ID
 * * If the connection is successful, it tests the provider for the maximum number of concurrent requests it can handle
 * * If the provider is able to handle the required number of concurrent requests, it returns the provider and the URL
 * * If the provider is not able to handle the required number of concurrent requests, it skips it and tries the next one
 * * If all RPC URLs fail to connect or test the provider, it throws an error
 * @throws Error if all RPC URLs fail to connect or test the provider
 * @throws Error if the chain ID is not supported
 * @param chainId Chain ID
 * @param checkRpcThresholds
 * @returns
 */
async function getWorkingRpc(
  chainId: number,
  checkRpcThresholds = true,
): Promise<{ provider: JsonRpcProvider; url: string }> {
  let rpcConnectOk = false
  let rpcThresholdValue = 0
  let failedRpcErrorCount = 0
  const urls = getRpcUrls(chainId)

  for (const url of urls) {
    try {
      rpcConnectOk = false
      rpcThresholdValue = 0
      const provider = new JsonRpcProvider(url)
      const network = provider.getNetwork()
      const currentBlockNumber = provider.getBlockNumber()
      await Promise.all([network, currentBlockNumber])
      rpcConnectOk = true
      rpcThresholdValue = !checkRpcThresholds
        ? 1
        : // Test for the maximum number of concurrent requests the provider can handle
          await testRpcThresholds(provider, REG_ContractAddress, 5, 5, 5, 150)
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
      return { provider, url }
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
  console.error(
    `All RPC URLs (${urls?.length}) failed to connect or test rpcThresholdValue`,
    urls,
  )
  throw new Error(
    `All RPC URLs (${urls?.length}) failed for ${CHAINS_NAMES[chainId]} (chainId ${chainId})`,
  )
}

interface Providers {
  GnosisRpcProvider: JsonRpcProvider
  EthereumRpcProvider: JsonRpcProvider
  // PolygonRpcProvider?: JsonRpcProvider // TODO: add Polygon provider
}

interface ProvidersWithUrls extends Providers {
  GnosisRpcUrl: string
  EthereumRpcUrl: string
  // PolygonRpcUrl?: string // TODO: add Polygon provider
}

let initializeProvidersQueue: WaitingQueue<ProvidersWithUrls> | null = null
let providers: ProvidersWithUrls | undefined = undefined

export const initializeProviders = async () => {
  if (initializeProvidersQueue) {
    return initializeProvidersQueue.wait()
  }
  initializeProvidersQueue = new WaitingQueue()

  const [GnosisRpcProviderWithUrl, EthereumRpcProviderWithUrl] =
    await Promise.all([
      getWorkingRpc(CHAIN_ID_GNOSIS_XDAI),
      getWorkingRpc(CHAIN_ID_ETHEREUM),
    ])
  providers = {
    GnosisRpcProvider: GnosisRpcProviderWithUrl.provider,
    EthereumRpcProvider: EthereumRpcProviderWithUrl.provider,
    GnosisRpcUrl: GnosisRpcProviderWithUrl.url,
    EthereumRpcUrl: EthereumRpcProviderWithUrl.url,
    // PolygonRpcProvider: undefined, // TODO: add Polygon provider
    // PolygonRpcUrl: undefined, // TODO: add Polygon provider
  }
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

/**
 * Get chain ID
 * @param provider (Ethers) RPC provider
 * @returns Chain ID as number | undefined
 */
export const getChainId = (
  provider: JsonRpcProvider | undefined,
): number | undefined => {
  return provider?._network?.chainId
    ? Number(provider?._network?.chainId)
    : undefined
}
