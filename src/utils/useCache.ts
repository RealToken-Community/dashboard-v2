import { WaitingQueue } from './waitingQueue'

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

export function useCacheWithLocalStorage<T extends unknown[], R>(
  handler: (...args: T) => Promise<R>,
  options: {
    duration: number
    key: string
    usePreviousValueOnError?: boolean
  }
) {
  const waitingQueues: Record<string, WaitingQueue<R>> = {}

  return async function (...args: T) {
    const now = Date.now()

    const storageKey = args.length
      ? `${options.key}-${args.join('-')}`
      : options.key

    if (waitingQueues[storageKey]?.isWaiting) {
      return waitingQueues[storageKey].wait()
    } else {
      waitingQueues[storageKey] = new WaitingQueue()
    }

    const cached = localStorage.getItem(storageKey)
    if (cached) {
      const { timestamp, value } = JSON.parse(cached)
      if (now - timestamp < options.duration) {
        waitingQueues[storageKey].resolve(value)
        return value as R
      }
    }

    try {
      const result = await handler(...args)
      localStorage.setItem(
        storageKey,
        JSON.stringify({ timestamp: now, value: result })
      )
      waitingQueues[storageKey].resolve(result)
      return result
    } catch (err) {
      if (options.usePreviousValueOnError) {
        const cached = localStorage.getItem(storageKey)
        if (cached) {
          const { value } = JSON.parse(cached)
          waitingQueues[storageKey].resolve(value)
          return value as R
        }
      }
      waitingQueues[storageKey].reject(err)
      throw err
    }
  }
}
