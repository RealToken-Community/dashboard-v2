import { ethers } from 'ethers'

import { getTransactionReceipt } from 'src/repositories/RpcProvider'
import { TransferEvent } from 'src/repositories/subgraphs/queries/transfers.queries'
import { RealToken } from 'src/types/RealToken'
import { ERC20 } from 'src/utils/blockchain/ERC20'
import { Stablecoin } from 'src/utils/blockchain/Stablecoin'
import { findRealToken } from 'src/utils/realtoken/findRealToken'

import { RealTokenTransfer, TransferOrigin } from '../transfers.type'
import { TransferParser } from './TransferParser'

export class GenericTransferParser extends TransferParser {
  canHandleTransferEvent(): boolean {
    return true
  }

  protected async parseTransferEvent(
    transfer: TransferEvent,
  ): Promise<RealTokenTransfer> {
    const realtoken = findRealToken(
      transfer.token.id,
      this.realtokenList,
      transfer.chainId,
    )!

    const origin = this.getTransferOrigin(transfer, realtoken)

    const tokenTransfer: RealTokenTransfer = {
      id: transfer.id,
      chainId: transfer.chainId,
      realtoken: realtoken.uuid,
      from: transfer.source,
      to: transfer.destination,
      timestamp: Number(transfer.timestamp),
      amount: Number(transfer.amount),
      origin,
    }

    if (origin === TransferOrigin.other) {
      const exchangedPrice =
        await this.tryFindTransferCounterpartPrice(transfer)
      if (exchangedPrice) {
        tokenTransfer.exchangedPrice = exchangedPrice
      }
    }

    return tokenTransfer
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
      return distributors.includes(item.destination.toLowerCase())
        ? TransferOrigin.primary
        : Number(item.amount) % 1 === 0
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

  private async tryFindTransferCounterpartPrice(transfer: TransferEvent) {
    const transfers = await this.getTransfersFromTx(
      transfer.transaction.id,
      transfer.chainId,
    )

    const realtokenContractList = this.realtokenList.map((item) =>
      transfer.chainId === 1
        ? item.ethereumContract?.toLowerCase()
        : item.xDaiContract?.toLowerCase(),
    )
    const realtokenTransfers = transfers.filter((item) =>
      realtokenContractList.includes(item.address),
    )
    const stablecoinTransfer = transfers.find((item) =>
      Stablecoin.isStable(item.address),
    )

    // Exchange between a realtoken and a stablecoin
    if (realtokenTransfers.length === 1 && stablecoinTransfer) {
      const amount = Number(ethers.formatEther(realtokenTransfers[0].value))

      return (
        Stablecoin.parseValue(
          stablecoinTransfer.address,
          stablecoinTransfer.value,
        ) / amount
      )
    }

    // Exchange between two realtokens
    if (realtokenTransfers.length === 2) {
      const amount = +transfer.amount

      const other = realtokenTransfers.find(
        (item) => item.address !== transfer.token.id,
      )!
      const otherPrice = this.getRealTokenPrice(
        other.address,
        +transfer.timestamp,
        transfer.chainId,
      )
      const otherAmount = Number(ethers.formatEther(other.value))
      const otherValue = otherAmount * otherPrice
      return otherValue / amount
    }
  }

  private async getTransfersFromTx(txId: string, chainId: number) {
    try {
      const receipt = await getTransactionReceipt(txId, chainId)
      const logs = receipt?.logs ?? []

      const rawTransferEvents = logs.filter(ERC20.isTransferEvent)
      return rawTransferEvents.map(ERC20.parseTransferEvent)
    } catch (error) {
      console.error(error)
      return []
    }
  }
}
