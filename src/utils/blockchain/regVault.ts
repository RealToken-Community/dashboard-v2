import { Contract, Interface, JsonRpcProvider } from 'ethers'

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

/**
 *
 * @param contractsAddressesByProvider : array of [array of contract addresses matching the providers]
 * contractsAddressesByProvider must be consistet with providers array: for each provider, the corresponding array of contract addresses to query
 * @param addressList
 * @param providers : array of providers
 * @param consoleWarnOnError
 * @returns
 */
const getAddressesLockedBalances = async (
  contractsAddressesAbiFunctionnameByProvider: [
    string,
    Interface | object[] | null,
    string,
  ][][], // [contractAddress, abi, functionName]
  addressList: string[],
  providers: JsonRpcProvider[],
  consoleWarnOnError = false,
) => {
  let totalAmount = 0
  try {
    // Check parameters consistency
    if (!contractsAddressesAbiFunctionnameByProvider?.length) {
      consoleWarnOnError && console.warn('Invalid contracts addresses')
      return totalAmount
    }
    // Sum all contractsAddressesByProvider lengths using reduce
    // Only consider arrays with at least 1 element containing 3 elements (contractAddress, abi, functionName)
    const contractAddressesSum =
      contractsAddressesAbiFunctionnameByProvider.reduce(
        (acc, val) =>
          acc +
          (val.length
            ? val.reduce((acc2, val2) => acc2 + (val2.length == 3 ? 1 : 0), 0)
            : 0),
        0,
      )
    // Nothing to do if not any contract addresse(s)/abi(s)/function name(s) provided
    if (!contractAddressesSum) {
      consoleWarnOnError &&
        console.error(
          'Invalid contracts addresses sum (no contract addresse(s)/abi(s)/function name(s))',
        )
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
    // Convert addressList to object once for all providers
    const addressListObj = addressList.map((address: string) => [
      address as unknown as object,
    ])

    const statesPromises = providers.map(
      (provider: JsonRpcProvider, providerIdx) => {
        if (!contractsAddressesAbiFunctionnameByProvider[providerIdx]?.length) {
          // No contract(s) for this provider
          consoleWarnOnError && console.warn('No contract(s) for this provider')
          return []
        }
        return contractsAddressesAbiFunctionnameByProvider[providerIdx].map(
          ([contractAddress, abi, functionName]) => {
            // Must have 3 elements: contractAddress, abi, functionName
            if (!contractAddress || !abi || !functionName) {
              consoleWarnOnError &&
                console.warn('ABI, contract address or function name missing')
              return null
            }
            const RegVaultGetUserGlobalStateContract = new Contract(
              contractAddress,
              abi,
              provider,
            )
            const state = batchCallOneContractOneFunctionMultipleParams(
              RegVaultGetUserGlobalStateContract,
              functionName,
              addressListObj,
            )
            return state
          },
        )
      },
    )

    // Wait all promises to resolve and flatten the array
    const statesArray = await Promise.all(statesPromises.flat())
    const states = statesArray.flat()
    // Sum all valid balances
    states.forEach((state: object | null | undefined) => {
      try {
        if (state) {
          totalAmount += Number((state as { 0: string; 1: string })['0'])
        }
      } catch (error) {
        if (consoleWarnOnError) {
          console.warn('Failed to sum balances', error)
        }
      }
    })
    return totalAmount
  } catch (error) {
    console.warn('Failed to get balances', error)
  }
  return totalAmount
}

export { getAddressesLockedBalances }
