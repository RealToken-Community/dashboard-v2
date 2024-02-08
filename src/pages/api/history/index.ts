import { NextApiHandler } from 'next'

import { APIRealTokenHistory } from 'src/types/APIRealTokenHistory'
import { useCache } from 'src/utils/useCache'

const getRealTokenHistory = useCache(
  async (): Promise<APIRealTokenHistory[]> => {
    if (!process.env.COMMUNITY_API_KEY) {
      throw new Error('Missing COMMUNITY_API_KEY env variable')
    }

    const response = await fetch('https://history.api.realt.community/', {
      method: 'GET',
      headers: { 'X-AUTH-REALT-TOKEN': process.env.COMMUNITY_API_KEY },
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
