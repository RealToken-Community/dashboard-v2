import { APIRealToken } from 'src/types/APIRealToken'

export const RealtokenRepository = {
  async getTokens() {
    const response = await fetch('/api/properties', { method: 'GET' })

    if (!response.ok) {
      throw new Error(response.statusText)
    }

    return response.json() as Promise<APIRealToken[]>
  },
}
