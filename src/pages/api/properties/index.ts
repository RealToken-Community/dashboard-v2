import { NextApiHandler } from 'next'
import { APIPitsBiEnv } from 'src/types/APIPitsBI'

import { APIRealToken, APIRealTokenCommunityEnv } from 'src/types/APIRealToken'
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
    console.debug('Fetching RealToken list from Community API... (2)')
    const REALTOKEN_COMMUNITY_API_GET_ALLTOKENS = `${process.env[APIRealTokenCommunityEnv.API_BASE]}${process.env[APIRealTokenCommunityEnv.VERSION]}/${process.env[APIRealTokenCommunityEnv.GET_ALLTOKENS]}`
    console.debug(`RealToken API GET_ALLTOKENS endpoint: ${REALTOKEN_COMMUNITY_API_GET_ALLTOKENS} (3)`)

    const realTokenApiResponse = await fetch(REALTOKEN_COMMUNITY_API_GET_ALLTOKENS, {
      method: 'GET',
      headers: { [APIRealTokenCommunityEnv.AUTH]: process.env[APIRealTokenCommunityEnv.API_KEY] as string },
    })

    console.debug(`RealToken API response received, status: ${realTokenApiResponse.status} (4)`)

    // const realTokenApiResponseText = !realTokenApiResponse.ok ? (await realTokenApiResponse.text()) : ''
    const realTokenApiResponseError = !realTokenApiResponse.ok

    const realTokenApiErrorMsg = realTokenApiResponseError ? `Failed to fetch RealToken API uri: (${REALTOKEN_COMMUNITY_API_GET_ALLTOKENS}) status: (${realTokenApiResponse.status}) response : ` + (await realTokenApiResponse.text()) : ''
    if (realTokenApiResponseError) {
      // throw new Error('Failed to fetch properties : ' + (await realTokenApiResponse.text()))
      // const realTokenApiResponseText = (await realTokenApiResponse.text())
      console.error(realTokenApiErrorMsg)

      // Use Pitsbi API as fallback datasource if RealToken API is not available
      // Pitsbi is 100% compatible with RealToken API

      console.debug('RealToken API: FAILED query, checking Pitsbi API availability...')
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
      console.debug(`Pitsbi API available: ${APIPitsbi_Env_available}`)

      if (!APIPitsbi_Env_available) {
        console.debug('Pitsbi API is not available')
        // // Return empty response as fallback
        // console.debug('Returning empty response as fallback...')
        // return []
        throw new Error(`Failed to fetch properties from RealToken API, error: ${realTokenApiErrorMsg} ; PitsBI API environment variables are not set, unable to fetch data.`)
      }

      console.debug('RealToken API response is not OK, but Pitsbi API is available, proceeding to fetch Pitsbi API...')

      const PITSBIAPI_GET_ALLTOKENS = `${process.env[APIPitsBiEnv.BASE]}${process.env[APIPitsBiEnv.VERSION]}/${process.env[APIPitsBiEnv.GET_ALLTOKENS]}`
      console.debug(`Pitsbi API GET_ALLTOKENS endpoint: ${PITSBIAPI_GET_ALLTOKENS}`)

      const pitsbiApiResponse = await fetch(PITSBIAPI_GET_ALLTOKENS, {
        method: 'GET',
      })
      if (!pitsbiApiResponse.ok) {
        // throw new Error('Failed to fetch Pitsbi API : ' + (await pitsbiApiResponse.text()))
        const pitsbiResponseText = (await pitsbiApiResponse.text())
        // const pitsbiErrorMsg = `Failed to fetch Pitsbi API uri: (${PITSBIAPI_GET_ALLTOKENS}) status: (${pitsbiApiResponse.status}) response : ` + pitsbiResponseText
        // console.error(pitsbiErrorMsg)
        throw new Error(`Failed to fetch properties from both RealToken and Pitsbi APIs. RealToken error: ${realTokenApiErrorMsg}, Pitsbi error: ${pitsbiResponseText}`)
      }


      // TODO: reformat PitsBI response to match "standard" RealToken API response structure
      // and return it with PitsBI extra data

      // Return Pitsbi API response if RealToken API is not available
      console.debug('Returning Pitsbi API response (as RealT API) ...')
      return pitsbiApiResponse.json()

      // Load Pitsbi "in the background"



      // console.debug(await pitsbiApiResponse.json())

      // const realTokenList = await realTokenApiResponse.json() as APIRealToken[]
      // const pitsbiList = await pitsbiApiResponse.json()
      
      
      // console.debug('returning Pitsbi API response...')
      // return pitsbiApiResponse.json()
      
      // console.log('Pitsbi API response received, merging with RealToken API response...')
      // const jsonMerged = mergeObjects([realTokenApiResponse.json(), pitsbiApiResponse.json()], {
      //   // Merge options can be specified here if needed
      // })
      // console.debug('Merged JSON:', jsonMerged)
      // return jsonMerged

    } // If RealToken API response is not OK




      // console.debug('Fetching RealToken list from PitsBI API... 2')



    // }



    // if (APIPitsbi_Env_available) {

    // // console.debug('Pitsbi API is not available')

    //   // if (!realTokenApiResponse.ok) {
    //   //   throw new Error('Failed to fetch properties : ' + (await realTokenApiResponse.text()))
    //   // }

    // if (!realTokenApiResponse.ok) {
    //   throw new Error(`${realTokenApiErrorMsg} and Pitsbi API is not available (missing env variables)`)
    // }

    // console.debug('RealToken API response received, returning RealToken list...')


    // return realTokenApiResponse
    return realTokenApiResponse.json()
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
