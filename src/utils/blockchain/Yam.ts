import { ethers } from 'ethers'

import { YamABI } from './abi/YamABI'

const YamAddress = '0xc759aa7f9dd9720a1502c104dae4f9852bb17c14'
const YamInterface = new ethers.Interface(YamABI)

function getContract(provider: ethers.Provider) {
  return new ethers.Contract(YamAddress, YamInterface, provider)
}

function isOfferAcceptedEvent(log: ethers.Log) {
  try {
    const decodedLog = YamInterface.parseLog(log)
    return decodedLog?.name === 'OfferAccepted'
  } catch (error) {
    return false
  }
}

export interface YamOfferAcceptedEvent {
  txHash: string
  txIndex: number
  index: number
  offerId: string
  buyer: string
  seller: string
  price: bigint
  amount: bigint
  offerToken: string
  buyerToken: string
}

function parseOfferAcceptedEvent(log: ethers.Log): YamOfferAcceptedEvent {
  const decodedLog = YamInterface.parseLog(log)

  if (!decodedLog) {
    throw new Error('Invalid log')
  }

  return {
    txHash: log.transactionHash,
    txIndex: log.transactionIndex,
    index: log.index,
    offerId: decodedLog.args.offerId as string,
    buyer: decodedLog.args.buyer as string,
    seller: decodedLog.args.seller as string,
    price: decodedLog.args.price as bigint,
    amount: decodedLog.args.amount as bigint,
    offerToken: decodedLog.args.offerToken as string,
    buyerToken: decodedLog.args.buyerToken as string,
  }
}

export const Yam = {
  address: YamAddress,
  interface: YamInterface,
  getContract,
  isOfferAcceptedEvent,
  parseOfferAcceptedEvent,
}
