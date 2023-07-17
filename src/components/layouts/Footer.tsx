import { FC } from 'react'

import {
  ActionIcon,
  Box,
  Group,
  Image,
  Title,
  createStyles,
} from '@mantine/core'
import { NextLink } from '@mantine/next'
import {
  IconBrandDiscord,
  IconBrandMedium,
  IconBrandTelegram,
} from '@tabler/icons'

import { Logo } from 'src/assets'

import { Divider } from '../commons'

const useStyles = createStyles((theme) => ({
  container: {
    [theme.fn.smallerThan('xs')]: {
      padding: theme.spacing.xs,
    },

    [theme.fn.largerThan('xs')]: {
      padding: theme.spacing.md,
    },
  },
}))

const LogoWithName: FC = () => {
  return (
    <Group align={'center'} spacing={'xs'}>
      <Image src={Logo.src} alt={'RealT Logo'} width={30} />
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
          component={NextLink}
          href={'https://discord.gg/9fQz6jYmcT'}
          aria-label={'Discord'}
          target={'_blank'}
        >
          <IconBrandDiscord />
        </ActionIcon>

        <ActionIcon
          variant={'subtle'}
          component={NextLink}
          href={'https://t.me/Realtoken_welcome/'}
          aria-label={'Telegram'}
          target={'_blank'}
        >
          <IconBrandTelegram />
        </ActionIcon>
        <ActionIcon
          variant={'subtle'}
          component={NextLink}
          href={'https://realt.co/blog/'}
          aria-label={'Blog'}
          target={'_blank'}
        >
          <IconBrandMedium />
        </ActionIcon>
      </Group>
    )
  }

  const { classes } = useStyles()

  return (
    <div>
      <Divider />
      <Box className={classes.container}>
        <Group position={'apart'} align={'center'}>
          <LogoWithName />
          <FooterButtons />
        </Group>
      </Box>
    </div>
  )
}
