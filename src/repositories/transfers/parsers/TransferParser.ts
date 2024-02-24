import _compact from 'lodash/compact'

import { TransferEvent } from 'src/repositories/subgraphs/queries/transfers.queries'
import { RealToken } from 'src/types/RealToken'
import { findRealToken } from 'src/utils/realtoken/findRealToken'
import { findRealTokenPrice } from 'src/utils/realtoken/findRealTokenPrice'

import { RealTokenTransfer, TransferOrigin } from '../transfers.type'

export class TransferParser {
  protected defaultOrigin = TransferOrigin.other

  constructor(protected readonly realtokenList: RealToken[]) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canHandleTransferEvent(transfer: TransferEvent): boolean {
    return false
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canHandleRealtokenTransfer(transfer: RealTokenTransfer): boolean {
    return false
  }

  async handleTransferEvents(transfers: TransferEvent[]) {
    const parsedTransfers = await this.parseTransferEvents(transfers)

    const unparsedTransfers = this.getUnparsedTransfers(
      transfers,
      parsedTransfers,
    )

    return [...parsedTransfers, ...unparsedTransfers]
  }

  async handleRealtokenTransfers(transfers: RealTokenTransfer[]) {
    const parsedTransfers = await this.parseRealtokenTransfers(transfers)
    const parsedTransfersId = parsedTransfers.map((item) => item.id)

    const unparsedTransfers = transfers.filter(
      (item) => !parsedTransfersId.includes(item.id),
    )

    return [...parsedTransfers, ...unparsedTransfers]
  }

  protected async parseTransferEvents(
    transfers: TransferEvent[],
  ): Promise<RealTokenTransfer[]> {
    const parsedTransfers = await Promise.all(
      transfers.map((item) => this.parseTransferEvent(item)),
    )
    return _compact(parsedTransfers.flat())
  }

  protected async parseTransferEvent(
    transfer: TransferEvent,
  ): Promise<RealTokenTransfer | RealTokenTransfer[]> {
    const realtoken = findRealToken(
      transfer.token.id,
      this.realtokenList,
      transfer.chainId,
    )!
    return {
      id: transfer.id,
      chainId: transfer.chainId,
      realtoken: realtoken.uuid,
      from: transfer.source,
      to: transfer.destination,
      timestamp: Number(transfer.timestamp),
      amount: Number(transfer.amount),
      origin: TransferOrigin.other,
    }
  }

  protected async parseRealtokenTransfers(
    transfers: RealTokenTransfer[],
  ): Promise<RealTokenTransfer[]> {
    const parsedTransfers = await Promise.all(
      transfers.map((item) => this.parseRealtokenTransfer(item)),
    )
    return _compact(parsedTransfers.flat())
  }

  protected async parseRealtokenTransfer(
    transfer: RealTokenTransfer,
  ): Promise<RealTokenTransfer | RealTokenTransfer[]> {
    return Promise.resolve(transfer)
  }

  protected getUnparsedTransfers(
    transfers: TransferEvent[],
    parsedTransfers: RealTokenTransfer[],
  ): RealTokenTransfer[] {
    const transferIds = parsedTransfers.map((item) => item.id)

    const unparsedTransfers = transfers.filter(
      (item) => !transferIds.includes(item.id),
    )

    return unparsedTransfers.map((item) => {
      const realtoken = findRealToken(
        item.token.id,
        this.realtokenList,
        item.chainId,
      )!
      return {
        id: item.id,
        chainId: item.chainId,
        realtoken: realtoken.uuid,
        from: item.source,
        to: item.destination,
        timestamp: Number(item.timestamp),
        amount: Number(item.amount),
        origin: this.defaultOrigin,
        isPartial: true,
      }
    })
  }

  protected getRealTokenPrice(id: string, timestamp: number, chainId?: number) {
    return findRealTokenPrice(
      findRealToken(id, this.realtokenList, chainId)!,
      timestamp,
    )
  }
}
