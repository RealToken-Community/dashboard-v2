import { RealToken } from 'src/types/RealToken'

import { getRealTokenTransfers } from './subgraphs/queries/transfers.queries'
import { UserTransferParser } from './transfers/UserTransferParser'
import { UserRealTokenTransfer } from './transfers/transfers.type'

export const TransferRepository = {
  async getTransfers(params: {
    userAddressList: string[]
    realtokenList: RealToken[]
    fromTimestamp: number
    filters?: {
      userAddressList?: string[]
    }
  }): Promise<UserRealTokenTransfer[]> {
    const userAddressList =
      params.filters?.userAddressList ?? params.userAddressList

    const parser = new UserTransferParser(
      params.realtokenList,
      params.userAddressList,
    )

    const transferEvents = await getRealTokenTransfers({
      addressList: userAddressList,
      timestamp: params.fromTimestamp,
    })

    return parser.handle({
      transfers: transferEvents,
      userAddressList,
    })
  },
}
