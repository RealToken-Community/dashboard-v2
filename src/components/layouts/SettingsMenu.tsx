import { FC, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux'

import {
  ActionIcon,
  Box,
  Button,
  Center,
  Menu,
  SegmentedControl,
  Select,
  useMantineColorScheme,
} from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { useDisclosure } from '@mantine/hooks'
import {
  IconCash,
  IconClock,
  IconClockOff,
  IconLanguage,
  IconMoon,
  IconSettings,
  IconSun,
} from '@tabler/icons'

import { setCookie } from 'cookies-next'

import { TransferDatabaseService } from 'src/repositories/transfers/TransferDatabase'
import {
  selectUserCurrency,
  selectUserRentCalculation,
  selectVersion,
} from 'src/store/features/settings/settingsSelector'
import {
  userCurrencyChanged,
  userRentCalculationChanged,
} from 'src/store/features/settings/settingsSlice'
import { Currency } from 'src/types/Currencies'
import {
  RentCalculation,
  RentCalculationState,
} from 'src/types/RentCalculation'
import { expiresLocalStorageCaches } from 'src/utils/useCache'

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

const RealtimeRentMenuItem: FC = () => {
  const dispatch = useDispatch()
  const rentCalculation = useSelector(selectUserRentCalculation)

  function setUserRentCalculation(rentCalculation: RentCalculation) {
    dispatch(userRentCalculationChanged(rentCalculation))
  }

  const { t } = useTranslation('common', { keyPrefix: 'settings' })

  return (
    <Box px={5}>
      <SegmentedControl
        color={'brand'}
        fullWidth={true}
        value={rentCalculation.state}
        onChange={(value) =>
          setUserRentCalculation({
            state: value as RentCalculationState,
            date: new Date().getTime(),
          })
        }
        data={[
          {
            value: RentCalculationState.Realtime,
            label: (
              <Center>
                <IconClock size={16} />
                <Box ml={'xs'}>{t('realtime')}</Box>
              </Center>
            ),
          },
          {
            value: RentCalculationState.Global,
            label: (
              <Center>
                <IconClockOff size={16} />
                <Box ml={'xs'}>{t('global')}</Box>
              </Center>
            ),
          },
        ]}
      />
    </Box>
  )
}

const RealtimeRentMenuSelectDate: FC = () => {
  const dispatch = useDispatch()
  const rentCalculation = useSelector(selectUserRentCalculation)

  const { i18n, t } = useTranslation('common', { keyPrefix: 'settings' })

  if (rentCalculation.state !== RentCalculationState.Realtime) return null

  const handleDateChange = (date: Date) => {
    dispatch(
      userRentCalculationChanged({
        state: rentCalculation.state,
        date: new Date(date).getTime(),
      }),
    )
  }

  return (
    <>
      <Menu.Label pb={0}>{t('date')}</Menu.Label>
      <DatePickerInput
        p={5}
        locale={i18n.language}
        valueFormat={t('dateFormat')}
        value={new Date(rentCalculation.date)}
        onChange={(value) => handleDateChange(value as Date)}
        defaultDate={new Date()}
      />
      <Menu.Divider />
    </>
  )
}

const RealtimeRentMenu = () => {
  return (
    <>
      <RealtimeRentMenuItem />
      <RealtimeRentMenuSelectDate />
      <Menu.Divider />
    </>
  )
}

const LanguageSelect: FC = () => {
  const { i18n, t } = useTranslation('common', { keyPrefix: 'settings' })

  const updateLocale = useCallback(
    (updatedLocale: string) => {
      if (i18n.language !== updatedLocale) {
        setCookie('react-i18next', updatedLocale, {
          maxAge: 60 * 60 * 24 * 365,
        })
        i18n.changeLanguage(updatedLocale)
      }
    },
    [i18n],
  )

  return (
    <>
      <Menu.Label pb={0}>{t('title')}</Menu.Label>
      <Select
        p={5}
        value={i18n.language}
        onChange={(value) => updateLocale(value!)}
        data={[
          { value: 'fr', label: t('french') },
          { value: 'en', label: t('english') },
        ]}
        leftSection={<IconLanguage size={16} />}
      />
    </>
  )
}

const CurrencySelect: FC = () => {
  const { t } = useTranslation('common', { keyPrefix: 'settings' })
  const dispatch = useDispatch()
  const userCurrency = useSelector(selectUserCurrency)

  function setUserCurrency(currency: Currency) {
    dispatch(userCurrencyChanged(currency))
  }

  return (
    <>
      <Menu.Label pb={0}>{t('currencyTitle')}</Menu.Label>
      <Select
        p={5}
        value={userCurrency}
        onChange={(value) => setUserCurrency(value as Currency)}
        data={[
          { value: Currency.USD, label: t('usd') },
          { value: Currency.EUR, label: t('eur') },
          { value: Currency.CHF, label: t('chf') },
        ]}
        leftSection={<IconCash size={16} />}
      />
    </>
  )
}

const RefreshDataButton: FC = () => {
  const { t } = useTranslation('common', { keyPrefix: 'settings' })
  const [loading, setLoading] = useState(false)

  async function refresh() {
    setLoading(true)
    try {
      expiresLocalStorageCaches()
      await TransferDatabaseService.dropDatabase()
      window.location.reload()
    } catch (error) {
      setLoading(false)
    }
  }

  return (
    <Box ta={'center'}>
      <Button
        onClick={refresh}
        size={'compact-sm'}
        variant={'subtle'}
        loading={loading}
      >
        {t('refreshDataButton')}
      </Button>
    </Box>
  )
}

export const SettingsMenu: FC = () => {
  const [isOpen, handlers] = useDisclosure(false)
  const version = useSelector(selectVersion)

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
        <RealtimeRentMenu />
        <ColorSchemeMenuItem />
        <Menu.Divider />
        <RefreshDataButton />
        <Menu.Divider />
        <Box
          ta={'center'}
          style={{
            fontStyle: 'italic',
            fontSize: '12px',
          }}
        >{`v${version}`}</Box>
      </Menu.Dropdown>
    </Menu>
  )
}
