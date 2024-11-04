import { Contract, JsonRpcProvider } from 'ethers'

import { getErc20AbiBalanceOfOnly } from 'src/utils/blockchain/ERC20'

import { batchCallOneContractOneFunctionMultipleParams } from './contract'

const getAddressesBalances = async (
  contractAddress: string,
  addressList: string[],
  providers: JsonRpcProvider[],
  consoleWarnOnError = false,
) => {
  let totalAmount = 0
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
