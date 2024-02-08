import Dexie, { Table } from 'dexie'

import { RealTokenTransfer } from './transfers.type'
import _minBy from 'lodash/minBy'
import _maxBy from 'lodash/maxBy'

class TransferDatabase extends Dexie {
  transfersGnosis: Table<RealTokenTransfer, string>
  transferSync: Table<{ id: string; timestamp: number }, string>

  constructor() {
    super('TransferDatabase')
    this.version(1).stores({
      transfersGnosis: 'id, realtoken, from, to',
      transferSync: 'id',
    })
    this.transfersGnosis = this.table('transfersGnosis')
    this.transferSync = this.table('transferSync')
  }
}

const db = new TransferDatabase()

async function getTransfersGnosis(filters: {
  userAddressList: string[]
  realtokenList?: string[]
}) {
  const { userAddressList, realtokenList } = filters

  const transfers = await db.transfersGnosis
    .where('from')
    .anyOf(userAddressList)
    .or('to')
    .anyOf(userAddressList)
    .toArray()

  return realtokenList
    ? transfers.filter((item) => realtokenList?.includes(item.realtoken))
    : transfers
}

async function putTransfersGnosis(transfers: RealTokenTransfer[]) {
  await db.transfersGnosis.bulkPut(transfers)
}

async function getTransferSync(addressList: string[]) {
  return db.transferSync.bulkGet(addressList)
}

async function putTransferSync(
  addressList: { id: string; timestamp: number }[],
) {
  await db.transferSync.bulkPut(addressList)
}

async function getLastSyncTimestamp(userAddressList: string[]) {
  const lastSyncList = await getTransferSync(userAddressList)
  return _minBy(lastSyncList, (item) => item?.timestamp ?? 0)?.timestamp ?? 0
}

async function saveLastSyncTimestamp(
  transfers: { timestamp?: number }[],
  userAddressList: string[],
) {
  const lastSyncTimestamp = _maxBy(transfers, 'timestamp')?.timestamp

  if (lastSyncTimestamp) {
    await putTransferSync(
      userAddressList.map((item) => ({
        id: item,
        timestamp: lastSyncTimestamp,
      })),
    )
  }
}

export const TransferDatabaseService = {
  getTransfersGnosis,
  putTransfersGnosis,
  getTransferSync,
  putTransferSync,
  getLastSyncTimestamp,
  saveLastSyncTimestamp,
}
