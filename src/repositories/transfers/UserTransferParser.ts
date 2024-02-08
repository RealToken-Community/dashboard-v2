import { TransferEvent } from 'src/repositories/subgraphs/queries/transfers.queries'
import { RealToken } from 'src/types/RealToken'
import {
  SwapcatTransferParser,
  LevinswapTransferParser,
  GenericTransferParser,
  YamTransferParser,
  TransferParser,
} from './parsers'
import {
  RealTokenTransfer,
  TransferOrigin,
  UserRealTokenTransfer,
  UserTransferDirection,
} from './transfers.type'
import { findRealTokenPrice } from 'src/utils/realtoken/findRealTokenPrice'
import { findRealToken } from 'src/utils/realtoken/findRealToken'
import { TransferDatabaseService } from './TransferDatabase'

export class UserTransferParser {
  private readonly parserList: TransferParser[] = []
  private readonly allUserAddressList: string[]

  constructor(
    private readonly realtokenList: RealToken[],
    allUserAddressList: string[],
  ) {
    this.parserList.push(
      new YamTransferParser(realtokenList),
      new SwapcatTransferParser(realtokenList),
      new LevinswapTransferParser(realtokenList),
      new GenericTransferParser(realtokenList),
    )

    this.allUserAddressList = allUserAddressList.map((item) =>
      item.toLowerCase(),
    )
  }

  async handle(options: {
    transfers: TransferEvent[]
    userAddressList: string[]
  }) {
    const { cachedTransfers, uncachedTransfers, partiallyCachedTransfers } =
      await this.getChachedTransfers(options)

    const realtokenTransfers = (
      await Promise.all([
        this.handleTransferEvents(uncachedTransfers),
        this.handlePartialTransfers(partiallyCachedTransfers),
      ])
    ).flat()

    // Save parsed RealTokenTransfers only (in background)
    if (realtokenTransfers.length > 0) {
      void TransferDatabaseService.putTransfersGnosis(realtokenTransfers).catch(
        console.error,
      )
    }

    const transfers = [...realtokenTransfers, ...cachedTransfers]

    return this.parseTransfersForUser({
      transfers,
      userAddressList: options.userAddressList,
    })
  }

  private async getChachedTransfers(options: {
    transfers: TransferEvent[]
    userAddressList: string[]
    realtokenList?: RealToken[]
  }) {
    const allCachedTransfers = await TransferDatabaseService.getTransfersGnosis(
      {
        userAddressList: options.userAddressList,
        realtokenList: options.realtokenList?.map((item) => item.uuid),
      },
    )

    const allCachedTransfersIds = allCachedTransfers.map((item) => item.id)
    const cachedTransfers = allCachedTransfers.filter((item) => !item.isPartial)
    const partiallyCachedTransfers = allCachedTransfers.filter(
      (item) => item.isPartial,
    )

    const uncachedTransfers = options.transfers.filter(
      (item) => !allCachedTransfersIds.includes(item.id),
    )

    return {
      cachedTransfers,
      uncachedTransfers,
      partiallyCachedTransfers,
    }
  }

  private async handleTransferEvents(transferEvents: TransferEvent[]) {
    // Group TransferEvents by parser
    const parserMap = new Map<TransferParser, TransferEvent[]>()
    transferEvents.forEach((transfer) => {
      const parser = this.parserList.find((item) =>
        item.canHandleTransferEvent(transfer),
      )!
      const transferList = parserMap.get(parser) ?? []
      transferList.push(transfer)
      parserMap.set(parser, transferList)
    })

    // Parse TransferEvents into RealTokenTransfers
    return (
      await Promise.all(
        Array.from(parserMap.entries()).map(([parser, transfers]) =>
          parser.handleTransferEvents(transfers),
        ),
      )
    ).flat()
  }

  private async handlePartialTransfers(partialTransfers: RealTokenTransfer[]) {
    // Group TransferEvents by parser
    const parserMap = new Map<TransferParser, RealTokenTransfer[]>()
    partialTransfers.forEach((transfer) => {
      const parser = this.parserList.find((item) => {
        return item.canHandleRealtokenTransfer(transfer)
      })
      if (parser) {
        const transferList = parserMap.get(parser) ?? []
        transferList.push(transfer)
        parserMap.set(parser, transferList)
      }
    })

    // Parse TransferEvents into RealTokenTransfers
    return (
      await Promise.all(
        Array.from(parserMap.entries()).map(([parser, transfers]) =>
          parser.handleRealtokenTransfers(transfers),
        ),
      )
    ).flat()
  }

  private parseTransfersForUser(options: {
    transfers: RealTokenTransfer[]
    userAddressList: string[]
  }): UserRealTokenTransfer[] {
    const userAddressList = options.userAddressList.map((item) =>
      item.toLowerCase(),
    )

    const isUserRelated = (transfer: RealTokenTransfer) =>
      userAddressList.includes(transfer.from.toLowerCase()) ||
      userAddressList.includes(transfer.to.toLowerCase())

    return options.transfers
      .filter(isUserRelated)
      .sort((a, b) => b.timestamp - a.timestamp) // By most recent
      .map((item) => ({
        ...item,
        direction: this.getTransferDirection(item),
        price: this.getRealTokenPrice(item.realtoken, item.timestamp),
      }))
  }

  private getTransferDirection(transfer: RealTokenTransfer) {
    const from = transfer.from.toLowerCase()
    const to = transfer.to.toLowerCase()
    const isFromUser = this.allUserAddressList.includes(from)
    const isToUser = this.allUserAddressList.includes(to)

    return isFromUser && isToUser
      ? UserTransferDirection.internal
      : isFromUser
        ? UserTransferDirection.out
        : UserTransferDirection.in
  }

  private getRealTokenPrice(id: string, timestamp: number) {
    return findRealTokenPrice(findRealToken(id, this.realtokenList)!, timestamp)
  }
}
