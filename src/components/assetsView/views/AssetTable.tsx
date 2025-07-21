import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

import { useRouter } from 'next/router'

import { Anchor, Badge, ScrollArea, Table } from '@mantine/core'

import moment from 'moment'

import { useCurrencyValue } from 'src/hooks/useCurrencyValue'
import { useFullyRentedAPR } from 'src/hooks/useFullyRentedAPR'
import { selectTransfersIsLoaded } from 'src/store/features/transfers/transfersSelector'
import {
  OtherRealtoken,
  UserRealtoken,
} from 'src/store/features/wallets/walletsSelector'

import {
  IconCalendarTime,
  IconCheck,
  IconCircleNumber1,
  IconCircleNumber2,
  IconCircleNumber3,
  IconHammer,
  IconHomeCheck,
  IconTrafficCone,
  IconTrash,
} from '@tabler/icons'
import { RealTokenToBeFixedStatus } from 'src/types/APIPitsBI'

export const AssetTable: FC<{
  realtokens: (UserRealtoken | OtherRealtoken)[]
}> = (props) => {
  return (
    <ScrollArea>
      <Table>
        <Table.Thead>
          <AssetTableHeader />
        </Table.Thead>

        <Table.Tbody>
          {props.realtokens.map((item, index) => {
            const isAProperty = item.hasOwnProperty('rentStatus')
            if (!isAProperty) {
              return (
                <OtherTableRow
                  key={'000' + index}
                  value={item as OtherRealtoken}
                />
              )
            }
            return <AssetTableRow key={index} value={item as UserRealtoken} />
          })}
        </Table.Tbody>
      </Table>
    </ScrollArea>
  )
}
AssetTable.displayName = 'AssetTable'

const AssetTableHeader: FC = () => {
  const { t } = useTranslation('common', { keyPrefix: 'assetTable' })
  const transfersIsLoaded = useSelector(selectTransfersIsLoaded)

  return (
    <Table.Tr>
      <Table.Th style={{ textAlign: 'left' }}>{t('property')}</Table.Th>
      <Table.Th style={{ textAlign: 'right' }}>{t('ownedValue')}</Table.Th>
      {transfersIsLoaded ? (
        <>
          <Table.Th style={{ textAlign: 'right' }}>{t('priceCost')}</Table.Th>
          <Table.Th style={{ textAlign: 'right' }}>
            {t('unrealizedCapitalGain')}
          </Table.Th>
        </>
      ) : null}
      <Table.Th style={{ textAlign: 'right' }}>{t('tokenPrice')}</Table.Th>
      {transfersIsLoaded ? (
        <Table.Th style={{ textAlign: 'right' }}>{t('unitPriceCost')}</Table.Th>
      ) : null}
      <Table.Th style={{ textAlign: 'right' }}>{t('ownedTokens')}</Table.Th>
      <Table.Th style={{ textAlign: 'right' }}>{t('apr')}</Table.Th>
      <Table.Th style={{ textAlign: 'right' }}>{t('fullyRentedAPR')}</Table.Th>
      <Table.Th style={{ textAlign: 'right' }}>{t('weeklyRents')}</Table.Th>
      <Table.Th style={{ textAlign: 'right' }}>{t('yearlyRents')}</Table.Th>
      <Table.Th style={{ textAlign: 'right' }}>{t('rentedUnits')}</Table.Th>
      <Table.Th style={{ textAlign: 'right' }}>{t('propertyValue')}</Table.Th>
      <Table.Th style={{ textAlign: 'right' }}>{t('status')}</Table.Th>
      <Table.Th style={{ textAlign: 'right' }}>{t('priority')}</Table.Th>
      <Table.Th style={{ textAlign: 'right' }}>{t('lastChange')}</Table.Th>
    </Table.Tr>
  )
}
AssetTableHeader.displayName = 'AssetTableHeader'

const Status: FC<{ value: string }> = ({ value }) => {
  // const { t } = useTranslation('common', {
  //   keyPrefix: 'realtimeIndicator',
  // })

  return (
/*     <Badge key={'realtime'} ml={'15px'}>
      <span>{'⏰'}</span>
      <span>{value==0?'-':value}</span>
    </Badge> */

    /* TODO: Icon Hover */

    value === RealTokenToBeFixedStatus.NoExhibit ? (
        <IconCheck size={16} />
      ) : value === RealTokenToBeFixedStatus.Scheduled ? (
        <IconCalendarTime size={16} />
      ) : value === RealTokenToBeFixedStatus.UpgradedAndReady ? (
        <IconHomeCheck size={16} />
      ) : ""
  )
}

const Priority: FC<{ value: number }> = ({ value }) => {
  // const { t } = useTranslation('common', {
  //   keyPrefix: 'realtimeIndicator',
  // })

  return (
/*     <Badge key={'realtime'} ml={'15px'}>
      <span>{'⏰'}</span>
      <span>{value==0?'-':value}</span>
    </Badge> */
    value <= 0 ? (
      null
    ) : (
      <>
        {/* TODO: Icon Hover */}
        {/* value = 1 = Icone TrafficCone + Icone Hammer + Icone Trash */}
        {/* value = 2 = Icone Hammer + Icone Trash */}
        {/* value = 3 = Icone Trash */}
        {value < 2 && <><IconCircleNumber1 size={20} /><IconTrafficCone size={16} /></>}
        {value==2 && <IconCircleNumber2 size={16} />}{value < 3 && <IconHammer size={16} />}
        {value==3 && <IconCircleNumber3 size={14} />}{value < 4 && <IconTrash size={16} />}
      </>
    )
  )
}

const AssetTableRow: FC<{ value: UserRealtoken }> = (props) => {
  const { t } = useTranslation('common', { keyPrefix: 'numbers' })
  const transfersIsLoaded = useSelector(selectTransfersIsLoaded)
  const router = useRouter()

  const value = props.value.value
  const priceCost = props.value.priceCost
  const unrealizedCapitalGain = props.value.unrealizedCapitalGain
  const tokenPrice = props.value.tokenPrice
  const unitPriceCost = props.value.unitPriceCost
  const weeklyAmount = props.value.amount * props.value.netRentDayPerToken * 7
  const yearlyAmount = props.value.amount * props.value.netRentYearPerToken
  const totalInvestment = props.value.totalInvestment
  const isAProperty = props.value.hasOwnProperty('rentStatus')
  const fullyRentedAPR = isAProperty
    ? useFullyRentedAPR(props.value as UserRealtoken)
    : null

  return (
    <Table.Tr>
      <Table.Td style={{ minWidth: '150px' }}>
        <Anchor onClick={() => router.push(`/asset/${props.value.id}`)}>
          {props.value.shortName}
        </Anchor>
      </Table.Td>
      <Table.Td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
        {useCurrencyValue(value)}
      </Table.Td>
      {transfersIsLoaded ? (
        <>
          <Table.Td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
            {useCurrencyValue(priceCost)}
          </Table.Td>
          <Table.Td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
            {useCurrencyValue(unrealizedCapitalGain)}
          </Table.Td>
        </>
      ) : null}

      <Table.Td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
        {useCurrencyValue(tokenPrice)}
      </Table.Td>
      {transfersIsLoaded ? (
        <Table.Td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
          {useCurrencyValue(unitPriceCost)}
        </Table.Td>
      ) : null}
      <Table.Td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
        {t('decimal', { value: props.value.amount })}
      </Table.Td>
      <Table.Td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
        {t('percent', { value: props.value.annualPercentageYield })}
      </Table.Td>
      {isAProperty ? (
        <Table.Td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
          {t('percent', { value: fullyRentedAPR })}
        </Table.Td>
      ) : (
        <Table.Td style={{ textAlign: 'right', whiteSpace: 'nowrap' }} />
      )}
      <Table.Td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
        {useCurrencyValue(weeklyAmount)}
      </Table.Td>
      <Table.Td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
        {useCurrencyValue(yearlyAmount)}
      </Table.Td>
      <Table.Td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
        {t('decimal', { value: props.value.rentedUnits })}
        {' / '}
        {t('decimal', { value: props.value.totalUnits })}
        {` (${t('percentInteger', {
          value: (props.value.rentedUnits / props.value.totalUnits) * 100,
        })})`}
      </Table.Td>
      <Table.Td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
        {useCurrencyValue(totalInvestment)}
      </Table.Td>
      <Table.Td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
        <Status value={props.value.extraData?.pitsBI?.actions?.realt_status} />
      </Table.Td>
      <Table.Td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
        {/* {props.value.extraData?.pitsBI?.actions?.priority} */}
        <Priority value={props.value.extraData?.pitsBI?.actions?.priority || 0} />
      </Table.Td>
      <Table.Td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
        {moment(props.value.lastChanges, 'YYYYMMDD')
          .toDate()
          .toLocaleDateString()}
      </Table.Td>
    </Table.Tr>
  )
}

const OtherTableRow: FC<{ value: OtherRealtoken }> = (props) => {
  const { t } = useTranslation('common', { keyPrefix: 'numbers' })
  const transfersIsLoaded = useSelector(selectTransfersIsLoaded)

  const { shortName, value, unitPriceCost, amount, totalInvestment } =
    props.value

  return (
    <Table.Tr>
      <Table.Td style={{ minWidth: '150px' }}>
        <Anchor>{shortName}</Anchor>
      </Table.Td>
      <Table.Td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
        {useCurrencyValue(value)}
      </Table.Td>
      {transfersIsLoaded ? (
        <>
          <Table.Td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
            {'-'}
          </Table.Td>
          <Table.Td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
            {'-'}
          </Table.Td>
        </>
      ) : null}

      <Table.Td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
        {useCurrencyValue(unitPriceCost)}
      </Table.Td>
      <Table.Td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
        {t('decimal', { value: amount })}
      </Table.Td>
      <Table.Td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
        {'-'}
      </Table.Td>
      <Table.Td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
        {'-'}
      </Table.Td>
      <Table.Td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
        {'-'}
      </Table.Td>
      <Table.Td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
        {'-'}
      </Table.Td>
      <Table.Td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
        {'-'}
      </Table.Td>
      <Table.Td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
        {useCurrencyValue(totalInvestment)}
      </Table.Td>
      <Table.Td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
        {'-'}
      </Table.Td>
    </Table.Tr>
  )
}

AssetTableRow.displayName = 'AssetTableRow'
