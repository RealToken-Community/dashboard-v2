import { ethers } from 'ethers'
import _sumBy from 'lodash/sumBy'

import { RealToken } from 'src/types/RealToken'
import { UsdcAddress, WxdaiAddress } from 'src/utils/blockchain/Stablecoin'
import { useCacheWithLocalStorage } from 'src/utils/useCache'

import { initializeProviders } from './RpcProvider'
import { getRmmPositions } from './subgraphs/queries/rmm.queries'

export const RmmRepository = {
  async getPositions(addressList: string[], realtokens: RealToken[]) {
    const [rmmPositionsResult, stableBalancesResult] = await Promise.allSettled(
      [
        getRmmPositions(addressList),
        Promise.all(addressList.map(getBalanceOfStableRMM3)),
      ],
    )

    const stableRMM3 =
      stableBalancesResult.status === 'fulfilled'
        ? stableBalancesResult.value
        : []
    if (stableBalancesResult.status === 'rejected') {
      console.warn(
        'Failed to fetch stable RMM balances, using empty fallback',
        stableBalancesResult.reason,
      )
    }

    const rmmPositions =
      rmmPositionsResult.status === 'fulfilled' ? rmmPositionsResult.value : []
    if (rmmPositionsResult.status === 'rejected') {
      console.warn(
        'Failed to fetch RMM graph positions, using empty fallback',
        rmmPositionsResult.reason,
      )
    }

    const tokenPriceByAddress = new Map<string, number>()
    realtokens.forEach((item) => {
      const gnosisContract = item.gnosisContract?.toLowerCase()
      if (gnosisContract) {
        tokenPriceByAddress.set(gnosisContract, item.tokenPrice)
      }
      const wrapperAddress = item.blockchainAddresses?.xDai?.rmmV3WrapperAddress
      if (wrapperAddress && String(wrapperAddress) !== '0') {
        tokenPriceByAddress.set(
          String(wrapperAddress).toLowerCase(),
          item.tokenPrice,
        )
      }
    })

    const wrapperCollateralValue = rmmPositions.reduce((acc, position) => {
      const tokenPrice = tokenPriceByAddress.get(position.token) ?? 0
      return acc + position.amount * tokenPrice
    }, 0)
    if (process.env.NODE_ENV !== 'production') {
      console.info('[RMM_WRAPPER_DEBUG] Collateral valuation', {
        positions: rmmPositions.length,
        wrapperCollateralValue,
      })
    }

    const merged: WalletRmmPosition[] = []

    merged.push({
      token: UsdcAddress,
      name: 'USD//C on xDai',
      amount: _sumBy(stableRMM3, 'aUSDC') + wrapperCollateralValue,
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

const ABI = ['function balanceOf(address) view returns (uint256)']
const aUSDCAddress = '0xed56f76e9cbc6a64b821e9c016eafbd3db5436d1'
const vUSDCAddress = '0x69c731ae5f5356a779f44c355abb685d84e5e9e6'
const aXDAIAddress = '0x0ca4f5554dd9da6217d62d8df2816c82bba4157b'
const vXDAIAddress = '0x9908801df7902675c3fedd6fea0294d18d5d5d34'

const getBalanceOfStableRMM3 = useCacheWithLocalStorage(
  async (userAddress: string) => {
    const { GnosisRpcProvider } = await initializeProviders()
    const aUSDCContract = new ethers.Contract(
      aUSDCAddress,
      ABI,
      GnosisRpcProvider,
    )
    const vUSDCContract = new ethers.Contract(
      vUSDCAddress,
      ABI,
      GnosisRpcProvider,
    )
    const aXDAIContract = new ethers.Contract(
      aXDAIAddress,
      ABI,
      GnosisRpcProvider,
    )
    const vXDAIContract = new ethers.Contract(
      vXDAIAddress,
      ABI,
      GnosisRpcProvider,
    )
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
    duration: 1000 * 60 * 60 * 24, // 24 hours
    key: 'BalanceOfStableRMM3',
    usePreviousValueOnError: true,
  },
)
