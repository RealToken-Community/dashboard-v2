import _sortBy from 'lodash/sortBy'
import { APIRealTokenPitsBI, APIRealTokenPitsBI_ExtraData } from 'src/types/APIPitsBI'

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
  // async getTokensExtraData(): Promise<APIRealTokenPitsBI[]> {
  async getTokensPitsBiExtraData(): Promise<APIRealTokenPitsBI_ExtraData[]> {
    const [tokensExtraData] = await Promise.all([
      fetchTokenListPitsBiExtraData(),
    ])
    // console.debug('extraData: Fetched tokens extra data:', tokensExtraData)
    console.debug('getTokensPitsBiExtraData: tokensExtraData length:', tokensExtraData.length)

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

// function setExtraData(extraData: any): any {
//   if (!extraData) return {}
//   // Assuming extraData is an object with various properties
//   const fixedData: any = {}
//   for (const key in extraData) {
//     if (Object.prototype.hasOwnProperty.call(extraData, key)) {
//       // Here you can add any specific transformations or validations needed
//       fixedData[key] = extraData[key]
//     }
//   }

//   if (fixedData.uuid == '0x9aFDd1e3EEc7985b9Dcc3dA1ed030498ea031a6C') {
//     console.debug(`extraData: `, fixedData)
//   } else if (fixedData.uuid == '0x9A99f283e1F6c3b7F24901995624Ef7b78E94471') {
//     console.debug(`extraData: `, fixedData)
//   } else if (fixedData.uuid == '0xbd42a15a05d51158ca3c46cfd26fb19476f91ce6') {
//     console.debug(`extraData: `, fixedData)
//   } else if (fixedData.uuid == '0x7231cafcb32d2ad7072b7bee71ca9d4e5ebffafa') {
//     console.debug(`extraData: `, fixedData)
//   } else if (fixedData.uuid == '0xe7b6de709ffc3bd237c2f2c800e1002f97a760f3') {
//     console.debug(`extraData: `, fixedData)
//   } else if (fixedData.uuid == '0xa816636edd3e777b733177cb5aeefbd931565fb5') {
//     console.debug(`extraData: `, fixedData)
//   }
  
//   return fixedData
// }
