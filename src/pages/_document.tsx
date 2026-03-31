import {
  Head,
  Html,
  Main,
  default as NextDocument,
  NextScript,
} from 'next/document'

import { ColorSchemeScript } from '@mantine/core'

export default class _Document extends NextDocument {
  render() {
    return (
      <Html data-mantine-color-scheme={'light'}>
        <Head>
          <ColorSchemeScript defaultColorScheme={'light'} />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function () {
                  var html = document.documentElement;
                  var current = html.getAttribute('data-mantine-color-scheme');
                  if (current !== 'light' && current !== 'dark') {
                    html.setAttribute('data-mantine-color-scheme', 'light');
                  }
                })();
              `,
            }}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
