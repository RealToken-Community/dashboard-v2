import { Contract, JsonRpcProvider } from 'ethers'

import { getErc20AbiBalanceOfOnly } from 'src/utils/blockchain/ERC20'

const getAddressesBalances = async (
  contractAddress: string,
  addressList: string[],
  providers: JsonRpcProvider[],
  consoleWarnOnError = false,
  showDebug = false,
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
      return addressList.map(async (address: string) => {
        return Erc20BalanceContract.balanceOf(address)
      })
    })
    const balances = await Promise.all(balancesPromises.flat())
    showDebug && console.debug('balances', balances)
    // Sum all the balances
    totalAmount = balances.reduce((acc, curr) => acc + Number(curr), 0)
  } catch (error) {
    console.warn('Failed to get balances', error)
  }
  return totalAmount
}

export { getAddressesBalances }
