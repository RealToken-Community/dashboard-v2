import { NextApiHandler } from 'next'

import { APIRealToken } from 'src/types/APIRealToken'
import { useCache } from 'src/utils/useCache'

const getRealTokenList = useCache(
  async (): Promise<APIRealToken[]> => {
    if (!process.env.COMMUNITY_API_KEY) {
      throw new Error('Missing COMMUNITY_API_KEY env variable')
    }

    const response = await fetch('https://api.realt.community/v1/token', {
      method: 'GET',
      headers: { 'X-AUTH-REALT-TOKEN': process.env.COMMUNITY_API_KEY },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch properties : ' + (await response.text()))
    }

    return response.json()
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
