import _sortBy from 'lodash/sortBy'

import {
  APIRealTokenPitsBI,
  APIRealTokenPitsBI_ExtraData,
} from 'src/types/APIPitsBI'
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
  async getTokensPitsBiExtraData(): Promise<APIRealTokenPitsBI_ExtraData[]> {
    const [tokensExtraData] = await Promise.all([
      fetchTokenListPitsBiExtraData(),
    ])
    return tokensExtraData.map((tokenExtraData: APIRealTokenPitsBI) => {
      return {
        uuid: tokenExtraData.uuid,
        actions: tokenExtraData.actions,
        historic: tokenExtraData.historic,
      }
    })
  },
}

async function fetchTokenList() {
  const response = await fetch('/api/properties', { method: 'GET' })
  return response.ok
    ? (response.json() as Promise<APIRealToken[]>)
    : Promise.reject(response.statusText)
}

async function fetchTokenListPitsBiExtraData() {
  const response = await fetch('/api/pitsBiExtraProperties', { method: 'GET' })
  return response.ok
    ? (response.json() as Promise<APIRealTokenPitsBI[]>)
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
  return !!item.blockchainAddresses.xDai.rmmV3WrapperAddress
}

function fixSubsidyBy(item: APIRealToken) {
  // Some sections 8 are not correctly set in the API
  return item.subsidyBy ?? (item.subsidyStatus !== 'no' ? 'Section 8' : null)
}
