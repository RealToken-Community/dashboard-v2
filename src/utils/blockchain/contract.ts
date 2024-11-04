import { Contract } from 'ethers'

const MAX_BATCH_CONTRACT_PER_CHUNK = 100
const BATCH_WAIT_BETWEEN_ATTEMPTS_MS = 200
const BATCH_WAIT_BETWEEN_CHUNKS_MS = 20
const BATCH_MAX_ATTEMPTS = 5

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const batchCallOneContractOneFunctionMultipleParams = async (
  _contract: Contract,
  _methodName: string,
  _argsArray: object[][],
) => {
  try {
    let attempt = 0
    do {
      attempt && wait(BATCH_WAIT_BETWEEN_ATTEMPTS_MS * attempt) // wait if attempt > 0 and grow wait time for each attempt
      attempt++
      try {
        let results: object[] = []
        // Split the array into chunks
        const chunks = []
        const chunkSize = MAX_BATCH_CONTRACT_PER_CHUNK / attempt // Divide chunk size by attempt at each iteration
        for (let i = 0; i < _argsArray.length; i += chunkSize) {
          chunks.push(_argsArray.slice(i, i + chunkSize))
        }
        for (let i = 0; i < chunks.length; i++) {
          const chunkPromises: object[] = []
          const _argsChunk = chunks[i]
          _argsChunk.forEach(async (_args /* , idx */) => {
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
        console.error(
          `batchCallOneContractOneFunctionMultipleParams error ${_methodName} _argsArray ${_argsArray}`,
        )
      }
    } while (attempt < BATCH_MAX_ATTEMPTS)
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

export { batchCallOneContractOneFunctionMultipleParams }

// Call the same method with the same arguments on multiple contracts
/*
const batchCallOneFunction = async (
  _contractsArray: Contract[],
  _methodName: string,
  _args: object[],
) => {
  try {
    // initConfigModContract(MOD_CONTRACT_CONFIG)
    console.log(
      `contractsArray.length: ${_contractsArray.length} methodName: ${_methodName} args: (${_args})`,
    )
    // const ok = false
    let attempt = 0
    do {
      if (attempt) {
        console.log(
          `attempt ${attempt} wait ${BATCH_WAIT_BETWEEN_ATTEMPTS_MS} ms`,
        )
        wait(BATCH_WAIT_BETWEEN_ATTEMPTS_MS * attempt)
      }
      attempt++
      console.log(`attempt ${attempt}`)
      try {
        let results: object[] = []
        // Split the array into chunks
        const chunks = []
        const chunkSize = MAX_BATCH_CONTRACT_PER_CHUNK / attempt // Divide chunk size by attempt at each iteration
        console.log(
          `MAX_BATCH_CONTRACT_PER_CHUNK: ${MAX_BATCH_CONTRACT_PER_CHUNK} chunkSize: ${chunkSize}`,
        )
        for (let i = 0; i < _contractsArray.length; i += chunkSize) {
          // console.log(`i=${i} i+chunkSize=${i+chunkSize} _contractsArray.length=${_contractsArray.length}`)
          chunks.push(_contractsArray.slice(i, i + chunkSize))
        }
        // console.log(`chunks.length: ${chunks.length}`)
        // throw new Error('TEST')
        for (let i = 0; i < chunks.length; i++) {
          console.log(
            `chunk ${('000' + i).slice(-3)} length: ${chunks[i].length}`,
          )
          const chunkPromises: object[] = []
          const _contractsChunk = chunks[i]
          _contractsChunk.forEach(async (contract, idx) => {
            chunkPromises.push(contractCall(contract, _methodName, _args))
            console.log(`${idx} ${contract.target}`)
          }) // contracts.forEach
          const chunkResults = await Promise.all(chunkPromises)
          console.log(`chunkResults:`)
          console.dir(chunkResults)
          results = results.concat(chunkResults)
          // wait if chunks remaining
          if (i < chunks.length - 1) {
            wait(BATCH_WAIT_BETWEEN_CHUNKS_MS)
          }
        }
        // console.log(`results:`)
        // console.dir(results)
        // for (let i = 0; i < results.length; i++) {
        //   console.log(`${("0000"+i).slice(-4)} ${results[i]}`)
        // }
        return results
      } catch (error) {
        console.error(error)
      }
    } while (attempt < BATCH_MAX_ATTEMPTS)
  } catch (error) {
    console.error(error)
  }
} // batchCallOneFunction
*/
