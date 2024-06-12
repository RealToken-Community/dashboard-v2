import { gql } from '@apollo/client'

import { RealToken } from 'src/types/RealToken'
import { useCacheWithLocalStorage } from 'src/utils/useCache'

import { LevinSwapClient } from '../clients'

export async function getLevinSwapBalances(
  addressList: string[],
  realtokens: RealToken[],
) {
  const result = await executeQuery(
    addressList.map((item) => item.toLowerCase()),
  )
  return formatBalances(result.data.users, realtokens)
}

const executeQuery = useCacheWithLocalStorage(
  async (addressList: string[]) =>
    LevinSwapClient().query<LevinSwapResult>({
      query: LevinSwapQuery,
      variables: { addressList },
    }),
  {
    duration: 1000 * 60 * 10, // 10 minutes
    usePreviousValueOnError: true,
    key: 'LevinSwapQuery',
  },
)

const LevinSwapQuery = gql`
  query LevinSwapQuery($addressList: [String]!) {
    users(where: { id_in: $addressList }) {
      id
      liquidityPositions(first: 400) {
        liquidityTokenBalance
        pair {
          totalSupply
          token0 {
            id
            name
            decimals
          }
          token1 {
            id
            name
            decimals
          }
          reserve0
          reserve1
        }
      }
    }
  }
`

interface LevinSwapResult {
  users: {
    id: string
    liquidityPositions: {
      liquidityTokenBalance: string
      pair: {
        totalSupply: string
        token0: { id: string; name: string; decimals: string }
        token1: { id: string; name: string; decimals: string }
        reserve0: string
        reserve1: string
      }
    }[]
  }[]
}

function formatBalances(
  users: LevinSwapResult['users'],
  realtokens: RealToken[],
) {
  return users.map((user) => {
    const balances: Record<string, { amount: number; decimals: number }> = {}
    user.liquidityPositions.forEach((position) => {
      const share =
        parseFloat(position.liquidityTokenBalance) /
        parseFloat(position.pair.totalSupply)
      const token0 = position.pair.token0
      const token1 = position.pair.token1
      balances[token0.id] = {
        amount:
          (balances[token0.id]?.amount ?? 0) +
          parseFloat(position.pair.reserve0) * share,
        decimals: parseInt(token0.decimals),
      }
      balances[token1.id] = {
        amount:
          (balances[token1.id]?.amount ?? 0) +
          parseFloat(position.pair.reserve1) * share,
        decimals: parseInt(token0.decimals),
      }
    })

    const getCorrectDecimals = (address: string, decimals: number) => {
      const isRealtoken = realtokens.find((item) =>
        [
          item.gnosisContract?.toLowerCase(),
          item.ethereumContract?.toLowerCase(),
        ].includes(address.toLowerCase()),
      )

      // Some pools are not correctly configured, and return 0 decimals instead of 18
      return isRealtoken && !decimals ? 18 : 0
    }

    return {
      address: user.id,
      balances: Object.entries(balances).map(
        ([address, { amount, decimals }]) => ({
          token: address,
          amount: amount / 10 ** getCorrectDecimals(address, decimals),
        }),
      ),
    }
  })
}
