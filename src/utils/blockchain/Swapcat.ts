import { ethers } from 'ethers'

import { SwapcatABI } from './abi/SwapcatABI'

const SwapcatAddress = '0xb18713ac02fc2090c0447e539524a5c76f327a3b'
const SwapcatInterface = new ethers.Interface(SwapcatABI)

export const Swapcat = {
  address: SwapcatAddress,
  interface: SwapcatInterface,
}
