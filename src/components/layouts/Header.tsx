import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

import { useRouter } from 'next/router'

import {
  Box,
  Burger,
  Drawer,
  Group,
  Image,
  NavLink,
  Title,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import {
  IconExternalLink,
  IconFilePencil,
  IconHome2,
  IconReceipt,
} from '@tabler/icons'

import { Logo } from 'src/assets'
import { selectTransfersIsLoaded } from 'src/store/features/transfers/transfersSelector'

import { Divider } from '../commons'
import styles from './Header.module.sass'
import { SettingsMenu } from './SettingsMenu'
import { WalletMenu } from './WalletMenu'

const LogoWithName: FC = () => {
  const { t } = useTranslation('common', { keyPrefix: 'header' })

  return (
    <Group align={'center'} gap={'xs'} className={styles.logo}>
      <Image src={Logo.src} alt={'RealT Logo'} style={{ width: '36px' }} />
      <Title order={3}>{t('title')}</Title>
    </Group>
  )
}

const HeaderButtons: FC = () => {
  return (
    <Group gap={10}>
      <WalletMenu />
      <SettingsMenu />
    </Group>
  )
}

export const Header: FC = () => {
  const router = useRouter()
  const { t } = useTranslation('common', { keyPrefix: 'header' })
  const transfersIsLoaded = useSelector(selectTransfersIsLoaded)

  const [opened, { open, close }] = useDisclosure(false)

  return (
    <>
      <Drawer opened={opened} onClose={close} title={t('title')} size={'xs'}>
        <NavLink
          label={t('home')}
          leftSection={<IconHome2 size={'1rem'} stroke={1.5} />}
          onClick={() => router.push('/').then(() => close())}
        />

        {transfersIsLoaded ? (
          <NavLink
            label={t('transactions')}
            leftSection={<IconReceipt size={'1rem'} stroke={1.5} />}
            onClick={() => router.push('/transactions').then(() => close())}
          />
        ) : null}
        <NavLink
          label={t('histories')}
          leftSection={<IconFilePencil size={'1rem'} stroke={1.5} />}
          onClick={() => router.push('/histories').then(() => close())}
        />

        <div style={{ marginTop: '20px' }} />
        <NavLink
          component={'a'}
          href={'https://community-realt.gitbook.io/tuto-community/'}
          target={'_blank'}
          label={t('documentation')}
          leftSection={<IconExternalLink size={'1rem'} stroke={1.5} />}
        />
        <NavLink
          component={'a'}
          href={'https://realt.co/'}
          target={'_blank'}
          label={t('realt')}
          leftSection={<IconExternalLink size={'1rem'} stroke={1.5} />}
        />
        <NavLink
          component={'a'}
          href={'https://rmm.realtoken.network/'}
          target={'_blank'}
          label={t('RMM')}
          leftSection={<IconExternalLink size={'1rem'} stroke={1.5} />}
        />
        <NavLink
          component={'a'}
          href={'https://yam.realtoken.network/'}
          target={'_blank'}
          label={t('YAM')}
          leftSection={<IconExternalLink size={'1rem'} stroke={1.5} />}
        />
      </Drawer>
      <div>
        <Box className={styles.container}>
          <Group justify={'space-between'} align={'center'}>
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
