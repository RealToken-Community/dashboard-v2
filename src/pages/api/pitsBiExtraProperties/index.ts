import { NextApiHandler } from 'next'
import { APIPitsBiEnv } from 'src/types/APIPitsBI'

import { APIRealToken } from 'src/types/APIRealToken'
import { fetchWithRetry } from 'src/utils/general'
import { useCache } from 'src/utils/useCache'

const getRealTokenListExtraData = useCache(
  async (): Promise<APIRealToken[]> => {
    console.log('extraProperties: Fetching RealToken list from PitsBi API... 1')
    let APIPitsBi_Env_available = true
    for (const envVar of [
      APIPitsBiEnv.VERSION,
      APIPitsBiEnv.BASE,
      APIPitsBiEnv.GET_LASTUPDATE,
      APIPitsBiEnv.GET_ALLTOKENS,
    ]) {
      if (!process.env[envVar]) {
        APIPitsBi_Env_available = false
        console.warn(`extraProperties: Missing PitsBi API ${envVar} env variable`)
      }
    }
    if (!APIPitsBi_Env_available) {
      console.warn('extraProperties: PitsBi API is not available')
      // Return empty response
      return []
    }

    const PITSBiAPI_GET_ALLTOKENS = `${process.env[APIPitsBiEnv.BASE]}${process.env[APIPitsBiEnv.VERSION]}/${process.env[APIPitsBiEnv.GET_ALLTOKENS]}`
    const pitsBiApiResponse = await fetchWithRetry(PITSBiAPI_GET_ALLTOKENS, { method: 'GET' }, 2, 5_000)
    // if (!pitsBiApiResponse.ok) {
    //   // throw new Error('Failed to fetch PitsBi API : ' + (await pitsBiApiResponse.text()))
    //   const pitsBiResponseText = (await pitsBiApiResponse.text())
    //   const pitsBiErrorMsg = `extraProperties: Failed to fetch PitsBi API uri: (${PITSBiAPI_GET_ALLTOKENS}) status: (${pitsBiApiResponse.status}) response : ` + pitsBiResponseText
    //   console.error(pitsBiErrorMsg)
    //   return []
    // }
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
