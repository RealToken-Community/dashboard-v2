import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import { Contract } from 'ethers'

import { initializeProviders } from 'src/repositories/RpcProvider'
import { selectUserAddressList } from 'src/store/features/settings/settingsSelector'
import { REGVotingPowertoken } from 'src/store/features/wallets/walletsSelector'
import { ERC20ABI } from 'src/utils/blockchain/abi/ERC20ABI'
import {
  DEFAULT_REGVotingPower_PRICE,
  REGVotingPower_asset_ID,
  REGVotingPowertokenDecimals,
  RegVotingPower_ContractAddress,
} from 'src/utils/blockchain/consts/otherTokens'
import { getAddressesBalances } from 'src/utils/blockchain/erc20Infos'

const getRegVotingPower = async (
  addressList: string[],
  // includeETH = false, // boolean
): Promise<REGVotingPowertoken> => {
  const { GnosisRpcProvider } = await initializeProviders()
  const providers = [GnosisRpcProvider]
  const RegVotingPowerContract = new Contract(
    RegVotingPower_ContractAddress,
    ERC20ABI,
    GnosisRpcProvider,
  )
  const totalAmount = await getAddressesBalances(
    RegVotingPower_ContractAddress,
    addressList,
    providers,
  )

  const contractRegVotePowerTotalSupply =
    await RegVotingPowerContract.totalSupply()
  const totalTokens = Number(contractRegVotePowerTotalSupply)
  const amount = totalAmount / 10 ** REGVotingPowertokenDecimals
  const unitPriceCost = DEFAULT_REGVotingPower_PRICE
  const value = unitPriceCost * amount
  const totalInvestment = Infinity

  return {
    id: `${REGVotingPower_asset_ID}`,
    fullName: 'REG Voting Power Registry',
    shortName: 'REG-VOTING-POWER',
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

export const useRegVotingPower = () => {
  const [regVotingPower, setRegVotingPower] =
    useState<REGVotingPowertoken | null>(null)
  const addressList = useSelector(selectUserAddressList)

  useEffect(() => {
    ;(async () => {
      const regVotingPower_ = await getRegVotingPower(
        addressList,
        // Reg Voting Power is not deployed on Ethereum
      )
      setRegVotingPower(regVotingPower_)
    })()
  }, [addressList])

  return regVotingPower
}
