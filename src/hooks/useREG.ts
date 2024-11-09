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
import { ERC20ABI } from 'src/utils/blockchain/abi/ERC20ABI'
import {
  DEFAULT_REG_PRICE,
  HoneySwapFactory_Address,
  REG_ContractAddress,
  REG_VaultContractAddress,
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
import { getAddressesLockedBalances } from 'src/utils/blockchain/regVault'

const getREG = async (
  addressList: string[],
  rate: number,
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
  const lockedBalance = await getAddressesLockedBalances(
    REG_VaultContractAddress,
    addressList,
    providers,
  )

  const totalAmount = availableBalance + lockedBalance
  const contractRegTotalSupply = await RegContract_Gnosis.totalSupply()
  const totalTokens = Number(contractRegTotalSupply) / 10 ** REGtokenDecimals
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

  const averagePrice = averageValues([regPriceUsdc, regPriceWxdai])
  const tokenPrice = averagePrice ? averagePrice / rate : DEFAULT_REG_PRICE

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
  const { rate } = useSelector(selectUserCurrency)
  const includeETH = useSelector(selectUserIncludesEth)

  useEffect(() => {
    if (addressList.length) {
      getREG(addressList, rate, includeETH).then(setReg)
    }
  }, [addressList])

  return reg
}
