import { Contract, JsonRpcProvider } from 'ethers'

import { RegVaultABI } from './abi/RegVaultABI'
import { batchCallOneContractOneFunctionMultipleParams } from './contract'

export const getRegVaultAbiGetUserGlobalStateOnly = (): object[] | null => {
  const RegVaultAbiGetUserGlobalStateOnly = RegVaultABI.find(
    (abi) => abi.name === 'getUserGlobalState',
  )
  if (!RegVaultAbiGetUserGlobalStateOnly) {
    throw new Error('getUserGlobalState not found in RegVault ABI')
  }
  return [RegVaultAbiGetUserGlobalStateOnly]
}

const getAddressesLockedBalances = async (
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
    const regVaultAbiGetUserGlobalStateOnly =
      getRegVaultAbiGetUserGlobalStateOnly()
    if (!regVaultAbiGetUserGlobalStateOnly) {
      throw new Error('getUserGlobalState ABI not found')
    }
    const statesPromises = providers.map((provider: JsonRpcProvider) => {
      const RegVaultGetUserGlobalStateContract = new Contract(
        contractAddress,
        regVaultAbiGetUserGlobalStateOnly,
        provider,
      )
      const state = batchCallOneContractOneFunctionMultipleParams(
        RegVaultGetUserGlobalStateContract,
        'getUserGlobalState',
        addressList.map((address: string) => [address as unknown as object]),
      )
      return state
    })

    const statesArray = await Promise.all(statesPromises.flat())
    const states = statesArray.flat()
    // Sum all valid balances
    states.forEach((state: object | null | undefined) => {
      try {
        if (state) {
          totalAmount += Number((state as { 0: string; 1: string })['0'])
        }
      } catch (error) {}
    })
    return totalAmount
  } catch (error) {
    console.warn('Failed to get balances', error)
  }
  return totalAmount
}

export { getAddressesLockedBalances }
