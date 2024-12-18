import { Contract, JsonRpcProvider, ethers } from 'ethers'

import { LevinswapABI as UniswapV2PairABI } from './abi/LevinswapABI'
import { UniswapV2FactoryABI } from './abi/UniswapV2FactoryABI'

const isAddressLowererThan = (address0: string, address1: string): boolean => {
  if (!address0 || !address1) {
    console.error(`Invalid address ${address0} or ${address1}`)
    return false
  }
  return address0.toLowerCase() < address1.toLowerCase()
}

const getUniV2PairAddress = async (
  factoryContract: Contract,
  tokenAddress0: string,
  tokenAddress1: string,
): Promise<string> => {
  try {
    const pairAddress = await factoryContract.getPair(
      tokenAddress0,
      tokenAddress1,
    )
    return pairAddress
  } catch (error) {
    console.error('Failed to get pair address', error)
  }
  return ''
}

const getUniV2AssetPriceFromReserves = (
  reserve0: bigint,
  reserve1: bigint,
  token0Address: string,
  token1Address: string,
  token0Decimals: number,
  token1Decimals: number,
  whichAssetPrice = 0, // number
): number | null => {
  let price: number | null = null
  try {
    const zeroIsLowerThanOne = isAddressLowererThan(
      token0Address,
      token1Address,
    )
    let reserveNominator = reserve0
    let reserveNominatorMultiplierBI = BigInt(10 ** token1Decimals)
    let reserveDenominator = reserve1
    let reserveDenominatorDecimalsDivider = token0Decimals
    if (
      (whichAssetPrice && !zeroIsLowerThanOne) ||
      !(whichAssetPrice && zeroIsLowerThanOne)
    ) {
      reserveNominator = reserve1
      reserveNominatorMultiplierBI = BigInt(10 ** token0Decimals)
      reserveDenominator = reserve0
      reserveDenominatorDecimalsDivider = token1Decimals
    }
    const priceBN =
      (reserveNominator * reserveNominatorMultiplierBI) / reserveDenominator
    price = Number(priceBN)
    const priceDivider = 10 ** reserveDenominatorDecimalsDivider

    price = price / priceDivider
  } catch (error) {
    console.warn('Failed to compute price', error)
  }
  return price
}

/**
 *
 * @param factoryAddress The address of the Uniswap V2 factory contract
 * @param token0Address
 * @param token1Address
 * @param token0Decimals
 * @param token1Decimals
 * @param provider The provider to use to interact with the blockchain
 * @param whichAssetPrice choose which asset price to get: 0 (default) = token0, any other value = token1
 * @returns
 */
const getUniV2AssetPrice = async (
  factoryAddress: string,
  token0Address: string,
  token1Address: string,
  token0Decimals: number,
  token1Decimals: number,
  provider: JsonRpcProvider,
  whichAssetPrice = 0, // : number
): Promise<number | null> => {
  let price: number | null = null
  try {
    const factoryContract = new ethers.Contract(
      factoryAddress,
      UniswapV2FactoryABI,
      provider,
    )
    const pairAddress = await getUniV2PairAddress(
      factoryContract,
      token0Address,
      token1Address,
    )
    if (!pairAddress) {
      throw new Error('Failed to get pair address')
    }
    const pairContract = new ethers.Contract(
      pairAddress,
      UniswapV2PairABI,
      provider,
    )
    const reserves = await pairContract.getReserves()
    const [reserve0, reserve1] = reserves
    price = getUniV2AssetPriceFromReserves(
      reserve0,
      reserve1,
      token0Address,
      token1Address,
      token0Decimals,
      token1Decimals,
      whichAssetPrice,
    )
  } catch (error) {
    console.warn(
      `Failed to get asset price for factoryAddress ${factoryAddress} token0Address ${token0Address} token1Address ${token1Address}`,
      error,
      provider,
    )
  }
  return price
}

const averageValues = (
  values: (number | null | undefined)[],
): number | null => {
  let average: number | null = null
  try {
    if (values?.length) {
      let sum = 0
      let count = 0
      values.forEach((value) => {
        // Skip NaN / null / undefined values
        if (value && isFinite(value)) {
          sum += value
          count++
        }
      })
      average = sum / count
    }
  } catch (error) {
    console.warn('Failed to get average values', error)
  }
  return average
}

export { getUniV2AssetPrice, averageValues }
