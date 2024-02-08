import { ethers } from 'ethers'

export const UsdcAddress =
  '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83'.toLowerCase()
export const WxdaiAddress =
  '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d'.toLowerCase()

function isStable(token: string) {
  return [UsdcAddress, WxdaiAddress].includes(token.toLowerCase())
}

function parseValue(token: string, value: bigint) {
  return token.toLowerCase() === UsdcAddress
    ? Number(ethers.formatUnits(value, 6))
    : Number(ethers.formatEther(value))
}

export const Stablecoin = {
  isStable,
  parseValue,
}
