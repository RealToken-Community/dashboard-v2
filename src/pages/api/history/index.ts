import { NextApiHandler } from 'next'
import { APIRealTokenEnv } from 'src/types/APIRealToken'

import { APIRealTokenHistory } from 'src/types/APIRealTokenHistory'
import { useCache } from 'src/utils/useCache'

const getRealTokenHistory = useCache(
  async (): Promise<APIRealTokenHistory[]> => {
    if (!process.env.COMMUNITY_API_KEY) {
      throw new Error('Missing COMMUNITY_API_KEY env variable')
    }
    if (!process.env[APIRealTokenEnv.API_HISTORY]) {
      throw new Error(`Missing ${APIRealTokenEnv.API_HISTORY} env variable`)
    }
    const response = await fetch(process.env[APIRealTokenEnv.API_HISTORY], {
      method: 'GET',
      headers: { [APIRealTokenEnv.AUTH]: process.env[APIRealTokenEnv.COMMUNITY_API_KEY] },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch properties history')
    }

    return response.json()
  },
  { duration: 1000 * 60 * 60 },
)

const handler: NextApiHandler = async (req, res) => {
  try {
    res.status(200).json(await getRealTokenHistory())
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.log(message)
    res.status(500).json(message)
  }
}

export default handler
