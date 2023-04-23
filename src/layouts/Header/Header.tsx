import { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { useRouter } from 'next/router'

import { Box, Group, Image, MediaQuery, Title } from '@mantine/core'

import { Logo } from 'src/assets'
import { WalletMenu } from 'src/components/WalletMenu'

import { Divider, SettingsMenu } from '../../components'
import { styles } from './Header.styles'

const LogoWithName: FC = () => {
  const { t } = useTranslation('common', { keyPrefix: 'header' })

  return (
    <Group align={'center'} spacing={'xs'}>
      <Image src={Logo.src} alt={'RealT Logo'} width={36} />
      <MediaQuery smallerThan={'xs'} styles={{ display: 'none' }}>
        <Title order={3}>{t('title')}</Title>
      </MediaQuery>
    </Group>
  )
}

const HeaderButtons: FC = () => {
  return (
    <Group spacing={10}>
      <WalletMenu />
      <SettingsMenu />
    </Group>
  )
}

export const Header: FC = () => {
  return (
    <div>
      <Box sx={styles.container}>
        <Group position={'apart'} align={'center'}>
          <LogoWithName />
          <HeaderButtons />
        </Group>
      </Box>
      <Divider />
    </div>
  )
}
