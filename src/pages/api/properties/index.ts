import { NextApiHandler } from 'next'
import { APIPitsBiEnv } from 'src/types/APIPitsBI'

import { APIRealToken, APIRealTokenCommunityEnv } from 'src/types/APIRealToken'
import { fetchWithRetry } from 'src/utils/general'
import { useCache } from 'src/utils/useCache'

const getRealTokenList = useCache(
  async (): Promise<APIRealToken[]> => {
    console.debug('Fetching RealToken list from Community API... (1)')
    for (const envVar of [
      APIRealTokenCommunityEnv.API_KEY,
      APIRealTokenCommunityEnv.API_BASE,
      APIRealTokenCommunityEnv.VERSION,
      APIRealTokenCommunityEnv.GET_ALLTOKENS,
    ]) {
      if (!process.env[envVar]) {
        throw new Error(`Missing RealToken Community API ${envVar} env variable`)
      }
    }
    const REALTOKEN_COMMUNITY_API_GET_ALLTOKENS = `${process.env[APIRealTokenCommunityEnv.API_BASE]}${process.env[APIRealTokenCommunityEnv.VERSION]}/${process.env[APIRealTokenCommunityEnv.GET_ALLTOKENS]}`
    try {
      const realTokenApiResponse = await fetchWithRetry(REALTOKEN_COMMUNITY_API_GET_ALLTOKENS, {
        method: 'GET',
        headers: { [APIRealTokenCommunityEnv.AUTH]: process.env[APIRealTokenCommunityEnv.API_KEY] as string },
      }, 2, 1_000)
      return realTokenApiResponse.json()
    } catch (error) {
      console.error(`Failed to fetch RealToken API:`, error)
    }
    // Use Pitsbi API as fallback datasource if RealToken API is not available
    // Pitsbi is 100% compatible with RealToken API
    let APIPitsbi_Env_available = true
    for (const envVar of [
      APIPitsBiEnv.VERSION,
      APIPitsBiEnv.BASE,
      APIPitsBiEnv.GET_LASTUPDATE,
      APIPitsBiEnv.GET_ALLTOKENS,
    ]) {
      if (!process.env[envVar]) {
        APIPitsbi_Env_available = false
        console.warn(`Missing Pitsbi API ${envVar} env variable`)
      }
    }

    if (!APIPitsbi_Env_available) {
      console.debug('Pitsbi API is not available')
      throw new Error(`Failed to fetch properties from RealToken API ; PitsBI API environment variables are not set, unable to fetch data.`)
    }
    const PITSBIAPI_GET_ALLTOKENS = `${process.env[APIPitsBiEnv.BASE]}${process.env[APIPitsBiEnv.VERSION]}/${process.env[APIPitsBiEnv.GET_ALLTOKENS]}`
    const pitsbiApiResponse = await fetchWithRetry(PITSBIAPI_GET_ALLTOKENS, {
      method: 'GET',
    }, 2, 10_000)

    // if (!pitsbiApiResponse.ok) {
    //   const pitsbiResponseText = (await pitsbiApiResponse.text())
    //   throw new Error(`Failed to fetch properties from both RealToken and Pitsbi APIs. Pitsbi error: ${pitsbiResponseText}`)
    // }
    // Return Pitsbi API response if RealToken API is not available
    return pitsbiApiResponse.json()
  },
  { duration: 1000 * 60 * 60 },
)

const handler: NextApiHandler = async (req, res) => {
  try {
    res.status(200).json(await getRealTokenList())
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.log(message)
    res.status(500).json(message)
  }
}

export default handler
