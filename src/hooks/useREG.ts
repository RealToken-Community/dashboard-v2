import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import { Contract } from 'ethers'

import { initializeProviders } from 'src/repositories/RpcProvider'
import {
  selectCurrencyRates,
  selectUserCurrency,
} from 'src/store/features/currencies/currenciesSelector'
import {
  selectUserAddressList,
  selectUserIncludesEth,
} from 'src/store/features/settings/settingsSelector'
import { REGRealtoken } from 'src/store/features/wallets/walletsSelector'
import { Currency } from 'src/types/Currencies'
import { ERC20ABI } from 'src/utils/blockchain/abi/ERC20ABI'
import {
  DEFAULT_REG_PRICE,
  DEFAULT_USDC_USD_RATE,
  DEFAULT_XDAI_USD_RATE,
  HoneySwapFactory_Address,
  REG_ContractAddress,
  REG_Vault_Gnosis_ContractAddress,
  REG_asset_ID,
  REGtokenDecimals,
  USDConXdai_ContractAddress,
  USDCtokenDecimals,
  WXDAI_ContractAddress,
  WXDAItokenDecimals,
} from 'src/utils/blockchain/consts/otherTokens'
import { getAddressesBalances } from 'src/utils/blockchain/erc20Infos'
import {
  averageValues,
  getUniV2AssetPrice,
} from 'src/utils/blockchain/poolPrice'
import {
  getAddressesLockedBalances,
  getRegVaultAbiGetUserGlobalStateOnly,
} from 'src/utils/blockchain/regVault'

/**
 *
 * @param addressList : user addresses list
 * @param userRate : user selected currency rate
 * @param currenciesRates : currencies rates
 * @param includeETH : include balances on ETH in the calculation
 * @returns
 */
const getREG = async (
  addressList: string[],
  userRate: number,
  currenciesRates: Record<Currency, number>,
  includeETH = false,
): Promise<REGRealtoken> => {
  const { GnosisRpcProvider, EthereumRpcProvider } = await initializeProviders()
  const providers = [GnosisRpcProvider]
  if (includeETH) {
    providers.push(EthereumRpcProvider)
  }
  const RegContract_Gnosis = new Contract(
    REG_ContractAddress,
    ERC20ABI,
    GnosisRpcProvider,
  )
  const availableBalance = await getAddressesBalances(
    REG_ContractAddress,
    addressList,
    providers,
  )

  const regVaultAbiGetUserGlobalStateOnly =
    getRegVaultAbiGetUserGlobalStateOnly()

  const lockedBalance = await getAddressesLockedBalances(
    [
      // First provider
      [
        // First vault
        [
          REG_Vault_Gnosis_ContractAddress, // Contract address
          regVaultAbiGetUserGlobalStateOnly, // Contract ABI
          'getUserGlobalState', // Contract method for getting balance
        ],
        // Second vault ...
      ],
      /*
      // Second provider
      [
        // First vault ...
        [
          // Contract address
          // Contract ABI
          // Contract method for getting balance
        ],
      ],
      // ...
      */
    ],
    addressList,
    providers,
  )

  const totalAmount = availableBalance + lockedBalance
  const contractRegTotalSupply = await RegContract_Gnosis.totalSupply()
  const totalTokens = Number(contractRegTotalSupply) / 10 ** REGtokenDecimals
  const amount = totalAmount / 10 ** REGtokenDecimals

  // Get REG token prices in USDC and WXDAI from LPs
  const regPriceUsdc = await getUniV2AssetPrice(
    HoneySwapFactory_Address,
    REG_ContractAddress,
    USDConXdai_ContractAddress,
    REGtokenDecimals,
    USDCtokenDecimals,
    GnosisRpcProvider,
  )
  const regPriceWxdai = await getUniV2AssetPrice(
    HoneySwapFactory_Address,
    REG_ContractAddress,
    WXDAI_ContractAddress,
    REGtokenDecimals,
    WXDAItokenDecimals,
    GnosisRpcProvider,
  )

  // Get rates for XDAI and USDC against USD
  const rateXdaiUsd = currenciesRates?.XDAI
    ? currenciesRates.XDAI
    : DEFAULT_XDAI_USD_RATE
  const rateUsdcUsd = currenciesRates?.USDC
    ? currenciesRates.USDC
    : DEFAULT_USDC_USD_RATE
  // Convert token prices to USD
  const assetPriceUsd1 = regPriceUsdc ? regPriceUsdc * rateUsdcUsd : null
  const assetPriceUsd2 = regPriceWxdai ? regPriceWxdai * rateXdaiUsd : null
  // Get average token prices in USD
  const assetAveragePriceUSD = averageValues([assetPriceUsd1, assetPriceUsd2])
  // Convert prices in Currency by applying rate
  const tokenPrice = assetAveragePriceUSD
    ? assetAveragePriceUSD / userRate
    : DEFAULT_REG_PRICE / userRate
  const value = tokenPrice * amount
  const totalInvestment = totalTokens * tokenPrice

  return {
    id: `${REG_asset_ID}`,
    fullName: 'RealToken Ecosystem Governance',
    shortName: 'REG',
    amount,
    tokenPrice,
    totalTokens,
    imageLink: [
      'https://static.debank.com/image/xdai_token/logo_url/0x0aa1e96d2a46ec6beb2923de1e61addf5f5f1dce/c56091d1d22e34e5e77aed0c64d19338.png',
    ],
    isRmmAvailable: false,
    value,
    totalInvestment,
    unitPriceCost: tokenPrice,
  }
}

export const useREG = () => {
  const [reg, setReg] = useState<REGRealtoken | null>(null)
  const addressList = useSelector(selectUserAddressList)
  const { rate: userRate } = useSelector(selectUserCurrency)
  const includeETH = useSelector(selectUserIncludesEth)
  const currenciesRates = useSelector(selectCurrencyRates)

  useEffect(() => {
    if (addressList.length) {
      getREG(addressList, userRate, currenciesRates, includeETH).then(setReg)
    }
  }, [addressList, userRate, currenciesRates, includeETH])

  return reg
}
