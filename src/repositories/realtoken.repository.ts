import _sortBy from 'lodash/sortBy'

import { APIRealToken } from 'src/types/APIRealToken'
import { APIRealTokenHistory } from 'src/types/APIRealTokenHistory'
import { RealToken, RealTokenRentStatus } from 'src/types/RealToken'

export const RealtokenRepository = {
  async getTokens(): Promise<RealToken[]> {
    const [tokens, history] = await Promise.all([
      fetchTokenList(),
      fetchHistoryList(),
    ])
    return tokens.map((token) => ({
      ...token,
      isRmmAvailable: getRmmStatus(token),
      rentStatus: getRentStatus(token),
      subsidyBy: fixSubsidyBy(token),
      history: _sortBy(
        history.find((h) => h.uuid === token.uuid)?.history ?? [],
        'date',
      ),
    }))
  },
}

async function fetchTokenList() {
  const response = await fetch('/api/properties', { method: 'GET' })
  return response.ok
    ? (response.json() as Promise<APIRealToken[]>)
    : Promise.reject(response.statusText)
}

async function fetchHistoryList() {
  const response = await fetch('/api/history', { method: 'GET' })
  return response.ok
    ? (response.json() as Promise<APIRealTokenHistory[]>)
    : Promise.reject(response.statusText)
}

function getRentStatus(item: APIRealToken) {
  if (!item.hasTenants || item.rentedUnits === 0) {
    return RealTokenRentStatus.none
  }
  return item.rentedUnits === item.totalUnits
    ? RealTokenRentStatus.full
    : RealTokenRentStatus.partial
}

function getRmmStatus(item: APIRealToken) {
  return !!item.blockchainAddresses.xDai.rmmPoolAddress
}

function fixSubsidyBy(item: APIRealToken) {
  // Some sections 8 are not correctly set in the API
  return item.subsidyBy ?? (item.subsidyStatus !== 'no' ? 'Section 8' : null)
}
