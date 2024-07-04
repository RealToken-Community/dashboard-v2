import { ethers } from 'ethers'

import { getTransactionReceipt } from 'src/repositories/RpcProvider'
import { TransferEvent } from 'src/repositories/subgraphs/queries/transfers.queries'
import { ERC20, ERC20TransferEvent } from 'src/utils/blockchain/ERC20'
import { Stablecoin } from 'src/utils/blockchain/Stablecoin'
import { Swapcat } from 'src/utils/blockchain/Swapcat'
import { findRealToken } from 'src/utils/realtoken/findRealToken'

import { RealTokenTransfer, TransferOrigin } from '../transfers.type'
import { TransferParser } from './TransferParser'

export class SwapcatTransferParser extends TransferParser {
  protected defaultOrigin = TransferOrigin.swapcat

  canHandleTransferEvent(transfer: TransferEvent): boolean {
    return transfer.transaction.to === Swapcat.address.toLowerCase()
  }

  canHandleRealtokenTransfer(transfer: RealTokenTransfer): boolean {
    return transfer.origin === TransferOrigin.swapcat
  }

  protected parseTransferEvent(
    transfer: TransferEvent,
  ): Promise<RealTokenTransfer | RealTokenTransfer[]> {
    return this.parse(
      transfer.transaction.id,
      transfer.chainId,
      parseInt(transfer.timestamp),
    )
  }

  protected parseRealtokenTransfer(
    transfer: RealTokenTransfer,
  ): Promise<RealTokenTransfer[]> {
    return this.parse(
      transfer.id.split('-')[0],
      transfer.chainId,
      transfer.timestamp,
    )
  }

  private async parse(
    txId: string,
    chainId: number,
    timestamp: number,
  ): Promise<RealTokenTransfer[]> {
    const transfers = await this.getTransfersFromTx(txId, chainId)

    const realtokenContractList = this.realtokenList.map((item) =>
      item.xDaiContract?.toLowerCase(),
    )
    const realtokenTransfers = transfers.filter((item) =>
      realtokenContractList.includes(item.address),
    )
    const stablecoinTransfer = transfers.find((item) =>
      Stablecoin.isStable(item.address),
    )

    // Exchange between a realtoken and a stablecoin
    if (realtokenTransfers.length === 1 && stablecoinTransfer) {
      return this.getTransferFromStablecoin({
        chainId,
        timestamp,
        stablecoinTransfer,
        realtokenTransfer: realtokenTransfers[0],
      })
    }

    // Exchange between two realtokens
    if (realtokenTransfers.length === 2) {
      return this.getTransfersFromRealtoken({
        chainId,
        timestamp,
        realtokenTransfers,
      })
    }

    return []
  }

  private async getTransfersFromTx(transactionId: string, chainId: number) {
    try {
      const receipt = await getTransactionReceipt(transactionId, chainId)
      const logs = receipt?.logs ?? []

      const rawTransferEvents = logs.filter(ERC20.isTransferEvent)
      return rawTransferEvents.map(ERC20.parseTransferEvent)
    } catch (error) {
      console.error(error)
      return []
    }
  }

  private getTransferFromStablecoin(options: {
    chainId: number
    timestamp: number
    stablecoinTransfer: ERC20TransferEvent
    realtokenTransfer: ERC20TransferEvent
  }) {
    const { timestamp, stablecoinTransfer, realtokenTransfer } = options
    const amount = Number(ethers.formatEther(realtokenTransfer.value))

    return [
      {
        id: `${realtokenTransfer.txHash}-${realtokenTransfer.index}`,
        chainId: options.chainId,
        realtoken:
          findRealToken(realtokenTransfer.address, this.realtokenList)?.uuid ??
          '',
        from: realtokenTransfer.from,
        to: realtokenTransfer.to,
        timestamp,
        origin: TransferOrigin.swapcat,
        amount,
        exchangedPrice:
          Stablecoin.parseValue(
            stablecoinTransfer.address,
            stablecoinTransfer.value,
          ) / amount,
      },
    ]
  }

  private getTransfersFromRealtoken(options: {
    chainId: number
    timestamp: number
    realtokenTransfers: ERC20TransferEvent[]
  }) {
    const { timestamp, realtokenTransfers } = options
    return realtokenTransfers.map((item, index) => {
      const amount = Number(ethers.formatEther(item.value))

      const other = realtokenTransfers[index === 0 ? 1 : 0]
      const otherPrice = this.getRealTokenPrice(other.address, timestamp)
      const otherAmount = Number(ethers.formatEther(other.value))
      const otherValue = otherAmount * otherPrice

      return {
        id: `${item.txHash}-${item.index}`,
        chainId: options.chainId,
        realtoken: findRealToken(item.address, this.realtokenList)?.uuid ?? '',
        from: item.from,
        to: item.to,
        timestamp,
        origin: TransferOrigin.swapcat,
        amount,
        exchangedPrice: otherValue / amount,
      }
    })
  }
}
