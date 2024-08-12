import { ethers } from 'ethers'

import { GnosisRpcProvider } from 'src/repositories/RpcProvider'
import { RWARealtoken } from 'src/store/features/wallets/walletsSelector'

const tokenDecimals = 9

const getRWA = async (addressList: string[]): Promise<RWARealtoken> => {
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

  return {
    id: '0',
    fullName: 'RWA Holdings SA, Neuchatel, NE, Suisse',
    shortName: 'RWA',
    amount: totalAmount / 10 ** tokenDecimals,
    totalTokens: 100_000,
    imageLink: [
      'https://realt.co/wp-content/uploads/2024/02/Equity_FinalDesign-2000px-800x542.png',
    ],
    isRmmAvailable: false,
  }
}

export default getRWA
