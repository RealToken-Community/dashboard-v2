import { NextApiHandler } from 'next'
import { APIRealTokenCommunityEnv } from 'src/types/APIRealToken'

import { APIRealTokenHistory } from 'src/types/APIRealTokenHistory'
import { useCache } from 'src/utils/useCache'

const getRealTokenHistory = useCache(
  async (): Promise<APIRealTokenHistory[]> => {
    if (!process.env[APIRealTokenCommunityEnv.API_KEY]) {
      throw new Error(`Missing ${APIRealTokenCommunityEnv.API_KEY} env variable`)
    }
    if (!process.env[APIRealTokenCommunityEnv.API_HISTORY]) {
      throw new Error(`Missing ${APIRealTokenCommunityEnv.API_HISTORY} env variable`)
    }
    const response = await fetch(process.env[APIRealTokenCommunityEnv.API_HISTORY], {
      method: 'GET',
      headers: { [APIRealTokenCommunityEnv.AUTH]: process.env[APIRealTokenCommunityEnv.API_KEY] },
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
