import { FC } from 'react'

import { ActionIcon, Box, Group, Image, Title } from '@mantine/core'
import {
  IconBrandDiscord,
  IconBrandMedium,
  IconBrandTelegram,
} from '@tabler/icons'

import { Logo } from 'src/assets'

import { Divider } from '../commons'
import styles from './Footer.module.sass'

const LogoWithName: FC = () => {
  return (
    <Group align={'center'} gap={'xs'}>
      <Image src={Logo.src} alt={'RealT Logo'} style={{ width: '36px' }} />
      <Title order={3}>{'RealToken Community'}</Title>
    </Group>
  )
}

export const Footer: FC = () => {
  const FooterButtons: FC = () => {
    return (
      <Group>
        <ActionIcon
          variant={'subtle'}
          component={'a'}
          href={'https://discord.gg/9fQz6jYmcT'}
          aria-label={'Discord'}
          target={'_blank'}
        >
          <IconBrandDiscord />
        </ActionIcon>

        <ActionIcon
          variant={'subtle'}
          component={'a'}
          href={'https://t.me/Realtoken_welcome/'}
          aria-label={'Telegram'}
          target={'_blank'}
        >
          <IconBrandTelegram />
        </ActionIcon>
        <ActionIcon
          variant={'subtle'}
          component={'a'}
          href={'https://realt.co/blog/'}
          aria-label={'Blog'}
          target={'_blank'}
        >
          <IconBrandMedium />
        </ActionIcon>
      </Group>
    )
  }

  return (
    <div>
      <Divider />
      <Box className={styles.container}>
        <Group justify={'space-between'} align={'center'}>
          <LogoWithName />
          <FooterButtons />
        </Group>
      </Box>
    </div>
  )
}
