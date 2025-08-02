import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import { Contract } from 'ethers'
import test from 'node:test'

import { WalletType } from 'src/repositories'
import { initializeProviders } from 'src/repositories/RpcProvider'
import {
  selectCurrencyRates,
  selectUserCurrency,
} from 'src/store/features/currencies/currenciesSelector'
import {
  selectUserAddressList,
  selectUserIncludesEth,
} from 'src/store/features/settings/settingsSelector'
import {
  BalanceByWalletType,
  REUSDGRealtoken,
  updateBalanceValues,
} from 'src/store/features/wallets/walletsSelector'
import { APIRealTokenProductType } from 'src/types/APIRealToken'
import { Currency } from 'src/types/Currencies'
import { ERC20ABI } from 'src/utils/blockchain/abi/ERC20ABI'
import {
  CHAIN_ID__GNOSIS_XDAI,
  HoneySwapFactory_Address,
  SUSHISWAP_DEPLOYMENTS,
} from 'src/utils/blockchain/consts/misc'
import {
  DEFAULT_REUSD_PRICE,
  DEFAULT_USDC_USD_RATE,
  DEFAULT_XDAI_USD_RATE,
  REUSD_ContractAddress,
  REUSD_asset_ID,
  REGtokenDecimals as REUSDtokenDecimals,
  USDConXdai_ContractAddress,
  USDCtokenDecimals,
  WXDAI_ContractAddress,
  WXDAItokenDecimals,
} from 'src/utils/blockchain/consts/otherTokens'
import { getAddressesBalances } from 'src/utils/blockchain/erc20Infos'
import {
  AssetPrice,
  FeeAmounts,
  averageValues,
  getUniV2AssetPrice,
  getUniV3AssetPrice,
} from 'src/utils/blockchain/poolPrice'

/**
 *
 * @param addressList : user addresses list
 * @param userRate : user selected currency rate
 * @param currenciesRates : currencies rates
 * @param includeETH : include balances on ETH in the calculation
 * @returns
 */
const getREUSD = async (
  addressList: string[],
  userRate: number,
  currenciesRates: Record<Currency, number>,
  includeETH = false,
): Promise<REUSDGRealtoken> => {
  const { GnosisRpcProvider, EthereumRpcProvider } = await initializeProviders()
  const providers = [GnosisRpcProvider]
  if (includeETH) {
    providers.push(EthereumRpcProvider)
  }
  const ReusdContract_Gnosis = new Contract(
    REUSD_ContractAddress,
    ERC20ABI,
    GnosisRpcProvider,
  )
  const balance: BalanceByWalletType = {
    [WalletType.Gnosis]: {
      amount: 0,
      value: 0,
    },
    [WalletType.Ethereum]: {
      amount: 0,
      value: 0,
    },
    [WalletType.RMM]: {
      amount: 0,
      value: 0,
    },
    [WalletType.LevinSwap]: {
      amount: 0,
      value: 0,
    },
  }
  let availableBalance = await getAddressesBalances(
    REUSD_ContractAddress,
    addressList,
    GnosisRpcProvider,
  )

  balance[WalletType.Gnosis].amount = availableBalance

  if (includeETH) {
    balance[WalletType.Ethereum].amount = await getAddressesBalances(
      REUSD_ContractAddress,
      addressList,
      EthereumRpcProvider,
    )
    availableBalance += balance[WalletType.Ethereum].amount
  }

  const totalAmount = availableBalance
  const contractReusdTotalSupply = await ReusdContract_Gnosis.totalSupply()
  const totalTokens =
    Number(contractReusdTotalSupply) / 10 ** REUSDtokenDecimals
  const amount = totalAmount / 10 ** REUSDtokenDecimals

  // Get REG token prices in USDC and WXDAI from LPs
  const reusdPriceUsdcHoneyswap = await getUniV2AssetPrice(
    HoneySwapFactory_Address,
    REUSD_ContractAddress,
    USDConXdai_ContractAddress,
    REUSDtokenDecimals,
    USDCtokenDecimals,
    GnosisRpcProvider,
  )
  // const reusdPriceWxdaiHoneyswap = await getUniV2AssetPrice( HoneySwapFactory_Address, REUSD_ContractAddress, WXDAI_ContractAddress, REUSDtokenDecimals, WXDAItokenDecimals, GnosisRpcProvider )
  const reusdPriceWxdaiHoneyswap = null // Honeyswap does not have WXDAI pool (yet)

  // Main pool on Gnosis: Sushiswap @ 0.01% fee
  const reusdPriceUsdcSushiv3 = await getUniV3AssetPrice(
    SUSHISWAP_DEPLOYMENTS,
    REUSD_ContractAddress,
    USDConXdai_ContractAddress,
    REUSDtokenDecimals,
    USDCtokenDecimals,
    GnosisRpcProvider,
    CHAIN_ID__GNOSIS_XDAI,
    FeeAmounts.LOWEST, // 0.01% fee
    AssetPrice.TokenA, // REUSD is token0, USDC is token1
    20, // Amount of token to quote without decimals
  )
  // const reusdPriceWxdaiSushiv3 = await getUniV3AssetPrice( SUSHISWAP_DEPLOYMENTS, REUSD_ContractAddress, WXDAI_ContractAddress, REUSDtokenDecimals, WXDAItokenDecimals, GnosisRpcProvider, CHAIN_ID__GNOSIS_XDAI, FeeAmounts.LOWEST ) // 0.01% fee AssetPrice.TokenA, // REUSD is token0, WXDAI is token1
  const reusdPriceWxdaiSushiv3 = null // Sushiswap does not have WXDAI pool (yet)

  // Get rates for XDAI and USDC against USD
  const rateXdaiUSD = currenciesRates?.XDAI
    ? currenciesRates.XDAI
    : DEFAULT_XDAI_USD_RATE
  const rateUsdcUSD = currenciesRates?.USDC
    ? currenciesRates.USDC
    : DEFAULT_USDC_USD_RATE
  // Convert Honeyswap token prices to USD
  const assetPriceUsd1 = reusdPriceUsdcHoneyswap
    ? reusdPriceUsdcHoneyswap * rateUsdcUSD
    : null
  const assetPriceUsd2 = reusdPriceWxdaiHoneyswap
    ? reusdPriceWxdaiHoneyswap * rateXdaiUSD
    : null
  // Get Honeyswap average token prices in USD
  const assetAveragePriceOnHoneyswapInUSD = averageValues([
    assetPriceUsd1,
    assetPriceUsd2,
  ])
  // Convert Sushiswap token price to USD
  const assetPriceUsd3 = reusdPriceUsdcSushiv3
    ? reusdPriceUsdcSushiv3 * rateUsdcUSD
    : null

  const assetPriceUsd4 = reusdPriceWxdaiSushiv3
    ? reusdPriceWxdaiSushiv3 * rateXdaiUSD
    : null

  // Get Sushiswap average token prices in USD
  const assetAveragePriceOnSushiswapInUSD = averageValues([
    assetPriceUsd3,
    assetPriceUsd4,
  ])

  // Apply a 20 / 80 ratio between Honeyswap and Sushiswap prices
  // we SHOULD COMPARE LIQUIDITY instead (todo)
  const assetPriceInUSD =
    0.2 *
      (assetAveragePriceOnHoneyswapInUSD
        ? assetAveragePriceOnHoneyswapInUSD
        : DEFAULT_REUSD_PRICE) +
    0.8 *
      (assetAveragePriceOnSushiswapInUSD
        ? assetAveragePriceOnSushiswapInUSD
        : DEFAULT_REUSD_PRICE)

  // Convert prices in Currency by applying rate
  const tokenPrice = assetPriceInUSD
    ? assetPriceInUSD / userRate
    : DEFAULT_REUSD_PRICE / userRate
  const value = tokenPrice * amount
  const totalInvestment = totalTokens * tokenPrice
  // Update all balance values with token price
  updateBalanceValues(balance, tokenPrice)

  return {
    id: `${REUSD_asset_ID}`,
    fullName: 'Realtoken Ecosystem USD',
    shortName: 'REUSD',
    productType: APIRealTokenProductType.EquityToken,
    amount,
    tokenPrice,
    totalTokens,
    imageLink: [
      'https://static.debank.com/image/project/logo_url/xdai_realtrmm/05ce107c2155971276a46b920053f704.png',
    ],
    isRmmAvailable: false,
    value,
    totalInvestment,
    unitPriceCost: tokenPrice,
    balance,
  }
}

export const useREUSD = () => {
  const [reusd, setReusd] = useState<REUSDGRealtoken | null>(null)
  const addressList = useSelector(selectUserAddressList)
  const { rate: userRate } = useSelector(selectUserCurrency)
  const includeETH = useSelector(selectUserIncludesEth)
  const currenciesRates = useSelector(selectCurrencyRates)

  useEffect(() => {
    if (addressList.length) {
      getREUSD(addressList, userRate, currenciesRates, includeETH).then(
        setReusd,
      )
    }
  }, [addressList, userRate, currenciesRates, includeETH])

  return reusd
}
