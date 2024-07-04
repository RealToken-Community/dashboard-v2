import { ethers } from 'ethers'

declare module 'ethers' {
  interface Interface {
    parseLog(log: {
      topics: ReadonlyArray<string>
      data: string
    }): null | ethers.LogDescription
  }
}

const GNOSIS_RPC_URL = 'https://rpc.ankr.com/gnosis'
const ETHEREUM_RPC_URL = 'https://rpc.ankr.com/eth'
export const GnosisRpcProvider = new ethers.JsonRpcProvider(GNOSIS_RPC_URL)
export const EthereumRpcProvider = new ethers.JsonRpcProvider(ETHEREUM_RPC_URL)

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
