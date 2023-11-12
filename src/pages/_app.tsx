import { QueryClient, QueryClientProvider } from 'react-query'
import { Provider } from 'react-redux'

import { GetServerSidePropsContext } from 'next'
import type { AppProps as NextAppProps } from 'next/app'
import { Router } from 'next/router'

import { ColorScheme } from '@mantine/core'

import { getCookie } from 'cookies-next'
import { Provider as JotaiProvider } from 'jotai'

import { Head, MainLayout } from 'src/components/layouts'
import 'src/i18next'
import { MantineProviders } from 'src/providers'
import InitStoreProvider from 'src/providers/InitStoreProvider'
import store from 'src/store/store'
import { resources } from 'src/i18next'

import { 
  CHAINS,
  ChainSelectConfig,
  ChainsID,
  Web3Providers,  
  getConnectors, 
  getReadOnlyConnector, 
  getWalletConnectV2, 
  gnosisHooks, 
  gnosisSafe, 
  metaMask, 
  metaMaskHooks, 
  parseAllowedChain,
  Chain as RealtChains,
  initLanguage,
  LanguageInit,
} from '@realtoken/realt-commons'

const i18n = initLanguage(resources);

type AppProps = NextAppProps & { colorScheme: ColorScheme; locale: string }

const queryClient = new QueryClient({})

const dashbordChains: ChainSelectConfig<RealtChains> = {
  allowedChains: parseAllowedChain(ChainsID),
  chainsConfig: CHAINS
}

const env = process.env.NEXT_PUBLIC_ENV ?? "development";
const walletConnectKey = process.env.NEXT_PUBLIC_WALLET_CONNECT_KEY ?? "";

const readOnly = getReadOnlyConnector(dashbordChains);
const walletConnect = getWalletConnectV2(dashbordChains, env, walletConnectKey, false)

const libraryConnectors = getConnectors(
  {
    metamask: [metaMask, metaMaskHooks],
    gnosisSafe: [gnosisSafe, gnosisHooks],
    readOnly: readOnly,
    walletConnectV2: walletConnect
  }
);

const App = ({ Component, pageProps, colorScheme, locale }: AppProps) => {
  function scrollToTop() {
    document.getElementById('main-layout-container')?.scroll({
      top: 0,
      left: 0,
      behavior: 'auto',
    })
    Router.events.off('routeChangeComplete', scrollToTop)
  }
  Router.events.on('routeChangeComplete', scrollToTop)

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

App.getInitialProps = ({ ctx }: { ctx: GetServerSidePropsContext }) => ({
  colorScheme: getCookie('mantine-color-scheme', ctx) || 'dark',
  locale: getCookie('react-i18next', ctx) || 'fr',
})

export default App
