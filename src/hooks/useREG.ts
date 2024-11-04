import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import { Contract } from 'ethers'

import { initializeProviders } from 'src/repositories/RpcProvider'
import { selectUserCurrency } from 'src/store/features/currencies/currenciesSelector'
import {
  selectUserAddressList,
  selectUserIncludesEth,
} from 'src/store/features/settings/settingsSelector'
import { REGRealtoken } from 'src/store/features/wallets/walletsSelector'
// import { getErc20AbiBalanceOfOnly } from 'src/utils/blockchain/ERC20'
import { ERC20ABI } from 'src/utils/blockchain/abi/ERC20ABI'
import {
  DEFAULT_REG_PRICE,
  HoneySwapFactory_Address,
  REG_ContractAddress,
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

const getREG = async (
  addressList: string[],
  rate: number,
  includeETH = false, // boolean
): Promise<REGRealtoken> => {
  // let totalAmount = 0
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

  const totalAmount = await getAddressesBalances(
    REG_ContractAddress,
    addressList,
    providers,
  )
  console.log('REG totalAmount', totalAmount)
  const RegContractTotalSupply = await RegContract_Gnosis.totalSupply()
  console.log('REG totalsupply', RegContractTotalSupply)

  const totalTokens = Number(RegContractTotalSupply)
  const amount = totalAmount / 10 ** REGtokenDecimals

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

  console.log('regPriceUsdc', regPriceUsdc)
  console.log('regPriceWxdai', regPriceWxdai)

  // const averagePrice =
  //   regPriceUsdc && regPriceWxdai
  //     ? (regPriceUsdc + regPriceWxdai) / 2
  //     : regPriceUsdc
  //       ? regPriceUsdc
  //       : regPriceWxdai

  const averagePrice = averageValues([regPriceUsdc, regPriceWxdai])
  console.log('REG averagePrice', averagePrice)
  const unitPriceCost = averagePrice ? averagePrice / rate : DEFAULT_REG_PRICE

  const value = unitPriceCost * amount
  const totalInvestment = Infinity // totalTokens * unitPriceCost // Should display circulating supply

  return {
    id: `${REG_asset_ID}`,
    fullName: 'RealToken Ecosystem Governance',
    shortName: 'REG',
    amount,
    totalTokens,
    imageLink: [
      'https://static.debank.com/image/xdai_token/logo_url/0x0aa1e96d2a46ec6beb2923de1e61addf5f5f1dce/c56091d1d22e34e5e77aed0c64d19338.png',
    ],
    isRmmAvailable: false,
    value,
    totalInvestment,
    unitPriceCost,
  }
}

export const useREG = () => {
  const [reg, setReg] = useState<REGRealtoken | null>(null)
  const addressList = useSelector(selectUserAddressList)

  const { rate } = useSelector(selectUserCurrency)
  const includeETH = useSelector(selectUserIncludesEth)

  useEffect(() => {
    ;(async () => {
      const reg_ = await getREG(addressList, rate, includeETH)

      setReg(reg_)
    })()
  }, [addressList])

  return reg
}
