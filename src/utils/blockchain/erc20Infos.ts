import { Contract, JsonRpcProvider } from 'ethers'

import { getErc20AbiBalanceOfOnly } from 'src/utils/blockchain/ERC20'

import {
  CHAIN_ID_ETHEREUM,
  CHAIN_ID_GNOSIS_XDAI,
  CHAIN_NAME_ETHEREUM,
  CHAIN_NAME_GNOSIS_XDAI,
} from './consts/otherTokens'
import { batchCallOneContractOneFunctionMultipleParams } from './contract'
// import { BalanceByWalletType } from 'src/store/features/wallets/walletsSelector'
import { WalletType } from 'src/repositories'
// import { defaultBalance } from 'src/store/features/wallets/walletsSelector'

const getWalletType = (walletTypeId: number) => {
  return getChainName(walletTypeId)
}

const getChainName = (chainId: number) => {
  switch (chainId) {
    case CHAIN_ID_ETHEREUM:
      return CHAIN_NAME_ETHEREUM
    case CHAIN_ID_GNOSIS_XDAI:
      return CHAIN_NAME_GNOSIS_XDAI
  }
}

export interface Balances {
  totalAmount: number,
  // balance: BalanceByWalletType,
  balance: Record<
    WalletType,
    {
      amount: number
      value: number
    }
  >
}

const getAddressesBalances = async (
  contractAddress: string,
  addressList: string[],
  providers: JsonRpcProvider[],
  consoleWarnOnError = false,
):Promise<Balances> => {
  console.debug(`getAddressesBalances contractAddress=${contractAddress} addressList = ${addressList} providers =`, providers)
  const balances: Balances = {
    totalAmount: 0,
    balance: {
      gnosis: {
        amount: 0,
        value : 0,
      },
      ethereum: {
        amount: 0,
        value : 0,
      },
      rmm: {
        amount: 0,
        value : 0,
      },
      levinSwap: {
        amount: 0,
        value : 0,
      }
    }
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
    // console.debug('balancesArray', balancesArray)
    if (balancesArray?.length !== providers.length) {
      // warn but don't stop
      consoleWarnOnError && console.warn('Invalid balances array (inconsistent providers length)')
      // console.warn('Invalid balances array')
    }
    // let iBalances = 0
    providers.forEach((provider: JsonRpcProvider, providerIdx) => {
      const chainId = Number(provider?._network?.chainId)
      // console.debug(`contractAddress=${contractAddress} chainId=${chainId} balancesArray[${providerIdx}]=${balancesArray[providerIdx]}`)
      const wt = getWalletType(chainId)
      if (wt) {
        balances.balance[wt].value = 0;
        if (balancesArray[providerIdx]?.length !== addressList.length) {
          // warn but don't stop
          consoleWarnOnError && console.warn('Invalid balances array (inconsistent addressList length)')
          // console.warn('Invalid balances array')
        }
        (balancesArray[providerIdx] as unknown as bigint[])?.forEach((addressBalanceBI: bigint) => {
          try {
            const addressBalance = Number(addressBalanceBI)
            // console.debug(`balances.balance[${wt}].amount = ${balances.balance[wt].amount} addressBalanceBI=${addressBalanceBI} balances.totalAmount=${balances.totalAmount} addressBalance=${addressBalance}`)
            balances.balance[wt].amount += addressBalance
            console.debug(`contractAddress=${contractAddress} chainId=${chainId} balances.balance[${wt}].amount = ${balances.balance[wt].amount} addressBalanceBI=${addressBalanceBI} balances.totalAmount=${balances.totalAmount}`)
          } catch (error) {
            // Silent
          }
        })
        balances.totalAmount += balances.balance[wt].amount
      }
    })
    // console.debug('balances', balances)
    return balances
  } catch (error) {
    console.warn('Failed to get balances', error)
  }
  // return totalAmount
  return balances
}

export { getAddressesBalances }
