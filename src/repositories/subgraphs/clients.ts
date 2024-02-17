import { ApolloClient, InMemoryCache } from '@apollo/client'

export const GnosisClient = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/realtoken-thegraph/realtoken-xdai',
  cache: new InMemoryCache(),
})

export const EthereumClient = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/realtoken-thegraph/realtoken-eth',
  cache: new InMemoryCache(),
})

export const RMM2Client = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/realtoken-thegraph/rmm-realt',
  cache: new InMemoryCache(),
})

export const RMM3Client = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/realtoken-thegraph/rmm-v3-gnosis',
  cache: new InMemoryCache(),
})

export const RMM3WrapperClient = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/realtoken-thegraph/rmm-v3-wrapper-gnosis',
  cache: new InMemoryCache(),
})

export const LevinSwapClient = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/levinswap/uniswap-v2',
  cache: new InMemoryCache(),
})

export const YamStatisticsClient = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/jycssu-com/yam-history-gnosis',
  cache: new InMemoryCache(),
})
