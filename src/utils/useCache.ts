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
