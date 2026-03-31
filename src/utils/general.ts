const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const FETCH_RETRIES_DEFAULT_COUNT = 2
const FETCH_RETRIES_DEFAULT_DELAY = 500

/**
 * fetchWithRetry
 * @param url
 * @param options
 * @param retries
 * @param delay : number of milliseconds to wait before retrying; zero = no delay, negative = random delay, positive = fixed delay
 */
const fetchWithRetry = async (
  url: string,
  options = {},
  retries = FETCH_RETRIES_DEFAULT_COUNT,
  delay = FETCH_RETRIES_DEFAULT_DELAY,
): Promise<Response> => {
  if (retries <= 0) {
    throw new Error('Max retries reached')
  }
  try {
    const response = await fetch(url, options)
    if (response.ok) {
      return response
    } else {
      throw response
    }
  } catch (error) {
    if (error instanceof Response) {
      // Authentication/authorization errors are not transient.
      if (error.status === 401 || error.status === 403) {
        throw new Error(
          `HTTP ${error.status} ${error.statusText} for URL: ${url}`,
        )
      }
    }
    const errorMsg =
      error instanceof Error
        ? error.message
        : error instanceof Response
          ? `error.statusText: ${error.statusText}, error.status: ${error.status}`
          : String(error)
    console.error(
      `Fetch error: ${errorMsg} for URL: ${url}`,
      `Retries left: ${retries - 1}, Delay: ${delay}ms`,
    )
    if (retries - 1 < 0) {
      throw error
    }
    if (delay > 0) {
      await wait(delay)
      return fetchWithRetry(url, options, retries - 1, delay)
    } else if (delay === 0) {
      return fetchWithRetry(url, options, retries - 1, delay)
    } else {
      // Random delay for retry
      const randomDelay = Math.floor(Math.random() * delay)
      await wait(randomDelay)
      return fetchWithRetry(url, options, retries - 1, delay)
    }
  }
}

export {
  wait,
  fetchWithRetry,
  FETCH_RETRIES_DEFAULT_COUNT,
  FETCH_RETRIES_DEFAULT_DELAY,
}
