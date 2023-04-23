import { FC, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Provider } from 'react-redux'

import { GetServerSidePropsContext } from 'next'
import type { AppProps as NextAppProps } from 'next/app'

import { ColorScheme } from '@mantine/core'

import { getCookie } from 'cookies-next'
import { Provider as JotaiProvider } from 'jotai'

import { Head } from 'src/components'
import 'src/i18next'
import { Layout } from 'src/layouts'
import { MantineProviders } from 'src/providers'
import InitStoreProvider from 'src/providers/InitStoreProvider'
import store from 'src/store/store'

type TestProps = {
  initialLocale: string
}

const LanguageInit: FC<TestProps> = ({ initialLocale }) => {
  const { i18n } = useTranslation()
  const [lng] = useState<string>(initialLocale)

  useEffect(() => {
    if (i18n.language !== lng) {
      i18n.changeLanguage(lng)
    }
  }, [i18n, lng])

  return null
}

type AppProps = NextAppProps & { colorScheme: ColorScheme; locale: string }

const queryClient = new QueryClient({})

const App = ({ Component, pageProps, colorScheme, locale }: AppProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      <JotaiProvider>
        <Provider store={store}>
          <InitStoreProvider>
            <Head
              title={'Realtoken Dashboard'}
              description={
                'A Realtoken Dashboard for follow assets related to RealT'
              }
            />
            <MantineProviders initialColorScheme={colorScheme}>
              <LanguageInit initialLocale={locale} />
              <Layout>
                <Component {...pageProps} />
              </Layout>
            </MantineProviders>
          </InitStoreProvider>
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
