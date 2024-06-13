import { FC } from 'react'

import { default as NextHead } from 'next/head'

import { ColorSchemeScript } from '@mantine/core'

import { StaticImageData } from 'next/image';

type HeadProps = {
  title: string
  description: string
  favicon: StaticImageData;
}

export const Head: FC<HeadProps> = ({ title, description, favicon }) => {

  const faviconUrl = typeof favicon === 'string' ? favicon : favicon?.src;

  return (
    <div>
      <NextHead>
        <title>{title}</title>
        <meta
          name={'viewport'}
          content={'width=device-width, initial-scale=1.0'}
        />
        <meta name={'Description'} content={description} />
        <link rel="icon" href={faviconUrl} />
        <ColorSchemeScript />
      </NextHead>
    </div>
  )
}
