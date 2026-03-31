import { ethers } from 'ethers'

import { LevinswapABI } from './abi/LevinswapABI'

const LevinswapInterface = new ethers.Interface(LevinswapABI)

function getContract(address: string, provider: ethers.Provider) {
  return new ethers.Contract(address, LevinswapInterface, provider)
}

function isEventName(log: ethers.Log, name: string) {
  try {
    const decodedLog = LevinswapInterface.parseLog(log)
    return decodedLog?.name === name
  } catch (error) {
    return false
  }
}

function parseSwapEvent(log: ethers.Log) {
  const decodedLog = LevinswapInterface.parseLog(log)

  if (!decodedLog) {
    throw new Error('Invalid log')
  }

  return {
    txHash: log.transactionHash,
    txIndex: log.transactionIndex,
    index: log.index,
    address: log.address.toLowerCase(),
    sender: decodedLog.args.sender.toLowerCase() as string,
    amount0In: decodedLog.args.amount0In as bigint,
    amount1In: decodedLog.args.amount1In as bigint,
    amount0Out: decodedLog.args.amount0Out as bigint,
    amount1Out: decodedLog.args.amount1Out as bigint,
    to: decodedLog.args.to.toLowerCase() as string,
  }
}

function parseMintEvent(log: ethers.Log) {
  const decodedLog = LevinswapInterface.parseLog(log)

  if (!decodedLog) {
    throw new Error('Invalid log')
  }

  return {
    txHash: log.transactionHash,
    txIndex: log.transactionIndex,
    index: log.index,
    address: log.address.toLowerCase(),
    sender: decodedLog.args.sender.toLowerCase() as string,
    amount0: decodedLog.args.amount0 as bigint,
    amount1: decodedLog.args.amount1 as bigint,
  }
}

function parseBurnEvent(log: ethers.Log) {
  const decodedLog = LevinswapInterface.parseLog(log)

  if (!decodedLog) {
    throw new Error('Invalid log')
  }

  return {
    txHash: log.transactionHash,
    txIndex: log.transactionIndex,
    index: log.index,
    address: log.address.toLowerCase(),
    sender: decodedLog.args.sender.toLowerCase() as string,
    amount0: decodedLog.args.amount0 as bigint,
    amount1: decodedLog.args.amount1 as bigint,
    to: decodedLog.args.to.toLowerCase() as string,
  }
}

export const Levinswap = {
  getContract,
  isSwapEvent: (log: ethers.Log) => isEventName(log, 'Swap'),
  isMintEvent: (log: ethers.Log) => isEventName(log, 'Mint'),
  isBurnEvent: (log: ethers.Log) => isEventName(log, 'Burn'),
  parseSwapEvent,
  parseMintEvent,
  parseBurnEvent,
}
