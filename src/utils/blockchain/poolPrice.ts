import { Token } from '@uniswap/sdk-core'
import {
  FeeAmount,
  FeeAmount as Univ3FeeAmount,
  computePoolAddress,
} from '@uniswap/v3-sdk'

import { Contract, JsonRpcProvider, ethers } from 'ethers'

import { LevinswapABI as UniswapV2PairABI } from './abi/LevinswapABI'
import { UniswapV2FactoryABI } from './abi/UniswapV2FactoryABI'
import { UniswapV3PoolABI as UniV3PoolABI } from './abi/UniswapV3PoolABI'
import { UniswapV3QuoterV2ABI as Univ3QuoterABI } from './abi/UniswapV3QuoterV2ABI'
import {
  Address,
  ChainId,
  Decimals,
  SUPPORTED_CHAINS_IDS,
  UniV3Deployment,
} from './consts/misc'

// const FeeAmounts = {
//   LOWEST: Univ3FeeAmount.LOWEST,
//   LOW: Univ3FeeAmount.LOW,
//   MEDIUM: Univ3FeeAmount.MEDIUM,
//   HIGH: Univ3FeeAmount.HIGH,
// }

const AssetPrice = {
  TokenA: 0,
  TokenB: 1,
}

const FeeAmounts = {
  // 1e6
  LOWEST: Univ3FeeAmount.LOWEST,
  LOW: Univ3FeeAmount.LOW,
  MEDIUM: Univ3FeeAmount.MEDIUM,
  HIGH: Univ3FeeAmount.HIGH,
}

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

const getUniV3PoolAddress = (
  tokenA_Address: Address,
  tokenA_Decimals: Decimals,
  tokenB_Address: Address,
  tokenB_Decimals: Decimals,
  fee: number,
  poolFactoryAddress: Address,
  chainId: ChainId,
): string => {
  // Validate inputs
  // chainId
  if (!SUPPORTED_CHAINS_IDS.includes(chainId)) {
    throw new Error(`Unsupported chainId: ${chainId}`)
  }
  // token addresses
  if (!tokenA_Address || !tokenB_Address || tokenA_Address === tokenB_Address) {
    throw new Error('Invalid token addresses')
  }
  // token decimals
  if (!tokenA_Decimals || !tokenB_Decimals) {
    throw new Error('Invalid token decimals')
  }
  // fee
  if (!Object.values(FeeAmounts).includes(fee)) {
    throw new Error(
      `Invalid fee: ${fee} - must be one of ${Object.values(FeeAmounts)}`,
    )
  }
  // pool factory address
  if (!poolFactoryAddress) {
    throw new Error('Invalid fee or pool factory address')
  }
  const tokenA = new Token(chainId, tokenA_Address, tokenA_Decimals)
  const tokenB = new Token(chainId, tokenB_Address, tokenB_Decimals)

  return computePoolAddress({
    factoryAddress: poolFactoryAddress,
    tokenA: tokenA,
    tokenB: tokenB,
    fee,
  })
}

const getUniV3AssetPrice = async (
  uniV3Deployment: UniV3Deployment,
  token0Address: Address,
  token1Address: Address,
  token0Decimals: Decimals,
  token1Decimals: Decimals,
  provider: JsonRpcProvider,
  chainId: ChainId,
  fee = FeeAmount.MEDIUM, // Default to 3000 bips (0.3%)
  whichAssetPrice = AssetPrice.TokenA, // : 0 for token0 price, 1 for token1 price
  amountIn = 10, // Amount of token to quote without decimals
): Promise<number | null> => {
  let price: number | null = null
  try {
    // Validate inputs
    if (!uniV3Deployment[chainId]) {
      throw new Error(`No deployment found for chainId ${chainId}`)
    }
    const poolAddress = getUniV3PoolAddress(
      token0Address,
      token0Decimals,
      token1Address,
      token1Decimals,
      fee,
      uniV3Deployment[chainId].factory,
      chainId,
    )
    // Check pool address result
    if (!poolAddress) {
      throw new Error('Failed to get pool address')
    }
    // Quoter
    const quoterContract = new Contract(
      uniV3Deployment[chainId].quoter,
      Univ3QuoterABI,
      provider,
    )
    // Amounts
    const amountInBI =
      BigInt(amountIn) *
      BigInt(
        10 **
          (whichAssetPrice === AssetPrice.TokenA
            ? token0Decimals
            : token1Decimals),
      )

    const quotedAmountOut =
      await quoterContract.quoteExactInputSingle.staticCall({
        tokenIn:
          whichAssetPrice === AssetPrice.TokenA ? token0Address : token1Address,
        tokenOut:
          whichAssetPrice === AssetPrice.TokenA ? token1Address : token0Address,
        amountIn: amountInBI,
        fee: fee,
        sqrtPriceLimitX96: 0n, // No price limit
      })

    price =
      Number(quotedAmountOut[0]) /
      amountIn /
      10 **
        (whichAssetPrice === AssetPrice.TokenA
          ? token1Decimals
          : token0Decimals)
  } catch (error) {
    console.warn(
      `Failed to get asset price for factoryAddress ${uniV3Deployment[chainId].factory} token0Address ${token0Address} token1Address ${token1Address} fee ${fee} chainId ${chainId} amountIn ${amountIn} whichAssetPrice ${whichAssetPrice}`,
      error,
      provider,
    )
  }
  return price
}

export { AssetPrice, FeeAmounts }
export { getUniV2AssetPrice, averageValues, getUniV3AssetPrice }
