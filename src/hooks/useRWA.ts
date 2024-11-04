import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import { Contract } from 'ethers'

import { initializeProviders } from 'src/repositories/RpcProvider'
import { selectUserCurrency } from 'src/store/features/currencies/currenciesSelector'
import {
  selectUserAddressList,
  selectUserIncludesEth,
} from 'src/store/features/settings/settingsSelector'
import { RWARealtoken } from 'src/store/features/wallets/walletsSelector'
import { ERC20ABI } from 'src/utils/blockchain/abi/ERC20ABI'
import {
  DEFAULT_RWA_PRICE,
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
  rate: number,
  includeETH = false, // boolean
): Promise<RWARealtoken> => {
  const { GnosisRpcProvider, EthereumRpcProvider } = await initializeProviders()
  const providers = [GnosisRpcProvider]
  if (includeETH) {
    providers.push(EthereumRpcProvider)
  }

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
  const totalTokens = Number(RwaContractTotalSupply)
  const amount = totalAmount / 10 ** RWAtokenDecimals

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
  const averagePrice = averageValues([rwaPriceUsdc, rwaPriceWxdai])
  const unitPriceCost = (averagePrice ?? DEFAULT_RWA_PRICE) / rate
  const value = unitPriceCost * amount
  const totalInvestment = totalTokens * unitPriceCost

  return {
    id: `${RWA_asset_ID}`,
    fullName: 'RWA Holdings SA, Neuchatel, NE, Suisse',
    shortName: 'RWA',
    amount,
    totalTokens,
    imageLink: [
      'https://realt.co/wp-content/uploads/2024/02/Equity_FinalDesign-2000px-800x542.png',
    ],
    isRmmAvailable: false,
    value,
    totalInvestment,
    unitPriceCost,
  }
}

export const useRWA = () => {
  const [rwa, setRwa] = useState<RWARealtoken | null>(null)
  const addressList = useSelector(selectUserAddressList)
  const { rate } = useSelector(selectUserCurrency)
  const includeETH = useSelector(selectUserIncludesEth)
  useEffect(() => {
    ;(async () => {
      const rwa_ = await getRWA(addressList, rate, includeETH)

      setRwa(rwa_)
    })()
  }, [addressList])

  return rwa
}
