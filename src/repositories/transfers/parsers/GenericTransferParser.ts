import { TransferEvent } from 'src/repositories/subgraphs/queries/transfers.queries'
import { RealToken } from 'src/types/RealToken'
import { findRealToken } from 'src/utils/realtoken/findRealToken'

import { RealTokenTransfer, TransferOrigin } from '../transfers.type'
import { TransferParser } from './TransferParser'

export class GenericTransferParser extends TransferParser {
  canHandleTransferEvent(): boolean {
    return true
  }

  protected parseTransferEvent(
    transfer: TransferEvent,
  ): Promise<RealTokenTransfer> {
    const realtoken = findRealToken(transfer.token.id, this.realtokenList)!

    return Promise.resolve({
      id: transfer.id,
      realtoken: realtoken.uuid,
      from: transfer.source,
      to: transfer.destination,
      timestamp: Number(transfer.timestamp),
      amount: Number(transfer.amount),
      origin: this.getTransferOrigin(transfer, realtoken),
    })
  }

  private getTransferOrigin(item: TransferEvent, realtoken: RealToken) {
    const addresses = [item.source, item.destination]
    const { distributor, rmmPoolAddress } =
      realtoken.blockchainAddresses.xDai ?? {}

    if (addresses.includes((distributor || '').toLowerCase())) {
      return Number(item.amount) % 1 === 0
        ? TransferOrigin.primary
        : TransferOrigin.reinvest
    }

    if (addresses.includes((rmmPoolAddress || '').toLowerCase())) {
      return TransferOrigin.rmm
    }

    return TransferOrigin.other
  }
}
