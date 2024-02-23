import { ethers } from 'ethers'
import _compact from 'lodash/compact'
import _uniqBy from 'lodash/uniqBy'

import { getTransactionReceipt } from 'src/repositories/RpcProvider'
import { TransferEvent } from 'src/repositories/subgraphs/queries/transfers.queries'
import { ERC20, ERC20TransferEvent } from 'src/utils/blockchain/ERC20'
import { Stablecoin } from 'src/utils/blockchain/Stablecoin'
import { Yam } from 'src/utils/blockchain/Yam'
import { findRealToken } from 'src/utils/realtoken/findRealToken'

import { RealTokenTransfer, TransferOrigin } from '../transfers.type'
import { TransferParser } from './TransferParser'

export class YamTransferParser extends TransferParser {
  protected defaultOrigin = TransferOrigin.yam

  canHandleTransferEvent(transfer: TransferEvent): boolean {
    return transfer.transaction.to === Yam.address.toLowerCase()
  }

  canHandleRealtokenTransfer(transfer: RealTokenTransfer): boolean {
    return transfer.origin === TransferOrigin.yam
  }

  protected async parseTransferEvents(
    transfers: TransferEvent[],
  ): Promise<RealTokenTransfer[]> {
    return this.parse(
      transfers.map((item) => ({
        id: item.transaction.id,
        chainId: item.chainId,
        timestamp: parseInt(item.timestamp),
      })),
    )
  }

  protected async parseRealtokenTransfers(
    transfers: RealTokenTransfer[],
  ): Promise<RealTokenTransfer[]> {
    return this.parse(
      transfers.map((item) => ({
        id: item.id.split('-')[0],
        chainId: item.chainId,
        timestamp: item.timestamp,
      })),
    )
  }

  private async parse(
    txList: { id: string; chainId: number; timestamp: number }[],
  ) {
    return (
      await Promise.all(
        _uniqBy(txList, (item) => `${item.chainId}_${item.id}`).map((item) =>
          this.getTransfersFromTransaction(item),
        ),
      )
    ).flat()
  }

  private async getTransfersFromTransaction(tx: {
    id: string
    chainId: number
    timestamp: number
  }) {
    const acceptedEvents = await this.getOfferAcceptedFromTx(tx.id, tx.chainId)

    const realtokenContractList = this.realtokenList.map((item) =>
      item.xDaiContract?.toLowerCase(),
    )

    const transactionList = acceptedEvents.map(({ transfers }) => {
      const realtokenTransfers = transfers.filter((item) =>
        realtokenContractList.includes(item.address),
      )
      const stablecoinTransfer = transfers.find((item) =>
        Stablecoin.isStable(item.address),
      )

      // Exchange between a realtoken and a stablecoin
      if (realtokenTransfers.length === 1 && stablecoinTransfer) {
        return this.getTransferFromStablecoin({
          timestamp: tx.timestamp,
          stablecoinTransfer,
          realtokenTransfer: realtokenTransfers[0],
        })
      }

      // Exchange between two realtokens
      if (realtokenTransfers.length === 2) {
        return this.getTransferFromRealtoken({
          timestamp: tx.timestamp,
          realtokenTransfers,
        })
      }
    })

    return _compact(transactionList.flat())
  }

  private async getOfferAcceptedFromTx(txId: string, chainId: number) {
    try {
      const receipt = await getTransactionReceipt(txId, chainId)
      const logs = receipt?.logs ?? []
      const rawAcceptedEvents = logs.filter(Yam.isOfferAcceptedEvent)
      const rawTransferEvents = logs.filter(ERC20.isTransferEvent)

      const acceptedEvents = rawAcceptedEvents.map(Yam.parseOfferAcceptedEvent)
      const transferEvents = rawTransferEvents
        .map(ERC20.parseTransferEvent)
        .sort((a, b) => a.index - b.index)

      return acceptedEvents.map((item) => {
        // Find the two previous transfers closest to this offer
        const transfers = transferEvents
          .filter((transfer) => transfer.index < item.index)
          .slice(-2)

        return { ...item, transfers }
      })
    } catch (error) {
      console.log(error)
      return []
    }
  }

  private getTransferFromStablecoin(options: {
    timestamp: number
    stablecoinTransfer: ERC20TransferEvent
    realtokenTransfer: ERC20TransferEvent
  }) {
    const { timestamp, stablecoinTransfer, realtokenTransfer } = options
    const amount = Number(ethers.formatEther(realtokenTransfer.value))

    return {
      id: `${realtokenTransfer.txHash}-${realtokenTransfer.index}`,
      chainId: 100,
      realtoken:
        findRealToken(realtokenTransfer.address, this.realtokenList)?.uuid ??
        '',
      from: realtokenTransfer.from,
      to: realtokenTransfer.to,
      timestamp,
      origin: TransferOrigin.yam,
      amount,
      exchangedPrice:
        Stablecoin.parseValue(
          stablecoinTransfer.address,
          stablecoinTransfer.value,
        ) / amount,
    }
  }

  private getTransferFromRealtoken(options: {
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
        chainId: 100,
        realtoken: findRealToken(item.address, this.realtokenList)?.uuid ?? '',
        from: item.from,
        to: item.to,
        timestamp,
        origin: TransferOrigin.yam,
        amount,
        exchangedPrice: otherValue / amount,
      }
    })
  }
}
