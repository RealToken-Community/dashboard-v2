import { Contract } from 'ethers'

import { wait } from '../general'

const MAX_BATCH_CONTRACT_PER_CHUNK_DEFAULT = 100
const MIN_BATCH_CONTRACT_PER_CHUNK_DEFAULT = 10
const BATCH_MAX_ATTEMPTS_DEFAULT = 5
const BATCH_WAIT_BETWEEN_ATTEMPTS_MS = 200
const BATCH_WAIT_BETWEEN_CHUNKS_MS = 20

/**
 * Batch call one contract one function with multiple parameters
 *
 * Required parameters
 * @param _contract: Contract instance
 * @param _methodName: string = contract method name
 * @param _argsArray: object[n][m] // n: number of calls, m: number of parameters per call
 *
 * Optional parameters
 * @param _initialBatchSize: number
 * @param _minBatchSize: number
 * @param _maxAttempts: number : max number of attempts, any value less than 1 will behave as a single attempt
 * @param consoleWarnOnError: boolean : log error to console ; default: true ; set to false to suppress console error ; params error will still be logged
 *
 * @returns Promise<object[]> :array of results
 *
 * @description Batch call the same function on the same contract with multiple parameters mutliple times
 **/
const batchCallOneContractOneFunctionMultipleParams = async (
  _contract: Contract,
  _methodName: string,
  _argsArray: object[][],
  _initialBatchSize: number = MAX_BATCH_CONTRACT_PER_CHUNK_DEFAULT,
  _minBatchSize: number = MIN_BATCH_CONTRACT_PER_CHUNK_DEFAULT,
  _maxAttempts: number = BATCH_MAX_ATTEMPTS_DEFAULT,
  consoleWarnOnError = true,
) => {
  try {
    let attempt = 0
    if (!_contract || !_methodName || !_argsArray) {
      throw new Error(
        'batchCallOneContractOneFunctionMultipleParams Error:: Missing required parameters',
      )
    }
    if (_initialBatchSize < _minBatchSize || _initialBatchSize < 1) {
      console.warn(
        'batchCallOneContractOneFunctionMultipleParams Warning:: _initialBatchSize cannot be less than _minBatchSize || _initialBatchSize < 1',
      )
      // Set default values
      _initialBatchSize = MAX_BATCH_CONTRACT_PER_CHUNK_DEFAULT
      _minBatchSize = MIN_BATCH_CONTRACT_PER_CHUNK_DEFAULT
    }
    do {
      // wait if attempt > 0 and grow wait time for each attempt
      attempt && wait(BATCH_WAIT_BETWEEN_ATTEMPTS_MS * attempt)
      attempt++
      try {
        let results: object[] = []
        // Split the array into chunks
        const chunks = []
        // Divide chunk size by attempt at each iteration (decrease chunk size for each attempt)
        const currentBatchSize = _initialBatchSize / attempt
        // Keep chunk size consistent
        const chunkSize =
          currentBatchSize < MIN_BATCH_CONTRACT_PER_CHUNK_DEFAULT
            ? _minBatchSize
            : currentBatchSize
        for (let i = 0; i < _argsArray.length; i += chunkSize) {
          chunks.push(_argsArray.slice(i, i + chunkSize))
        }
        for (let i = 0; i < chunks.length; i++) {
          const chunkPromises: object[] = []
          const _argsChunk = chunks[i]
          _argsChunk.forEach(async (_args) => {
            chunkPromises.push(contractCall(_contract, _methodName, _args))
          })
          const chunkResults = await Promise.all(chunkPromises)
          results = results.concat(chunkResults)
          // wait between remaining chunks
          if (i < chunks.length - 1) {
            wait(BATCH_WAIT_BETWEEN_CHUNKS_MS)
          }
        }
        return results
      } catch (error) {
        if (consoleWarnOnError) {
          const chainId =
            (await _contract?.runner?.provider?.getNetwork())?.chainId ??
            'unknown'
          console.error(
            `batchCallOneContractOneFunctionMultipleParams Error:: chainId: ${chainId} contract address: ${_contract?.target} methodName: ${_methodName} args: [${_argsArray}] initialBatchSize: ${_initialBatchSize} minBatchSize: ${_minBatchSize}`,
          )
        }
      }
    } while (attempt < _maxAttempts)
  } catch (error) {
    console.error(error)
  }
}

const contractCall = async (
  _contract: Contract,
  _methodName: string,
  _args: object[],
): Promise<object | null> => {
  try {
    return _contract[_methodName](..._args)
  } catch (error) {
    console.error(error)
  }
  return null
}

export {
  batchCallOneContractOneFunctionMultipleParams,
  MAX_BATCH_CONTRACT_PER_CHUNK_DEFAULT,
  MIN_BATCH_CONTRACT_PER_CHUNK_DEFAULT,
  BATCH_MAX_ATTEMPTS_DEFAULT,
}
