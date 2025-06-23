import { AaveV3Ethereum, AaveV3Gnosis } from '@bgd-labs/aave-address-book'

import { Contract, JsonRpcProvider } from 'ethers'

import { BalanceByWalletType } from 'src/store/features/wallets/walletsSelector'

import { WalletBalanceProviderABI } from './abi/WalletBalanceProviderABI'

export interface Balances {
  totalAmount: number
  balance: BalanceByWalletType
}

const getAddressesBalances = async (
  contractAddress: string,
  addressList: string[],
  provider: JsonRpcProvider,
  consoleWarnOnError = false,
): Promise<number> => {
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
    if (!provider) {
      consoleWarnOnError && console.error('Invalid providers')
      return totalAmount
    }

    let walletBalanceProviderAddress
    switch (provider._network.chainId) {
      case 100n:
        walletBalanceProviderAddress = AaveV3Gnosis.WALLET_BALANCE_PROVIDER
        break
      case 1n:
        walletBalanceProviderAddress = AaveV3Ethereum.WALLET_BALANCE_PROVIDER
        break
      default:
        consoleWarnOnError && console.error('Invalid provider')
        return totalAmount
    }

    const balanceWalletProviderContract = new Contract(
      walletBalanceProviderAddress,
      WalletBalanceProviderABI,
      provider,
    )

    const balances = await balanceWalletProviderContract.batchBalanceOf(
      addressList,
      [contractAddress],
    )
    totalAmount = balances.reduce(
      (acc: number, b: bigint) => acc + Number(b),
      0,
    )
    return totalAmount
  } catch (error) {
    console.warn('Failed to get balances', error)
  }
  return totalAmount
}

export { getAddressesBalances }
