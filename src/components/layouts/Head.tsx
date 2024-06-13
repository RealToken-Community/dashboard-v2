import { FC } from 'react'

import { default as NextHead } from 'next/head'
import { StaticImageData } from 'next/image'

import { ColorSchemeScript } from '@mantine/core'

type HeadProps = {
  title: string
  description: string
  favicon: StaticImageData
}

export const Head: FC<HeadProps> = ({ title, description, favicon }) => {
  return (
    <div>
      <NextHead>
        <title>{title}</title>
        <meta
          name={'viewport'}
          content={'width=device-width, initial-scale=1.0'}
        />
        <meta name={'Description'} content={description} />
        <link rel={'icon'} href={favicon.src} />
        <ColorSchemeScript />
      </NextHead>
    </div>
  )
}
