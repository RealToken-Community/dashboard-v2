import { Contract, JsonRpcProvider } from 'ethers'

import { getChainId } from 'src/repositories/RpcProvider'
import { BalanceByWalletType } from 'src/store/features/wallets/walletsSelector'
import { getWalletChainName } from 'src/store/features/wallets/walletsSelector'
import { getErc20AbiBalanceOfOnly } from 'src/utils/blockchain/ERC20'

import { batchCallOneContractOneFunctionMultipleParams } from './contract'

export interface Balances {
  totalAmount: number
  balance: BalanceByWalletType
}

const getAddressesBalances = async (
  contractAddress: string,
  addressList: string[],
  providers: JsonRpcProvider[],
  consoleWarnOnError = false,
): Promise<Balances> => {
  const balances: Balances = {
    totalAmount: 0,
    balance: {
      gnosis: {
        amount: 0,
        value: 0,
      },
      ethereum: {
        amount: 0,
        value: 0,
      },
      rmm: {
        amount: 0,
        value: 0,
      },
      levinSwap: {
        amount: 0,
        value: 0,
      },
    },
  }
  try {
    if (!contractAddress) {
      consoleWarnOnError && console.error('Invalid contract address')
      return balances
    }
    if (!addressList?.length) {
      consoleWarnOnError && console.error('Invalid address list')
      return balances
    }
    if (!providers?.length) {
      consoleWarnOnError && console.error('Invalid providers')
      return balances
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
    // warn but don't stop
    balancesArray?.length !== providers.length &&
      consoleWarnOnError &&
      console.warn(
        `Invalid balances array length (${balancesArray?.length}) (inconsistent with providers length (${providers.length}))`,
      )
    providers.forEach((provider: JsonRpcProvider, providerIdx) => {
      const chainId = getChainId(provider)
      const wt = chainId ? getWalletChainName(chainId) : null
      if (wt) {
        balances.balance[wt].value = 0
        // warn but don't stop
        balancesArray[providerIdx]?.length !== addressList.length &&
          consoleWarnOnError &&
          console.warn(
            'Invalid balances array (inconsistent addressList length)',
          )
        ;(balancesArray[providerIdx] as unknown as bigint[])?.forEach(
          (addressBalanceBI: bigint, addressIdx) => {
            try {
              const addressBalance = Number(addressBalanceBI)
              balances.balance[wt].amount += addressBalance
            } catch (error) {
              // warn but don't stop
              consoleWarnOnError &&
                console.warn(
                  `Invalid balance conversion for address ${addressList[addressIdx]} on chain ${chainId}`,
                  error,
                )
            }
          },
        )
        balances.totalAmount += balances.balance[wt].amount
      }
    })
    return balances
  } catch (error) {
    console.warn('Failed to get balances', error)
  }
  return balances
}

export { getAddressesBalances }
