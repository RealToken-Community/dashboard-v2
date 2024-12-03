import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import { Contract } from 'ethers'

import { initializeProviders } from 'src/repositories/RpcProvider'
import {
  selectCurrencyRates,
  selectUserCurrency,
} from 'src/store/features/currencies/currenciesSelector'
import {
  selectUserAddressList, // selectUserIncludesEth,
} from 'src/store/features/settings/settingsSelector'
import { RWARealtoken } from 'src/store/features/wallets/walletsSelector'
import { Currency } from 'src/types/Currencies'
import { ERC20ABI } from 'src/utils/blockchain/abi/ERC20ABI'
import {
  DEFAULT_RWA_PRICE,
  DEFAULT_USDC_USD_RATE,
  DEFAULT_XDAI_USD_RATE,
  HoneySwapFactory_Address,
  RWA_ContractAddress,
  RWA_asset_ID,
  RWAtokenDecimals,
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

const getRWA = async (
  addressList: string[],
  userRate: number,
  currenciesRates: Record<Currency, number>,
  // includeETH = false,
): Promise<RWARealtoken> => {
  const { GnosisRpcProvider /* , EthereumRpcProvider */ } =
    await initializeProviders()
  const providers = [GnosisRpcProvider]

  const contractRwa_Gnosis = new Contract(
    RWA_ContractAddress,
    ERC20ABI,
    GnosisRpcProvider,
  )
  const totalAmount = await getAddressesBalances(
    RWA_ContractAddress,
    addressList,
    providers,
  )
  const RwaContractTotalSupply = await contractRwa_Gnosis.totalSupply()
  const totalTokens = Number(RwaContractTotalSupply) / 10 ** RWAtokenDecimals
  const amount = totalAmount / 10 ** RWAtokenDecimals

  // RWA token prices in USDC and WXDAI from LPs
  const rwaPriceUsdc = await getUniV2AssetPrice(
    HoneySwapFactory_Address,
    RWA_ContractAddress,
    USDConXdai_ContractAddress,
    RWAtokenDecimals,
    USDCtokenDecimals,
    GnosisRpcProvider,
  )
  const rwaPriceWxdai = await getUniV2AssetPrice(
    HoneySwapFactory_Address,
    RWA_ContractAddress,
    WXDAI_ContractAddress,
    RWAtokenDecimals,
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
  const assetPriceUsd1 = rwaPriceUsdc ? rwaPriceUsdc * rateUsdcUsd : null
  const assetPriceUsd2 = rwaPriceWxdai ? rwaPriceWxdai * rateXdaiUsd : null
  // Get average token price in USD
  const assetAveragePriceUSD = averageValues([assetPriceUsd1, assetPriceUsd2])
  // Convert price in Currency by applying rate
  const tokenPrice = (assetAveragePriceUSD ?? DEFAULT_RWA_PRICE) / userRate
  const value = tokenPrice * amount
  const totalInvestment = totalTokens * tokenPrice

  return {
    id: `${RWA_asset_ID}`,
    fullName: 'RWA Holdings SA, Neuchatel, NE, Suisse',
    shortName: 'RWA',
    amount,
    tokenPrice,
    totalTokens,
    imageLink: [
      'https://realt.co/wp-content/uploads/2024/02/Equity_FinalDesign-2000px-800x542.png',
    ],
    isRmmAvailable: false,
    value,
    totalInvestment,
    unitPriceCost: tokenPrice,
    initialLaunchDate: {
      date: '2024-03-21 00:00:00.000000',
      timezone_type: 3,
      timezone: 'UTC',
    },
  }
}

export const useRWA = () => {
  const [rwa, setRwa] = useState<RWARealtoken | null>(null)
  const addressList = useSelector(selectUserAddressList)
  const { rate: userRate } = useSelector(selectUserCurrency)
  const currenciesRates = useSelector(selectCurrencyRates)
  // const includeETH = useSelector(selectUserIncludesEth) // useless: RWA does not (yet ?) exist on Ethereum
  useEffect(() => {
    if (addressList.length) {
      getRWA(addressList, userRate, currenciesRates).then(setRwa)
    }
  }, [addressList, userRate, currenciesRates])

  return rwa
}
