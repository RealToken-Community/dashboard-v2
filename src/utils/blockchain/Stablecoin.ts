import { ethers } from 'ethers'

export const UsdcAddress =
  '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83'.toLowerCase()
export const WxdaiAddress =
  '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d'.toLowerCase()
export const ArmmWXDAI =
  '0x7349c9eaa538e118725a6130e0f8341509b9f8a0'.toLowerCase()
export const Armmv3WXDAI =
  '0x0ca4f5554dd9da6217d62d8df2816c82bba4157b'.toLowerCase()
export const Armmv3USDC =
  '0xed56f76e9cbc6a64b821e9c016eafbd3db5436d1'.toLowerCase()
export const USDCEthereumAddress =
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'.toLowerCase()

const STABLECOINS = [
  UsdcAddress,
  WxdaiAddress,
  ArmmWXDAI,
  Armmv3WXDAI,
  Armmv3USDC,
  USDCEthereumAddress,
]

function isStable(token: string) {
  return STABLECOINS.includes(token.toLowerCase())
}

const STABLE_6_DECIMALS = [UsdcAddress, Armmv3USDC, USDCEthereumAddress]

function parseValue(token: string, value: bigint) {
  return STABLE_6_DECIMALS.includes(token.toLowerCase())
    ? Number(ethers.formatUnits(value, 6))
    : Number(ethers.formatEther(value))
}

export const Stablecoin = {
  isStable,
  parseValue,
}
