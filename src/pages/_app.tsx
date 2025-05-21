import { useEffect } from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Provider } from 'react-redux'

import { GetServerSidePropsContext } from 'next'
import type { AppProps as NextAppProps } from 'next/app'
import { Router } from 'next/router'

import { MantineColorScheme } from '@mantine/core'
import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'
import '@mantine/notifications/styles.css'
import {
  CHAINS,
  ChainSelectConfig,
  ChainsID,
  ConnectorsAvailable,
  LanguageInit,
  Chain as RealtChains,
  Web3Providers,
  getConnectors,
  getReadOnlyConnector,
  getWalletConnectV2,
  initLanguage,
  metaMask,
  metaMaskHooks,
  parseAllowedChain,
} from '@realtoken/realt-commons'
import { init as initMatomoNext } from '@socialgouv/matomo-next'

import { getCookie } from 'cookies-next'
import { Provider as JotaiProvider } from 'jotai'

import { Favicon } from 'src/assets'
import { Head, MainLayout } from 'src/components/layouts'
import 'src/i18next'
import { resources } from 'src/i18next'
import { MantineProviders } from 'src/providers'
import InitStoreProvider from 'src/providers/InitStoreProvider'
import store from 'src/store/store'

// Matomo property added to window object
declare global {
  interface Window {
    _paq?: unknown[]
  }
}

const i18n = initLanguage(resources)

type AppProps = NextAppProps & {
  colorScheme: MantineColorScheme
  locale: string
  env: {
    THEGRAPH_API_KEY: string
    MATOMO_URL: string
    MATOMO_SITE_ID: string
  }
}

const queryClient = new QueryClient({})

const dashbordChains: ChainSelectConfig<RealtChains> = {
  allowedChains: parseAllowedChain(ChainsID),
  chainsConfig: CHAINS,
  // Explicitly setting Gnosis as the defaultChainId to ensure compatibility with read-only addresses.
  defaultChainId: ChainsID.Gnosis,
}

const env = process.env.NEXT_PUBLIC_ENV ?? 'development'
const walletConnectKey = process.env.NEXT_PUBLIC_WALLET_CONNECT_KEY ?? ''

const readOnly = getReadOnlyConnector(dashbordChains)
const walletConnect = getWalletConnectV2(
  dashbordChains,
  env,
  walletConnectKey,
  false,
)

const libraryConnectors = getConnectors({
  readOnly: readOnly,
  metamask: [metaMask, metaMaskHooks],
  walletConnectV2: walletConnect,
} as unknown as ConnectorsAvailable)

export const getServerSideProps = async () => ({
  props: {
    THEGRAPH_API_KEY: process.env.THEGRAPH_API_KEY,
    MATOMO_URL: process.env.MATOMO_URL,
    MATOMO_SITE_ID: process.env.MATOMO_SITE_ID,
  },
})

const App = ({ Component, pageProps, colorScheme, env }: AppProps) => {
  if (typeof window !== 'undefined') {
    process.env = { ...process.env, ...env }
  }
  function scrollToTop() {
    document.getElementById('main-layout-container')?.scroll({
      top: 0,
      left: 0,
      behavior: 'auto',
    })
    Router.events.off('routeChangeComplete', scrollToTop)
  }
  Router.events.on('routeChangeComplete', scrollToTop)

  // Event tracking
  useEffect(() => {
    // eslint-disable-next-line no-underscore-dangle
    if (!window._paq) {
      // Note: Triggered twice on page load when using strict mode in DEV
      initMatomoNext({
        url: process.env.MATOMO_URL ?? '',
        siteId: process.env.MATOMO_SITE_ID ?? '',
        disableCookies: true,
        // excludeUrlsPatterns: [/^\/login.php/, /\?token=.+/],
      })
    }
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <JotaiProvider>
        <Provider store={store}>
          <Web3Providers libraryConnectors={libraryConnectors}>
            <InitStoreProvider>
              <Head
                title={'Realtoken Dashboard'}
                description={
                  'A Realtoken Dashboard for follow assets related to RealT'
                }
                favicon={Favicon}
              />
              <MantineProviders initialColorScheme={colorScheme}>
                <LanguageInit i={i18n} />
                <MainLayout>
                  <Component {...pageProps} />
                </MainLayout>
              </MantineProviders>
            </InitStoreProvider>
          </Web3Providers>
        </Provider>
      </JotaiProvider>
    </QueryClientProvider>
  )
}

App.getInitialProps = ({ ctx }: { ctx: GetServerSidePropsContext }) => {
  return {
    env: {
      THEGRAPH_API_KEY: process.env.THEGRAPH_API_KEY,
      MATOMO_URL: process.env.MATOMO_URL,
      MATOMO_SITE_ID: process.env.MATOMO_SITE_ID,
    },
    colorScheme: getCookie('mantine-color-scheme', ctx) || 'dark',
    locale: getCookie('react-i18next', ctx) || 'fr',
  }
}

export default App
