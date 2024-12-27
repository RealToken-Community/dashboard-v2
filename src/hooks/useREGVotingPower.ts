import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import { Contract } from 'ethers'

import { initializeProviders } from 'src/repositories/RpcProvider'
import { selectUserAddressList } from 'src/store/features/settings/settingsSelector'
import { REGVotingPowertoken } from 'src/store/features/wallets/walletsSelector'
import { APIRealTokenProductType } from 'src/types/APIRealToken'
import { ERC20ABI } from 'src/utils/blockchain/abi/ERC20ABI'
import {
  DEFAULT_REGVotingPower_PRICE,
  REGVotingPower_asset_ID,
  REGVotingPowertokenDecimals,
  RegVotingPower_Gnosis_ContractAddress,
} from 'src/utils/blockchain/consts/otherTokens'
import { getAddressesBalances } from 'src/utils/blockchain/erc20Infos'

const getRegVotingPower = async (
  addressList: string[],
): Promise<REGVotingPowertoken> => {
  const { GnosisRpcProvider } = await initializeProviders()
  const providers = [GnosisRpcProvider]
  const RegVotingPowerContract = new Contract(
    RegVotingPower_Gnosis_ContractAddress,
    ERC20ABI,
    GnosisRpcProvider,
  )
  const balances = await getAddressesBalances(
    RegVotingPower_Gnosis_ContractAddress,
    addressList,
    providers,
  )
  const contractRegVotePowerTotalSupply =
    await RegVotingPowerContract.totalSupply()
  const totalTokens =
    Number(contractRegVotePowerTotalSupply) / 10 ** REGVotingPowertokenDecimals
  const amount = balances?.totalAmount / 10 ** REGVotingPowertokenDecimals
  const tokenPrice = DEFAULT_REGVotingPower_PRICE
  const value = tokenPrice * amount
  const totalInvestment = tokenPrice * totalTokens
  // Reg voting power does not have (yet) a unit price cost
  return {
    id: `${REGVotingPower_asset_ID}`,
    fullName: 'REG Voting Power Registry',
    shortName: 'REG VOTING POWER',
    productType: APIRealTokenProductType.EquityToken,
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
    balance: balances.balance,
  }
}

export const useRegVotingPower = () => {
  const [regVotingPower, setRegVotingPower] =
    useState<REGVotingPowertoken | null>(null)
  const addressList = useSelector(selectUserAddressList)

  useEffect(() => {
    if (addressList.length) {
      getRegVotingPower(addressList).then(setRegVotingPower)
    }
  }, [addressList])

  return regVotingPower
}
