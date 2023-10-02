import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

import { Box, Card, Title } from '@mantine/core'

import _sumBy from 'lodash/sumBy'

import {
  OwnedRealtoken,
  selectOwnedRealtokens,
  selectOwnedRealtokensRents,
  selectOwnedRealtokensValue,
} from 'src/store/features/wallets/walletsSelector'

import useEURUSDRate from 'src/store/features/rates/useEURUSDRate'
import { APIRealTokenCurrency } from 'src/types/APIRealToken'
import { RootState } from 'src/store/store'

import {
  CurrencyField,
  DecimalField,
  IntegerField,
  StringField,
} from '../../commons'

const RentedUnitsField: FC<{ label: string; realtokens: OwnedRealtoken[] }> = (
  props
) => {
  const { t } = useTranslation('common', { keyPrefix: 'numbers' })

  const totalValue = _sumBy(props.realtokens, 'totalUnits')
  const rentedValue = _sumBy(props.realtokens, 'rentedUnits')

  const total = t('integer', { value: totalValue })
  const rented = t('integer', { value: rentedValue })
  const percent = t('percentInteger', {
    value: totalValue ? (rentedValue / totalValue) * 100 : 0 * 100,
  })

  return (
    <StringField
      label={props.label}
      value={`${rented} / ${total} (${percent})`}
    />
  )
}
RentedUnitsField.displayName = 'RentedUnitsField'

export const PropertiesCard: FC = () => {
  const { t } = useTranslation('common', { keyPrefix: 'propertiesCard' })

  const value = useSelector(selectOwnedRealtokensValue)
  const realtokens = useSelector(selectOwnedRealtokens)
  const rents = useSelector(selectOwnedRealtokensRents)

  const sumRealtokens = _sumBy(realtokens, 'amount')
  const sumProperties = realtokens.length

  // In Dollars
  let meanValue = value ? value / sumProperties : 0
  let meanRents = rents.yearly ? rents.yearly / sumProperties : 0

  const currency = useSelector((state : RootState) => state.currency.value);
  const eURUSDRate = useEURUSDRate();

  if (currency === APIRealTokenCurrency.EUR && eURUSDRate) {
    // Dollars to Euros
    meanValue = meanValue / eURUSDRate;
    meanRents = meanRents / eURUSDRate;
  }

  return (
    <Card shadow={'sm'} radius={'md'} style={{ height: '100%' }}>
      <Title order={4}>{t('title')}</Title>
      <Box mx={'sm'} mt={'xs'}>
        <DecimalField label={t('tokens')} value={sumRealtokens} />
        <IntegerField label={t('properties')} value={sumProperties} />
        <CurrencyField label={t('averageValue')} value={meanValue} />
        <CurrencyField label={t('averageRent')} value={meanRents} />
        <RentedUnitsField label={t('rentedUnits')} realtokens={realtokens} />
      </Box>
    </Card>
  )
}
