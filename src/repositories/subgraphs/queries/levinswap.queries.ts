import { gql } from '@apollo/client'

import { Realtoken } from 'src/store/features/realtokens/realtokensSelector'
import { useCacheWithLocalStorage } from 'src/utils/useCache'

import { LevinSwapClient } from '../clients'

export async function getLevinSwapBalances(
  addressList: string[],
  realtokens: Realtoken[]
) {
  const result = await executeQuery(
    addressList.map((item) => item.toLowerCase())
  )
  return formatBalances(result.data.users, realtokens)
}

const executeQuery = useCacheWithLocalStorage(
  async (addressList: string[]) =>
    LevinSwapClient.query<LevinSwapResult>({
      query: LevinSwapQuery,
      variables: { addressList },
    }),
  {
    duration: 1000 * 60 * 10, // 10 minutes
    usePreviousValueOnError: true,
    key: 'LevinSwapQuery',
  }
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
          }
          token1 {
            id
            name
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
        token0: { id: string; name: string }
        token1: { id: string; name: string }
        reserve0: string
        reserve1: string
      }
    }[]
  }[]
}

function formatBalances(
  users: LevinSwapResult['users'],
  realtokens: Realtoken[]
) {
  return users.map((user) => {
    const balances: Record<string, number> = {}
    user.liquidityPositions.forEach((position) => {
      const share =
        parseFloat(position.liquidityTokenBalance) /
        parseFloat(position.pair.totalSupply)
      const token0 = position.pair.token0.id
      const token1 = position.pair.token1.id
      balances[token0] =
        (balances[token0] ?? 0) + parseFloat(position.pair.reserve0) * share
      balances[token1] =
        (balances[token1] ?? 0) + parseFloat(position.pair.reserve1) * share
    })

    const isRealtoken = (address: string) =>
      realtokens.find((item) =>
        [
          item.gnosisContract?.toLowerCase(),
          item.ethereumContract?.toLowerCase(),
        ].includes(address.toLowerCase())
      )

    return {
      address: user.id,
      balances: Object.entries(balances).map(([address, amount]) => ({
        token: address,
        amount: amount / 10 ** (isRealtoken(address) ? 18 : 0),
      })),
    }
  })
}
