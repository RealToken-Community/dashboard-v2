const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const FETCH_RETRIES_DEFAULT_COUNT = 2;
const FETCH_RETRIES_DEFAULT_DELAY = 500;

/**
 * fetchWithRetry
 * @param url 
 * @param options 
 * @param retries 
 * @param delay : number of milliseconds to wait before retrying; zero = no delay, negative = random delay, positive = fixed delay
 */
const fetchWithRetry = async(url: string, options = {}, retries = FETCH_RETRIES_DEFAULT_COUNT, delay = FETCH_RETRIES_DEFAULT_DELAY): Promise<Response> => {
  // TODO: remove DEBUG
  console.debug(`Fetch attempt`, `Url: ${url}, Retries left: ${retries - 1}, Delay: ${delay}ms`);
  // TODO: remove DEBUG
  console.debug(`Fetch attempt`, `Options: ${JSON.stringify(options)}`);// Never display options
  if (retries <= 0) {
    throw new Error('Max retries reached');
  }
  try {
    const response = await fetch(url, options);
    if (response.ok) {
      return response;
    } else {
      // Handle specific error cases if needed
      // if (response.status === 401) throw ...
      // if (response.status === 503) throw ...
      throw response;
    }
  } catch (error) {
    console.error(`Fetch error: ${error}`, `Url: ${url}, Retries left: ${retries - 1}, Delay: ${delay}ms`);
    if (retries - 1 < 0) {
      throw error;
    }
    if (delay > 0) {
      await wait(delay);
      return fetchWithRetry(url, options, retries - 1, delay);
    } else if (delay === 0) {
      return fetchWithRetry(url, options, retries - 1, delay);
    } else {
      // Random delay for retry
      const randomDelay = Math.floor(Math.random() * delay);
      await wait(randomDelay);
      return fetchWithRetry(url, options, retries - 1, delay);
    }
  }
}

export { wait, fetchWithRetry, FETCH_RETRIES_DEFAULT_COUNT, FETCH_RETRIES_DEFAULT_DELAY };
