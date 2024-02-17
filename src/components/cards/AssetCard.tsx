import { FC, memo } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

import Image from 'next/image'

import { Badge, Card, Group } from '@mantine/core'

import moment from 'moment'

import { useCurrencyValue } from 'src/hooks/useCurrencyValue'
import { selectUserRentCalculation } from 'src/store/features/settings/settingsSelector'
import { UserRealtoken } from 'src/store/features/wallets/walletsSelector'
import { RentCalculationState } from 'src/types/RentCalculation'

import {
  Divider,
  RentStatusTag,
  RmmStatusTag,
  SubsidyStatusTag,
} from '../commons'
import styles from './AssetCard.module.sass'

interface AssetCardProps {
  value: UserRealtoken
  onClick?: (id: string) => unknown
}

const AssetCardComponent: FC<AssetCardProps> = (props) => {
  const { t: tNumbers } = useTranslation('common', { keyPrefix: 'numbers' })
  const { t } = useTranslation('common', { keyPrefix: 'assetCard' })

  const rentCalculation = useSelector(selectUserRentCalculation)

  const realtimeDate = moment(new Date(rentCalculation.date))
  const rentStartDate = new Date(props.value.rentStartDate.date)
  const isDisabled =
    rentCalculation.state === RentCalculationState.Realtime &&
    rentStartDate > realtimeDate.toDate()

  const rentNotStarted = t('rentNotStarted')
  const isSubsidized =
    props.value.subsidyStatus !== 'no' && props.value.subsidyStatusValue

  // In Dollars
  const value = props.value.value
  const weeklyAmount = props.value.amount * props.value.netRentDayPerToken * 7
  const yearlyAmount = props.value.amount * props.value.netRentYearPerToken
  const totalInvestment = props.value.totalInvestment

  return (
    <Card
      shadow={'sm'}
      radius={'md'}
      withBorder={true}
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      className={props.onClick ? styles.clickable : undefined}
      onClick={() => props.onClick?.(props.value.id)}
    >
      <Card.Section>
        <div
          className={
            styles.imageContainer + ' ' + (isDisabled ? styles.disabled : '')
          }
          data-value={rentNotStarted}
        >
          <Image
            src={props.value.imageLink[0]}
            width={400}
            height={300}
            objectFit={'cover'}
            alt={props.value.fullName}
          />
        </div>
      </Card.Section>

      <Group justify={'space-between'} mt={'md'}>
        <div className={styles.textBold}>{props.value.shortName}</div>
        <Badge variant={'light'}>{useCurrencyValue(value)}</Badge>
      </Group>

      <Group justify={'left'} mt={'xs'}>
        <RentStatusTag value={props.value} />
        <SubsidyStatusTag value={props.value} />
        {props.value.isRmmAvailable ? <RmmStatusTag /> : null}
      </Group>

      <Divider height={1} my={'xs'} />

      <div className={styles.groupApart}>
        <div className={styles.textSm}>{t('tokens')}</div>
        <div className={styles.textSm}>
          {tNumbers('decimal', { value: props.value.amount })}
          {' / '}
          {tNumbers('integer', { value: props.value.totalTokens })}
        </div>
      </div>

      <div className={styles.groupApart}>
        <div className={styles.textSm}>{t('apr')}</div>
        <div className={styles.textSm}>
          {tNumbers('percent', { value: props.value.annualPercentageYield })}
        </div>
      </div>

      <div className={styles.groupApart}>
        <div className={styles.textSm}>{t('weekly')}</div>
        <div className={styles.textSm}>{useCurrencyValue(weeklyAmount)}</div>
      </div>

      <div className={styles.groupApart}>
        <div className={styles.textSm}>{t('yearly')}</div>
        <div className={styles.textSm}>{useCurrencyValue(yearlyAmount)}</div>
      </div>

      <div className={styles.groupApart}>
        <div className={styles.textSm}>{t('rentedUnits')}</div>
        <div className={styles.textSm}>
          {tNumbers('integer', { value: props.value.rentedUnits })}
          {' / '}
          {tNumbers('integer', { value: props.value.totalUnits })}
          {` (${tNumbers('percentInteger', {
            value: (props.value.rentedUnits / props.value.totalUnits) * 100,
          })})`}
        </div>
      </div>

      {isSubsidized && (
        <div className={styles.groupApart}>
          <div className={styles.textSm}>{t('subsidy')}</div>
          <div className={styles.textSm}>
            {tNumbers('percentInteger', {
              value:
                (props.value.subsidyStatusValue / props.value.grossRentMonth) *
                100,
            })}
          </div>
        </div>
      )}

      <div className={styles.groupApart}>
        <div className={styles.textSm}>{t('propertyValue')}</div>
        <div className={styles.textSm}>{useCurrencyValue(totalInvestment)}</div>
      </div>

      <div className={styles.groupApart}>
        <div className={styles.textSm}>{t('rentStartDate')}</div>
        <div className={styles.textSm}>
          {rentStartDate.toLocaleDateString()}
        </div>
      </div>

      <div style={{ flex: '1 1 auto' }} />
      <Divider height={1} my={'xs'} />

      <div className={styles.textLocation}>{props.value.fullName}</div>
    </Card>
  )
}

export const AssetCard = memo(AssetCardComponent)
