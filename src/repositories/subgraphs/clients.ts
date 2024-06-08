import { ApolloClient, InMemoryCache } from '@apollo/client'

const API_KEY = process.env.NEXT_PUBLIC_THEGRAPH_API_KEY

export const GnosisClient = new ApolloClient({
  uri: `https://gateway-arbitrum.network.thegraph.com/api/${API_KEY}/subgraphs/id/FPPoFB7S2dcCNrRyjM5QbaMwKqRZPdbTg8ysBrwXd4SP`,
  cache: new InMemoryCache(),
})

export const EthereumClient = new ApolloClient({
  uri: `https://gateway-arbitrum.network.thegraph.com/api/${API_KEY}/subgraphs/id/EVjGN4mMd9h9JfGR7yLC6T2xrJf9syhjQNboFb7GzxVW`,
  cache: new InMemoryCache(),
})

export const RMM2Client = new ApolloClient({
  uri: `https://gateway-arbitrum.network.thegraph.com/api/${API_KEY}/subgraphs/id/CxvZgcPjmtvFeSoSW9N563K7ZcHCwLVv8kXMbmuBKhv1`,
  cache: new InMemoryCache(),
})

export const RMM3Client = new ApolloClient({
  uri: `https://gateway-arbitrum.network.thegraph.com/api/${API_KEY}/subgraphs/id/2xrWGGZ5r8Z7wdNdHxhbRVKcAD2dDgv3F2NcjrZmxifJ`,
  cache: new InMemoryCache(),
})

export const RMM3WrapperClient = new ApolloClient({
  uri: `https://gateway-arbitrum.network.thegraph.com/api/${API_KEY}/subgraphs/id/2dMMk7DbQYPX6Gi5siJm6EZ2gDQBF8nJcgKtpiPnPBsK`,
  cache: new InMemoryCache(),
})

export const LevinSwapClient = new ApolloClient({
  uri: `https://gateway-arbitrum.network.thegraph.com/api/${API_KEY}/subgraphs/id/2zkYvVc8xsmytcEjE9pr523qFcbvqRGxhuGGtraozs66`,
  cache: new InMemoryCache(),
})

export const YamStatisticsClient = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/jycssu-com/yam-history-gnosis',
  // uri: `https://gateway-arbitrum.network.thegraph.com/api/${API_KEY}/subgraphs/id/4eJa4rKCR5f8fq48BKbYBPvf7DWHppGZRvfiVUSFXBGR`,
  cache: new InMemoryCache(),
})
