import { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { useRouter } from 'next/router'

import {
  Box,
  Burger,
  Drawer,
  Group,
  Image,
  MediaQuery,
  NavLink,
  Title,
  createStyles,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconExternalLink, IconHome2, IconFilePencil } from '@tabler/icons'

import { Logo } from 'src/assets'

import { Divider } from '../commons'
import { SettingsMenu } from './SettingsMenu'
import { WalletMenu } from './WalletMenu'

const useStyles = createStyles((theme) => ({
  container: {
    padding: theme.spacing.xs,
  },
}))

const useLogoStyles = createStyles(() => ({
  logo: {
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
  },
}))

const LogoWithName: FC = () => {
  const { t } = useTranslation('common', { keyPrefix: 'header' })
  const { classes } = useLogoStyles()

  return (
    <MediaQuery smallerThan={'xs'} styles={{ display: 'none' }}>
      <Group align={'center'} spacing={'xs'} className={classes.logo}>
        <Image src={Logo.src} alt={'RealT Logo'} width={36} />
        <Title order={3}>{t('title')}</Title>
      </Group>
    </MediaQuery>
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
  const router = useRouter()
  const { t } = useTranslation('common', { keyPrefix: 'header' })

  const [opened, { open, close }] = useDisclosure(false)

  return (
    <>
      <Drawer opened={opened} onClose={close} title={t('title')} size={'xs'}>
        <NavLink
          label={t('home')}
          icon={<IconHome2 size={'1rem'} stroke={1.5} />}
          onClick={() => router.push('/').then(() => close())}
        />

        <NavLink
          label={t('histories')}
          icon={<IconFilePencil size={'1rem'} stroke={1.5} />}
          onClick={() => router.push('/histories').then(() => close())}
        />

        <div style={{ marginTop: '20px' }} />
        <NavLink
          component={'a'}
          href={'https://community-realt.gitbook.io/tuto-community/'}
          target={'_blank'}
          label={t('documentation')}
          icon={<IconExternalLink size={'1rem'} stroke={1.5} />}
        />
        <NavLink
          component={'a'}
          href={'https://realt.co/'}
          target={'_blank'}
          label={t('realt')}
          icon={<IconExternalLink size={'1rem'} stroke={1.5} />}
        />
        <NavLink
          component={'a'}
          href={'https://rmm.realtoken.network/'}
          target={'_blank'}
          label={t('RMM')}
          icon={<IconExternalLink size={'1rem'} stroke={1.5} />}
        />
        <NavLink
          component={'a'}
          href={'https://yam.realtoken.network/'}
          target={'_blank'}
          label={t('YAM')}
          icon={<IconExternalLink size={'1rem'} stroke={1.5} />}
        />
      </Drawer>
      <div>
        <Box className={classes.container}>
          <Group position={'apart'} align={'center'}>
            <Burger opened={opened} onClick={open} />
            <LogoWithName />
            <HeaderButtons />
          </Group>
        </Box>
        <Divider />
      </div>
    </>
  )
}
