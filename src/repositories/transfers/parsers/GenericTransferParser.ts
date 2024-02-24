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
    const realtoken = findRealToken(
      transfer.token.id,
      this.realtokenList,
      transfer.chainId,
    )!

    return Promise.resolve({
      id: transfer.id,
      chainId: transfer.chainId,
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
    const { distributor: ethereumDistributor } =
      realtoken.blockchainAddresses.ethereum ?? {}
    const { distributor: gnosisDistributor, rmmPoolAddress } =
      realtoken.blockchainAddresses.xDai ?? {}
    const distributors = [
      (ethereumDistributor || '').toLowerCase(),
      (gnosisDistributor || '').toLowerCase(),
    ]

    if (
      addresses.some((address) => distributors.includes(address.toLowerCase()))
    ) {
      return Number(item.amount) % 1 === 0
        ? TransferOrigin.primary
        : TransferOrigin.reinvest
    }

    if (addresses.includes((rmmPoolAddress || '').toLowerCase())) {
      return TransferOrigin.rmm
    }

    const RMMV3 = '0x10497611ee6524d75fc45e3739f472f83e282ad5'
    if (addresses.includes(RMMV3)) {
      return TransferOrigin.rmm
    }

    if (parseInt(item.source, 16) === 0) {
      return TransferOrigin.mint
    }

    if (parseInt(item.destination, 16) === 0) {
      return TransferOrigin.burn
    }

    return TransferOrigin.other
  }
}
