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
  showDebug = false,
): number | null => {
  let price: number | null = null
  try {
    const zeroIsLowerThanOne = isAddressLowererThan(
      token0Address,
      token1Address,
    )
    showDebug && console.debug('zeroIsLowerThanOne', zeroIsLowerThanOne)
    let reserveNominator = reserve0
    let reserveNominatorMultiplierBI = BigInt(10 ** token1Decimals)
    let reserveNominatorDecimalsMultiplier = token1Decimals
    let reserveDenominator = reserve1
    let reserveDenominatorDividerBI = BigInt(10 ** token0Decimals)
    let reserveDenominatorDecimalsDivider = token0Decimals

    if (!whichAssetPrice) {
      if (zeroIsLowerThanOne) {
        showDebug && console.debug('whichAssetPrice == 0 && zeroIsLowerThanOne')
        reserveNominator = reserve1
        reserveNominatorMultiplierBI = BigInt(10 ** token0Decimals)
        reserveNominatorDecimalsMultiplier = token0Decimals
        reserveDenominator = reserve0
        reserveDenominatorDividerBI = BigInt(10 ** token1Decimals)
        reserveDenominatorDecimalsDivider = token1Decimals
      }
    } else {
      if (!zeroIsLowerThanOne) {
        showDebug &&
          console.debug('whichAssetPrice != 0 && !zeroIsLowerThanOne')
        reserveNominator = reserve1
        reserveNominatorMultiplierBI = BigInt(10 ** token0Decimals)
        reserveNominatorDecimalsMultiplier = token0Decimals
        reserveDenominator = reserve0
        reserveDenominatorDividerBI = BigInt(10 ** token1Decimals)
        reserveDenominatorDecimalsDivider = token1Decimals
      }
    }

    if (showDebug) {
      const price01_BN = reserve0 / reserve1
      console.debug('price01_BN', price01_BN)
      const price10_BN = reserve1 / reserve0
      console.debug('price10_BN', price10_BN)
      console.debug(
        `reserveNominator: ${reserveNominator} * reserveNominatorMultiplierBI: ${reserveNominatorMultiplierBI} = ${reserveNominator * reserveNominatorMultiplierBI}`,
      )
      console.debug(
        `reserveDenominator: ${reserveDenominator} * reserveDenominatorDividerBI: ${reserveDenominatorDividerBI} = ${reserveDenominator * reserveDenominatorDividerBI}`,
      )
    }
    // const priceBN =
    //   // token0Decimals != token1Decimals
    //   true
    //     ? ((reserveNominator * reserveNominatorMultiplierBI) /
    //         reserveDenominator) *
    //       reserveDenominatorDividerBI
    //     : reserveNominator / reserveDenominator
    // console.debug('priceBN', priceBN)

    // const priceBN = ((reserveNominator * reserveNominatorMultiplierBI) /
    //         reserveDenominator) *
    //       reserveDenominatorDividerBI
    // console.debug('priceBN', priceBN)
    // price = Number(priceBN)
    // price = Number(
    //   (reserveNominator * reserveNominatorMultiplierBI) /
    //     reserveDenominator
    //      /
    //     reserveDenominatorDividerBI,
    // )

    console.debug('reserveNominator', reserveNominator)
    console.debug(
      'reserveNominatorDecimalsMultiplier',
      reserveNominatorDecimalsMultiplier,
    )
    console.debug('reserveNominatorMultiplierBI', reserveNominatorMultiplierBI)
    console.debug('reserveDenominator', reserveDenominator)
    console.debug(
      'reserveDenominatorDecimalsDivider',
      reserveDenominatorDecimalsDivider,
    )
    console.debug('reserveDenominatorDividerBI', reserveDenominatorDividerBI)

    const priceBN =
      (reserveNominator * reserveNominatorMultiplierBI) / reserveDenominator
    showDebug && console.debug('priceBN', priceBN)
    price = Number(priceBN)
    showDebug && console.debug('price', price)

    // console.debug('price before divide', price)
    // console.debug(`token0Decimals: ${token0Decimals}`)
    // console.debug(`token1Decimals: ${token1Decimals}`)
    // const tokenDecimalsDifferenceAbs =
    //   token0Decimals != token1Decimals
    //     ? Math.abs(token0Decimals - token1Decimals)
    //     : // : token0Decimals + token1Decimals
    //       // 0
    //       token0Decimals + token1Decimals
    // console.debug(
    //   'token0Decimals + token1Decimals',
    //   token0Decimals + token1Decimals,
    // )
    // console.debug('tokenDecimalsDifferenceAbs', tokenDecimalsDifferenceAbs)
    // const priceDivider = 10 ** (token1Decimals - token0Decimals)
    // const priceDivider = 10 ** (token0Decimals + token1Decimals)
    // const priceDivider =
    //   // token0Decimals != token1Decimals ? 10 ** tokenDecimalsDifferenceAbs : 1
    //   10 ** tokenDecimalsDifferenceAbs
    // showDebug && console.debug('price divider', priceDivider)

    // const priceDivider = 10 ** (token0Decimals + token1Decimals)
    const priceDivider = 10 ** reserveDenominatorDecimalsDivider

    price = price / priceDivider
    // price = price / 10 ** (token0Decimals - token1Decimals)
    showDebug && console.debug('price after divide', price)
    // const price10BN =
    //   ((reserve1 * BigInt(10 ** 18)) / reserve0) * BigInt(10 ** 6)
    // showDebug && console.debug('price10BN', price10BN)
    // showDebug && console.debug('price10 Number', Number(price10BN) / 10 ** 12)

    // // Check if REG is the first token in the pair
    // /* const */ let price = isAddressLowererThan(
    //   REG_ContractAddress,
    //   USDConXdai_ContractAddress,
    // )
    //   ? reserve1 / reserve0
    //   : reserve0 / reserve1
    // // TODO: Check decimals
    // showDebug && console.debug('price', price)
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
  showDebug = false,
): Promise<number | null> => {
  let price: number | null = null
  try {
    // showDebug && console.debug('=======================')
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
    // showDebug &&
    //   console.debug(
    //     `factoryAddress ${factoryAddress} pairAddress ${pairAddress} : reserves ${reserves}`,
    //   )
    const [reserve0, reserve1] = reserves
    // showDebug &&
    //   console.debug(
    //     `factoryAddress ${factoryAddress} pairAddress ${pairAddress} : ${reserve0}`,
    //   )
    // showDebug &&
    //   console.debug(
    //     `factoryAddress ${factoryAddress} pairAddress ${pairAddress} : ${reserve1}`,
    //   )
    price = getUniV2AssetPriceFromReserves(
      reserve0,
      reserve1,
      token0Address,
      token1Address,
      token0Decimals,
      token1Decimals,
      whichAssetPrice,
      showDebug,
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
          // console.log(`value ${value} sum ${sum} count ${count}`)
          sum += value
          count++
          // console.log(`value ${value} sum ${sum} count ${count}`)
        }
      })
      // console.log(`sum ${sum} count ${count}`)
      average = sum / count
      // console.log(`average ${average}`)
    }
  } catch (error) {
    console.warn('Failed to get average values', error)
  }
  return average
}

export { getUniV2AssetPrice, averageValues }
