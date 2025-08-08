import { NextApiHandler } from 'next'

import { APIPitsBiEnv } from 'src/types/APIPitsBI'
import { APIRealToken } from 'src/types/APIRealToken'
import { fetchWithRetry } from 'src/utils/general'
import { useCache } from 'src/utils/useCache'

import { URIS } from '../uris'

const getRealTokenListExtraData = useCache(
  async (): Promise<APIRealToken[]> => {
    let APIPitsBi_Env_available = true
    for (const envVar of [
      APIPitsBiEnv.VERSION,
      APIPitsBiEnv.BASE,
      APIPitsBiEnv.GET_LASTUPDATE,
      APIPitsBiEnv.GET_ALLTOKENS,
    ]) {
      if (!process.env[envVar]) {
        APIPitsBi_Env_available = false
        console.warn(
          `extraProperties: Missing PitsBi API ${envVar} env variable`,
        )
      }
    }
    if (!APIPitsBi_Env_available) {
      console.warn('extraProperties: PitsBi API is not available')
      // Return empty response
      return []
    }
    const pitsBiApiResponse = await fetchWithRetry(
      URIS.PITSBI_API_GET_ALLTOKENS,
      { method: 'GET' },
      2,
      5_000,
    )
    return pitsBiApiResponse.json()
  },
  { duration: 1000 * 60 * 60 },
)

const handler: NextApiHandler = async (req, res) => {
  try {
    res.status(200).json(await getRealTokenListExtraData())
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.log(message)
    res.status(500).json(message)
  }
}

export default handler
