import { FC } from 'react'
import { useTranslation } from 'react-i18next'

import {
  Box,
  Group,
  Image,
  MediaQuery,
  Title,
  createStyles,
} from '@mantine/core'

import { Logo } from 'src/assets'

import { Divider } from '../commons'
import { SettingsMenu } from './SettingsMenu'
import { WalletMenu } from './WalletMenu'

const useStyles = createStyles((theme) => ({
  container: {
    padding: theme.spacing.xs,
  },
}))

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
  const { classes } = useStyles()

  return (
    <div>
      <Box className={classes.container}>
        <Group position={'apart'} align={'center'}>
          <LogoWithName />
          <HeaderButtons />
        </Group>
      </Box>
      <Divider />
    </div>
  )
}
