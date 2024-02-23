import Dexie, { Table } from 'dexie'
import _maxBy from 'lodash/maxBy'
import _minBy from 'lodash/minBy'

import { RealTokenTransfer } from './transfers.type'

class TransferDatabase extends Dexie {
  transfers: Table<RealTokenTransfer, string>
  transferSync: Table<{ id: string; timestamp: number }, string>

  constructor() {
    super('TransferDatabase')
    this.version(1).stores({
      transfers: 'id, realtoken, from, to',
      transferSync: 'id',
    })
    this.transfers = this.table('transfers')
    this.transferSync = this.table('transferSync')
  }
}

const db = new TransferDatabase()

async function getTransfers(filters: {
  userAddressList: string[]
  realtokenList?: string[]
}) {
  const { userAddressList, realtokenList } = filters

  const transfers = await db.transfers
    .where('from')
    .anyOf(userAddressList)
    .or('to')
    .anyOf(userAddressList)
    .toArray()

  return realtokenList
    ? transfers.filter((item) => realtokenList?.includes(item.realtoken))
    : transfers
}

async function putTransfers(transfers: RealTokenTransfer[]) {
  await db.transfers.bulkPut(transfers)
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

async function dropDatabase() {
  await db.transfers.clear()
  await db.transferSync.clear()
}

export const TransferDatabaseService = {
  getTransfers,
  putTransfers,
  getTransferSync,
  putTransferSync,
  getLastSyncTimestamp,
  saveLastSyncTimestamp,
  dropDatabase,
}
