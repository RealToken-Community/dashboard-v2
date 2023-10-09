import { FC, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import {
  ActionIcon,
  Box,
  Center,
  Menu,
  SegmentedControl,
  Select,
  useMantineColorScheme,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconLanguage, IconCash, IconMoon, IconSettings, IconSun } from '@tabler/icons'

import { setCookie } from 'cookies-next'
import { APIRealTokenCurrency } from 'src/types/APIRealToken'
import { useSelector, useDispatch } from 'react-redux'
import { setCurrency } from 'src/store/features/currencies/currenciesSlice'
import { RootState } from 'src/store/store'

const ColorSchemeMenuItem: FC = () => {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme()

  const { t } = useTranslation('common', { keyPrefix: 'settings' })

  return (
    <Box px={5}>
      <SegmentedControl
        color={'brand'}
        fullWidth={true}
        value={colorScheme}
        onChange={() => toggleColorScheme()}
        data={[
          {
            value: 'light',
            label: (
              <Center>
                <IconSun size={16} />
                <Box ml={'xs'}>{t('light')}</Box>
              </Center>
            ),
          },
          {
            value: 'dark',
            label: (
              <Center>
                <IconMoon size={16} />
                <Box ml={'xs'}>{t('dark')}</Box>
              </Center>
            ),
          },
        ]}
      />
    </Box>
  )
}

const LanguageSelect: FC = () => {
  const { i18n, t } = useTranslation('common', { keyPrefix: 'settings' })

  const updateLocale = useCallback(
    (updatedLocale: string) => {
      if (i18n.language !== updatedLocale) {
        setCookie('react-i18next', updatedLocale)
        i18n.changeLanguage(updatedLocale)
      }
    },
    [i18n]
  )

  return (
    <>
      <Menu.Label pb={0}>{t('title')}</Menu.Label>
      <Select
        p={5}
        value={i18n.language}
        onChange={updateLocale}
        data={[
          { value: 'fr', label: t('french') },
          { value: 'en', label: t('english') },
        ]}
        icon={<IconLanguage size={16} />}
      />
    </>
  )
}

const CurrencySelect: FC = () => {
  const { t } = useTranslation('common', { keyPrefix: 'settings' })

  const dispatch = useDispatch();
  const currency = useSelector((state : RootState) => state.currency.value);

  const updateCurrency = useCallback(
    (updatedCurrency: APIRealTokenCurrency) => {
      dispatch(setCurrency(updatedCurrency as APIRealTokenCurrency));
    },
    [dispatch]
  )

  return (
    <>
      <Menu.Label pb={0}>{t('currencyTitle')}</Menu.Label>
      <Select
        p={5}
        value={currency}
        onChange={updateCurrency}
        data={[
          { value: APIRealTokenCurrency.USD, label: t('usd') },
          { value: APIRealTokenCurrency.EUR, label: t('eur') },
        ]}
        icon={<IconCash size={16} />}
      />
    </>
  )
}

export const SettingsMenu: FC = () => {
  const [isOpen, handlers] = useDisclosure(false)

  return (
    <Menu
      closeOnItemClick={false}
      opened={isOpen}
      onOpen={handlers.open}
      onClose={handlers.close}
    >
      <Menu.Target>
        <ActionIcon size={36} color={'brand'}>
          <IconSettings size={20} aria-label={'Setting'} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <LanguageSelect />
        <Menu.Divider />
        <CurrencySelect />
        <Menu.Divider />
        <ColorSchemeMenuItem />
      </Menu.Dropdown>
    </Menu>
  )
}
