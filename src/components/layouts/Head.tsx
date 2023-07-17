import { FC } from 'react'

import { default as NextHead } from 'next/head'

type HeadProps = {
  title: string
  description: string
}

export const Head: FC<HeadProps> = ({ title, description }) => {
  return (
    <div>
      <NextHead>
        <title>{title}</title>
        <meta
          name={'viewport'}
          content={'width=device-width, initial-scale=1.0'}
        />
        <meta name={'Description'} content={description} />
      </NextHead>
    </div>
  )
}
