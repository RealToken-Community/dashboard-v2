import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import { ethers } from 'ethers'

import { GnosisRpcProvider } from 'src/repositories/RpcProvider'
import { selectUserCurrency } from 'src/store/features/currencies/currenciesSelector'
import { selectUserAddressList } from 'src/store/features/settings/settingsSelector'
import { RWARealtoken } from 'src/store/features/wallets/walletsSelector'

const tokenDecimals = 9

const getRWA = async (
  addressList: string[],
  rate: number,
): Promise<RWARealtoken> => {
  let totalAmount = 0

  for (let i = 0; i < addressList.length; i++) {
    const RWAContract = new ethers.Contract(
      '0x0675e8F4A52eA6c845CB6427Af03616a2af42170',
      ['function balanceOf(address) view returns (uint)'],
      GnosisRpcProvider,
    )
    const RWAContractBalance = await RWAContract.balanceOf(addressList[i])
    totalAmount += Number(RWAContractBalance)
  }

  const totalTokens = 100_000
  const amount = totalAmount / 10 ** tokenDecimals
  const unitPriceCost = 50 / rate

  const value = unitPriceCost * amount
  const totalInvestment = totalTokens * unitPriceCost

  return {
    id: '0',
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

  useEffect(() => {
    ;(async () => {
      const rwa_ = await getRWA(addressList, rate)

      setRwa(rwa_)
    })()
  }, [addressList])

  return rwa
}
