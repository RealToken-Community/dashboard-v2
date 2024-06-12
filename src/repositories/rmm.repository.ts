import { ethers } from 'ethers'
import _sumBy from 'lodash/sumBy'

import { UsdcAddress, WxdaiAddress } from 'src/utils/blockchain/Stablecoin'
import { useCacheWithLocalStorage } from 'src/utils/useCache'

import { GnosisRpcProvider } from './RpcProvider'
import { RmmPosition, getRmmPositions } from './subgraphs/queries/rmm.queries'

export const RmmRepository = {
  async getPositions(addressList: string[]) {
    const result = await getRmmPositions(addressList)
    const merged = mergeWalletsPositions(result)
    const stableRMM3 = await Promise.all(
      addressList.map(getBalanceOfStableRMM3),
    )

    merged.push({
      token: UsdcAddress,
      name: 'USD//C on xDai',
      amount: _sumBy(stableRMM3, 'aUSDC'),
      debt: _sumBy(stableRMM3, 'vUSDC'),
    })

    merged.push({
      token: WxdaiAddress,
      name: 'Wrapped XDAI',
      amount: _sumBy(stableRMM3, 'aXDAI'),
      debt: _sumBy(stableRMM3, 'vXDAI'),
    })

    return merged
  },
}

export interface WalletRmmPosition {
  token: string
  name: string
  amount: number
  debt: number
}

function mergeWalletsPositions(wallets: RmmPosition[]) {
  return wallets.reduce<WalletRmmPosition[]>((acc, wallet) => {
    wallet.positions.forEach((position) => {
      const existingPosition = acc.find((b) => b.token === position.token)

      if (existingPosition) {
        existingPosition.amount += position.amount
        existingPosition.debt += position.debt
      } else {
        acc.push({ ...position })
      }
    })

    return acc
  }, [])
}

const ABI = ['function balanceOf(address) view returns (uint256)']
const aUSDCAddress = '0xed56f76e9cbc6a64b821e9c016eafbd3db5436d1'
const vUSDCAddress = '0x69c731ae5f5356a779f44c355abb685d84e5e9e6'
const aXDAIAddress = '0x0ca4f5554dd9da6217d62d8df2816c82bba4157b'
const vXDAIAddress = '0x9908801df7902675c3fedd6fea0294d18d5d5d34'
const aUSDCContract = new ethers.Contract(aUSDCAddress, ABI, GnosisRpcProvider)
const vUSDCContract = new ethers.Contract(vUSDCAddress, ABI, GnosisRpcProvider)
const aXDAIContract = new ethers.Contract(aXDAIAddress, ABI, GnosisRpcProvider)
const vXDAIContract = new ethers.Contract(vXDAIAddress, ABI, GnosisRpcProvider)

const getBalanceOfStableRMM3 = useCacheWithLocalStorage(
  async (userAddress: string) => {
    const [aUSDC, vUSDC, aXDAI, vXDAI] = await Promise.all([
      aUSDCContract.balanceOf(userAddress),
      vUSDCContract.balanceOf(userAddress),
      aXDAIContract.balanceOf(userAddress),
      vXDAIContract.balanceOf(userAddress),
    ])

    return {
      aUSDC: Number(ethers.formatUnits(aUSDC, 6)),
      vUSDC: Number(ethers.formatUnits(vUSDC, 6)),
      aXDAI: Number(ethers.formatUnits(aXDAI, 18)),
      vXDAI: Number(ethers.formatUnits(vXDAI, 18)),
    }
  },
  {
    duration: 1000 * 60 * 60, // 1 hour
    key: 'BalanceOfStableRMM3',
    usePreviousValueOnError: true,
  },
)
