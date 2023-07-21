import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'

import { APIRealToken } from 'src/types/APIRealToken'

const handler: NextApiHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const response = await fetch(
      'https://api.preprod.realt.community/v1/token',
      {
        method: 'GET',
        headers: {
          'X-AUTH-REALT-TOKEN': process.env.COMMUNITY_API_KEY ?? '',
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch properties')
    }
    const tokens: APIRealToken[] = await response.json()
    res.status(200).json(tokens)
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: 'Failed to fetch properties' })
  }
}

export default handler
