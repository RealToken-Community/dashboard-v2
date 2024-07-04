import { ethers } from 'ethers'
import _compact from 'lodash/compact'
import _uniqBy from 'lodash/uniqBy'

import { getTransactionReceipt } from 'src/repositories/RpcProvider'
import { TransferEvent } from 'src/repositories/subgraphs/queries/transfers.queries'
import { ERC20, ERC20TransferEvent } from 'src/utils/blockchain/ERC20'
import { Levinswap } from 'src/utils/blockchain/Levinswap'
import { Stablecoin } from 'src/utils/blockchain/Stablecoin'
import { findRealToken } from 'src/utils/realtoken/findRealToken'

import { RealTokenTransfer, TransferOrigin } from '../transfers.type'
import { TransferParser } from './TransferParser'

export class LevinswapTransferParser extends TransferParser {
  protected defaultOrigin = TransferOrigin.levinSwapUnknown

  canHandleTransferEvent(transfer: TransferEvent): boolean {
    const realtoken = findRealToken(transfer.token.id, this.realtokenList)
    const levinSwapPool = realtoken?.secondaryMarketplaces.find(
      (item) => item.dexName === 'LevinSwap',
    )

    const source = transfer.source.toLowerCase()
    const destination = transfer.destination.toLowerCase()
    const poolAddress = levinSwapPool?.contractPool.toString().toLowerCase()
    return [source, destination].includes(poolAddress ?? '')
  }

  canHandleRealtokenTransfer(transfer: RealTokenTransfer): boolean {
    return [
      TransferOrigin.levinSwap,
      TransferOrigin.levinSwapPool,
      TransferOrigin.levinSwapUnknown,
    ].includes(transfer.origin)
  }

  protected async parseTransferEvents(
    transfers: TransferEvent[],
  ): Promise<RealTokenTransfer[]> {
    return this.parse(
      transfers.map((item) => ({
        id: item.transaction.id,
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
        timestamp: item.timestamp,
      })),
    )
  }

  private async parse(txList: { id: string; timestamp: number }[]) {
    return (
      await Promise.all(
        _uniqBy(txList, 'id').map((item) =>
          this.getTransfersFromTransaction(item),
        ),
      )
    ).flat()
  }

  async getTransfersFromTransaction(tx: {
    id: string
    timestamp: number
  }): Promise<RealTokenTransfer[]> {
    const { mintEvents, burnEvents, swapEvents, transferEvents } =
      await this.getLevinswapEventsFromTx(tx.id)

    return [
      ...this.getMintTransfers({
        timestamp: tx.timestamp,
        mintEvents,
        transferEvents,
      }),
      ...this.getBurnTransfers({
        timestamp: tx.timestamp,
        burnEvents,
        transferEvents,
      }),
      ...this.getSwapTransfers({
        timestamp: tx.timestamp,
        swapEvents,
        transferEvents,
      }),
    ]
  }

  async getLevinswapEventsFromTx(transactionId: string) {
    try {
      const receipt = await getTransactionReceipt(transactionId, 100)
      const logs = receipt?.logs ?? []

      return {
        mintEvents: logs
          .filter(Levinswap.isMintEvent)
          .map(Levinswap.parseMintEvent),
        burnEvents: logs
          .filter(Levinswap.isBurnEvent)
          .map(Levinswap.parseBurnEvent),
        swapEvents: logs
          .filter(Levinswap.isSwapEvent)
          .map(Levinswap.parseSwapEvent),
        transferEvents: logs
          .filter(ERC20.isTransferEvent)
          .map(ERC20.parseTransferEvent),
      }
    } catch (error) {
      console.log(error)
      return {
        mintEvents: [],
        burnEvents: [],
        swapEvents: [],
        transferEvents: [],
      }
    }
  }

  getMintTransfers(options: {
    timestamp: number
    mintEvents: ReturnType<typeof Levinswap.parseMintEvent>[]
    transferEvents: ERC20TransferEvent[]
  }): RealTokenTransfer[] {
    const { timestamp, mintEvents, transferEvents } = options
    const realtokenContractList = this.realtokenList.map((item) =>
      item.xDaiContract?.toLowerCase(),
    )

    return _compact(
      mintEvents.map((mintEvent) => {
        const userAddress = transferEvents.find(
          (event) => event.to === mintEvent.address,
        )?.from

        const tokenTransfer = transferEvents.find(
          (event) =>
            event.from === userAddress &&
            realtokenContractList.includes(event.address),
        )

        const assetTransfer = transferEvents.find(
          (event) =>
            event.from === userAddress &&
            event.address !== tokenTransfer?.address,
        )

        const poolTransfer = transferEvents.find(
          (event) => event.to === userAddress,
        )

        const realtoken =
          tokenTransfer &&
          findRealToken(tokenTransfer.address, this.realtokenList)

        if (realtoken && assetTransfer && poolTransfer) {
          return {
            id: `${tokenTransfer.txHash}-${tokenTransfer.index}`,
            chainId: 100,
            realtoken: realtoken.uuid,
            from: tokenTransfer.from,
            to: tokenTransfer.to,
            timestamp,
            origin: TransferOrigin.levinSwapPool,
            amount: Number(ethers.formatEther(tokenTransfer.value)),
            poolDetails: {
              share: Number(ethers.formatEther(poolTransfer.value)),
              token: assetTransfer.address,
              quantity: Stablecoin.parseValue(
                assetTransfer.address,
                assetTransfer.value,
              ),
            },
          }
        }
      }),
    )
  }

  getBurnTransfers(options: {
    timestamp: number
    burnEvents: ReturnType<typeof Levinswap.parseBurnEvent>[]
    transferEvents: ERC20TransferEvent[]
  }): RealTokenTransfer[] {
    const { timestamp, burnEvents, transferEvents } = options
    const realtokenContractList = this.realtokenList.map((item) =>
      item.xDaiContract?.toLowerCase(),
    )

    return _compact(
      burnEvents.map((burnEvent) => {
        const userAddress = burnEvent.to

        const tokenTransfer = transferEvents.find(
          (event) =>
            event.to === userAddress &&
            realtokenContractList.includes(event.address),
        )

        const assetTransfer = transferEvents.find(
          (event) =>
            event.to === userAddress &&
            event.address !== tokenTransfer?.address,
        )

        const poolTransfer = transferEvents.find(
          (event) => event.from === userAddress,
        )

        const realtoken =
          tokenTransfer &&
          findRealToken(tokenTransfer.address, this.realtokenList)

        if (realtoken && assetTransfer && poolTransfer) {
          return {
            id: `${tokenTransfer.txHash}-${tokenTransfer.index}`,
            chainId: 100,
            realtoken: realtoken.uuid,
            from: tokenTransfer.from,
            to: tokenTransfer.to,
            timestamp,
            origin: TransferOrigin.levinSwapPool,
            amount: Number(ethers.formatEther(tokenTransfer.value)),
            poolDetails: {
              share: Number(ethers.formatEther(poolTransfer.value)),
              token: assetTransfer.address,
              quantity: Stablecoin.parseValue(
                assetTransfer.address,
                assetTransfer.value,
              ),
            },
          }
        }
      }),
    )
  }

  getSwapTransfers(options: {
    timestamp: number
    swapEvents: ReturnType<typeof Levinswap.parseSwapEvent>[]
    transferEvents: ERC20TransferEvent[]
  }): RealTokenTransfer[] {
    const { timestamp, swapEvents, transferEvents } = options

    return _compact(
      swapEvents.map((swapEvent) => {
        const [transfer0, transfer1] = transferEvents.filter((event) => {
          const amountIn = swapEvent.amount0In || swapEvent.amount1In
          const amountOut = swapEvent.amount0Out || swapEvent.amount1Out
          const isTo = event.to === swapEvent.address
          const isFrom = event.from === swapEvent.address
          return (
            (isTo && event.value == amountIn) ||
            (isFrom && event.value == amountOut)
          )
        })

        const realtoken0 =
          transfer0 && findRealToken(transfer0.address, this.realtokenList)
        const realtoken1 =
          transfer1 && findRealToken(transfer1.address, this.realtokenList)
        const realtoken = realtoken0 || realtoken1

        if (realtoken) {
          const realtokenTransfer = realtoken0 ? transfer0 : transfer1
          const collateralAddress = realtoken0
            ? transfer1.address
            : transfer0.address
          const collateralAmount = realtoken0
            ? transfer1.value
            : transfer0.value

          return {
            id: `${realtokenTransfer.txHash}-${realtokenTransfer.index}`,
            chainId: 100,
            realtoken: realtoken.uuid,
            from: realtokenTransfer.from,
            to: realtokenTransfer.to,
            timestamp,
            origin: TransferOrigin.levinSwap,
            amount: Number(ethers.formatEther(realtokenTransfer.value)),
            exchangedPrice: Stablecoin.isStable(collateralAddress)
              ? Stablecoin.parseValue(collateralAddress, collateralAmount)
              : undefined,
          }
        }
      }),
    )
  }
}
