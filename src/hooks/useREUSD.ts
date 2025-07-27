import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import { Contract } from 'ethers'

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
import { HoneySwapFactory_Address } from 'src/utils/blockchain/consts/misc'
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
  averageValues,
  getUniV2AssetPrice,
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
  const reusdPriceUsdc = await getUniV2AssetPrice(
    HoneySwapFactory_Address,
    REUSD_ContractAddress,
    USDConXdai_ContractAddress,
    REUSDtokenDecimals,
    USDCtokenDecimals,
    GnosisRpcProvider,
  )
  const reusdPriceWxdai = await getUniV2AssetPrice(
    HoneySwapFactory_Address,
    REUSD_ContractAddress,
    WXDAI_ContractAddress,
    REUSDtokenDecimals,
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
  const assetPriceUsd1 = reusdPriceUsdc ? reusdPriceUsdc * rateUsdcUsd : null
  const assetPriceUsd2 = reusdPriceWxdai ? reusdPriceWxdai * rateXdaiUsd : null
  // Get average token prices in USD
  const assetAveragePriceUSD = averageValues([assetPriceUsd1, assetPriceUsd2])
  // Convert prices in Currency by applying rate
  const tokenPrice = assetAveragePriceUSD
    ? assetAveragePriceUSD / userRate
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
