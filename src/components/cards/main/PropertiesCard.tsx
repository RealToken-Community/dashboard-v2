import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

import { Box, Card, Title } from '@mantine/core'

import _sumBy from 'lodash/sumBy'

import {
  UserRealtoken,
  selectOwnedRealtokens,
  selectOwnedRealtokensRents,
  selectOwnedRealtokensValue,
} from 'src/store/features/wallets/walletsSelector'

import {
  CurrencyField,
  DecimalField,
  IntegerField,
  StringField,
} from '../../commons'

const RentedUnitsField: FC<{ label: string; realtokens: UserRealtoken[] }> = (
  props,
) => {
  console.log({ realtokens: props.realtokens })
  console.log({
    units: props.realtokens
      .filter((r) => r.rentedUnits !== r.totalUnits)
      .map((r) => {
        if (r.history.length > 0) {
          let propInfo = r.history[0].values
          const history = r.history.map((h) => {
            return { ...propInfo, ...h.values }
          })

          // Find last rent from history where property was fully rented
          for (const h of history.reverse()) {
            if (h.rentedUnits === r.totalTokens && h.netRentYear) {
              return {
                total: r.totalUnits,
                rented: r.rentedUnits,
                yearlyRentPerTokenIfFullyRented: h.netRentYear / r.totalTokens,
              }
            }
          }
        }

        // If no history, use current values
        // please note that this estimation is most of the time underestimating the real value
        // because maintenance cost is take into account but not shared between all the units
        return {
          total: r.totalUnits,
          rented: r.rentedUnits,
          netRentYearPerToken: r.netRentYearPerToken,
          yearlyRentPerTokenIfFullyRented: r.rentedUnits
            ? (r.netRentYearPerToken * r.totalUnits) / r.rentedUnits
            : NaN,
        }
      }),
  })
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

  const realtokensValue = useSelector(selectOwnedRealtokensValue)
  const realtokens = useSelector(selectOwnedRealtokens)
  const rents = useSelector(selectOwnedRealtokensRents)

  const sumRealtokens = _sumBy(realtokens, 'amount')
  const sumProperties = realtokens.length

  const meanValue = realtokensValue.total
    ? realtokensValue.total / sumProperties
    : 0
  const meanRents = rents.yearly ? rents.yearly / sumProperties : 0

  return (
    <Card shadow={'sm'} radius={'md'} style={{ height: '100%' }}>
      <Title order={4}>{t('title')}</Title>
      <Box mx={'sm'}>
        <DecimalField label={t('tokens')} value={sumRealtokens} />
        <IntegerField label={t('properties')} value={sumProperties} />
        <CurrencyField label={t('averageValue')} value={meanValue} />
        <CurrencyField label={t('averageYearlyRent')} value={meanRents} />
        <RentedUnitsField label={t('rentedUnits')} realtokens={realtokens} />
      </Box>
    </Card>
  )
}
