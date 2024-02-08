import { WaitingQueue } from './waitingQueue'

export function useCache<T>(
  handler: () => Promise<T>,
  options: { duration: number },
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

const LOCAL_STORAGE_LIST_KEY = 'useCacheWithLocalStorage-list'

function getLocalStorageKeys() {
  const list = localStorage.getItem(LOCAL_STORAGE_LIST_KEY)
  if (list) {
    return JSON.parse(list) as string[]
  }
  return []
}
function registerLocalStorageKey(key: string) {
  const keys = getLocalStorageKeys()
  if (!keys.includes(key)) {
    localStorage.setItem(LOCAL_STORAGE_LIST_KEY, JSON.stringify([...keys, key]))
  }
}

export function clearExpiredLocalStorageCache() {
  const now = Date.now()
  const keys = getLocalStorageKeys()
  keys.forEach((key) => {
    const cached = localStorage.getItem(key)
    if (cached) {
      const { expires } = JSON.parse(cached)
      if (now > expires) {
        localStorage.removeItem(key)
      }
    }
  })
}

if (typeof window !== 'undefined') {
  clearExpiredLocalStorageCache()
}

export function expiresLocalStorageCaches() {
  const keys = getLocalStorageKeys()
  keys.forEach(expiresLocalStorageCache)
}

export function expiresLocalStorageCache(key: string) {
  const cached = localStorage.getItem(key)
  if (cached) {
    const now = Date.now()
    const { expires, ...rest } = JSON.parse(cached)
    if (now < expires) {
      localStorage.setItem(key, JSON.stringify({ ...rest, expires: now }))
    }
  }
}

export function useCacheWithLocalStorage<T extends unknown[], R>(
  handler: (...args: T) => Promise<R>,
  options: {
    duration: number
    key: string
    usePreviousValueOnError?: boolean
  },
) {
  const waitingQueues: Record<string, WaitingQueue<R>> = {}

  return async function (...args: T) {
    const now = Date.now()

    const storageKey = args.length
      ? `${options.key}-${args.join('-')}`
      : options.key

    registerLocalStorageKey(storageKey)

    if (waitingQueues[storageKey]?.isWaiting) {
      return waitingQueues[storageKey].wait()
    } else {
      waitingQueues[storageKey] = new WaitingQueue()
    }

    const cached = localStorage.getItem(storageKey)
    if (cached) {
      const { expires, value } = JSON.parse(cached)
      if (now < expires) {
        waitingQueues[storageKey].resolve(value)
        return value as R
      }
    }

    try {
      const result = await handler(...args)
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          expires: now + options.duration,
          value: result,
        }),
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
