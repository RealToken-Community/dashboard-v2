import { ethers } from 'ethers'

import { ERC20ABI } from './abi/ERC20ABI'

const ERC20Interface = new ethers.Interface(ERC20ABI)

export interface ERC20TransferEvent {
  txHash: string
  txIndex: number
  index: number
  address: string
  from: string
  to: string
  value: bigint
}

function isTransferEvent(log: ethers.Log) {
  try {
    const decodedLog = ERC20Interface.parseLog(log)
    return decodedLog?.name === 'Transfer'
  } catch (error) {
    return false
  }
}

function parseTransferEvent(log: ethers.Log): ERC20TransferEvent {
  const decodedLog = ERC20Interface.parseLog(log)
  if (!decodedLog) {
    throw new Error('Invalid log')
  }
  return {
    txHash: log.transactionHash,
    txIndex: log.transactionIndex,
    index: log.index,
    address: log.address.toLowerCase(),
    from: decodedLog.args.from.toLowerCase() as string,
    to: decodedLog.args.to.toLowerCase() as string,
    value: decodedLog.args.value as bigint,
  }
}

export const ERC20 = {
  interface: ERC20Interface,
  isTransferEvent,
  parseTransferEvent,
}
