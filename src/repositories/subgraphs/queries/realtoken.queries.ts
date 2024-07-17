import { gql } from '@apollo/client'

import { useCacheWithLocalStorage } from 'src/utils/useCache'

import { EthereumClient, GnosisClient } from '../clients'

export async function getRealtokenBalances(
  addressList: string[],
  options: { includesEth?: boolean } = {},
) {
  const [gnosisResult, ethereumResult] = await executeQuery(
    addressList.map((item) => item.toLowerCase()),
    options,
  )

  return {
    gnosis: formatBalances(gnosisResult.data.accounts),
    ethereum: formatBalances(ethereumResult.data.accounts),
  }
}

const executeQuery = useCacheWithLocalStorage(
  async (addressList: string[], options: { includesEth?: boolean } = {}) =>
    Promise.all([
      GnosisClient().query<RealtokenResult>({
        query: RealtokenQuery,
        variables: { addressList },
      }),
      options.includesEth
        ? EthereumClient().query<RealtokenResult>({
            query: RealtokenQuery,
            variables: { addressList },
          })
        : Promise.resolve({ data: { accounts: [] } }),
    ]),
  {
    duration: 1000 * 60 * 60, // 1 hour
    usePreviousValueOnError: true,
    key: 'RealtokenQuery',
  },
)

const RealtokenQuery = gql`
  query RealtokenQuery($addressList: [String]!) {
    accounts(where: { address_in: $addressList }) {
      address
      balances(
        where: { amount_gt: "0" }
        first: 1000
        orderBy: amount
        orderDirection: desc
      ) {
        token {
          address
        }
        amount
      }
    }
  }
`

interface RealtokenResult {
  accounts: {
    address: string
    balances: {
      token: {
        address: string
      }
      amount: string
    }[]
  }[]
}

function formatBalances(accounts: RealtokenResult['accounts']) {
  return accounts.map((account) => ({
    address: account.address,
    balances: account.balances.map((balance) => ({
      token: balance.token.address,
      amount: parseFloat(balance.amount),
    })),
  }))
}
