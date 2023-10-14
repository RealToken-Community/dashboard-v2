export function useCache<T>(
  handler: () => Promise<T>,
  options: { duration: number }
) {
  const cache = {
    data: null as T | null,
    lastFetched: 0,
  }

  return async function () {
    const isStilValid = Date.now() - cache.lastFetched < options.duration

    if (cache.data && isStilValid) {
      return cache.data
    }

    try {
      cache.data = await handler()
      cache.lastFetched = Date.now()
      return cache.data
    } catch (err) {
      cache.data = null
      cache.lastFetched = 0
      throw err
    }
  }
}

export function useCacheWithLocalStorage<T>(
  handler: () => Promise<T>,
  options: {
    duration: number
    key: string
    usePreviousValueOnError?: boolean
  }
) {
  return async function () {
    const now = Date.now()

    const cached = localStorage.getItem(options.key)
    if (cached) {
      const { timestamp, value } = JSON.parse(cached)
      if (now - timestamp < options.duration) {
        return value as T
      }
    }

    try {
      const result = await handler()
      localStorage.setItem(
        options.key,
        JSON.stringify({ timestamp: now, value: result })
      )
      return result
    } catch (err) {
      if (options.usePreviousValueOnError) {
        const cached = localStorage.getItem(options.key)
        if (cached) {
          const { value } = JSON.parse(cached)
          return value as T
        }
      }
      throw err
    }
  }
}
