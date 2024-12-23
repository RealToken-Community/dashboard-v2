import { Contract, JsonRpcProvider } from 'ethers'

import { getErc20AbiBalanceOfOnly } from 'src/utils/blockchain/ERC20'

import {
  CHAIN_ID_ETHEREUM,
  CHAIN_ID_GNOSIS_XDAI,
  CHAIN_NAME_ETHEREUM,
  CHAIN_NAME_GNOSIS_XDAI,
} from './consts/otherTokens'
import { batchCallOneContractOneFunctionMultipleParams } from './contract'

const getChainName = (chainId: number) => {
  switch (chainId) {
    case CHAIN_ID_ETHEREUM:
      return CHAIN_NAME_ETHEREUM
    case CHAIN_ID_GNOSIS_XDAI:
      return CHAIN_NAME_GNOSIS_XDAI
  }
}

const getAddressesBalances = async (
  contractAddress: string,
  addressList: string[],
  providers: JsonRpcProvider[],
  consoleWarnOnError = false,
) => {
  let totalAmount = 0
  const balancesByProvider: Record<string, number> = {}
  try {
    if (!contractAddress) {
      consoleWarnOnError && console.error('Invalid contract address')
      return totalAmount
    }
    if (!addressList?.length) {
      consoleWarnOnError && console.error('Invalid address list')
      return totalAmount
    }
    if (!providers?.length) {
      consoleWarnOnError && console.error('Invalid providers')
      return totalAmount
    }
    const erc20AbiBalanceOfOnly = getErc20AbiBalanceOfOnly()
    if (!erc20AbiBalanceOfOnly) {
      throw new Error('balanceOf ABI not found')
    }
    const balancesPromises = providers.map((provider: JsonRpcProvider) => {
      const Erc20BalanceContract = new Contract(
        contractAddress,
        erc20AbiBalanceOfOnly,
        provider,
      )
      const balances = batchCallOneContractOneFunctionMultipleParams(
        Erc20BalanceContract,
        'balanceOf',
        addressList.map((address: string) => [address as unknown as object]),
      )
      return balances
    })

    const balancesArray = await Promise.all(balancesPromises.flat())
    const balances = balancesArray.flat()
    // Providers
    providers.forEach((provider: JsonRpcProvider) => {
      console.log('provider', provider?._network?.chainId)
      const chainId = Number(provider?._network?.chainId)

      balancesByProvider[(getChainName(chainId), 0)] = 0
    })
    console.log('addressList?.length', addressList?.length)
    console.log('balancesArray?.length', balancesArray?.length)
    console.log('(flat) balances?.length', balances?.length)

    // Sum all valid balances
    balances.forEach((balance: object | null | undefined) => {
      try {
        if (balance) {
          totalAmount += Number(balance)
        }
      } catch (error) {}
    })
    return totalAmount
  } catch (error) {
    console.warn('Failed to get balances', error)
  }
  return totalAmount
}

export { getAddressesBalances }
