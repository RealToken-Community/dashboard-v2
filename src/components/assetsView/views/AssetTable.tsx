import { FC, forwardRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

import { useRouter } from 'next/router'

import { Anchor, Badge, ScrollArea, Table, Tooltip, Text, Button } from '@mantine/core'

import moment from 'moment'

import { useCurrencyValue } from 'src/hooks/useCurrencyValue'
import { useFullyRentedAPR } from 'src/hooks/useFullyRentedAPR'
import { selectTransfersIsLoaded } from 'src/store/features/transfers/transfersSelector'
import {
  OtherRealtoken,
  UserRealtoken,
} from 'src/store/features/wallets/walletsSelector'

import {
  IconBan,
  IconCalendarTime,
  IconCheck,
  IconCircleNumber1,
  IconCircleNumber2,
  IconCircleNumber3,
  IconFileAlert,
  IconFileOff,
  IconHammer,
  IconHomeCheck,
  IconLoader,
  IconQuestionMark,
  IconTool,
  IconTrafficCone,
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
      <Table.Th style={{ textAlign: 'right' }}>{t('lastChange')}</Table.Th>
      <Table.Th style={{ textAlign: 'right' }}>{t('status.header')}</Table.Th>
      <Table.Th style={{ textAlign: 'right' }}>{t('priority.header')}</Table.Th>
      <Table.Th style={{ textAlign: 'right' }}>{t('lawsuit.header')}</Table.Th>
    </Table.Tr>
  )
}
AssetTableHeader.displayName = 'AssetTableHeader'

// eslint-disable-next-line react/display-name
const StatusIcons = forwardRef<HTMLDivElement, { value: string | undefined }>((props, ref) => {
  const { value, ...rest } = props
  const iconColor = !value||value==='na' ? 'gray' : value === RealTokenToBeFixedStatus.NoExhibit ? 'green' : value === RealTokenToBeFixedStatus.Scheduled ? 'orange' : value === RealTokenToBeFixedStatus.UpgradedAndReady ? 'green' : 'purple'
  const icon = !value ? <IconLoader size={16} color={iconColor}/> : value === RealTokenToBeFixedStatus.NoExhibit ? <IconCheck size={16} color={iconColor}/> : value === RealTokenToBeFixedStatus.Scheduled ? <IconCalendarTime size={16} color={iconColor}/> : value === RealTokenToBeFixedStatus.UpgradedAndReady ? <IconHomeCheck size={16} color={iconColor}/> : value == 'na' ? <IconLoader size={16} color={iconColor}/> : <IconQuestionMark size={16} color={iconColor}/>

  return (
    <div ref={ref} {...rest}>
      <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
        {icon}
      </div>
    </div>
  )
})

/* Status Component
  * Displays a status icon with a tooltip
*/
const Status: FC<{ value: string | undefined }> = ({ value }) => {
const { t } = useTranslation('common', { keyPrefix: 'assetTable' })
const toolTipText = !value ? t(`status.unknown`) :
  value === 'na' ? t('status.na') : 
  value === RealTokenToBeFixedStatus.NoExhibit ? t('status.noExhibit') : 
  value === RealTokenToBeFixedStatus.Scheduled ? t('status.scheduled') : 
  value === RealTokenToBeFixedStatus.UpgradedAndReady ? t('status.upgradedReady') : t('status.unknown')
  return (
    <Tooltip label={toolTipText}>
      <StatusIcons value={value} />
    </Tooltip>
  )
}

/* Priority Icons Component
 * Displays icons based on priority
*/
// eslint-disable-next-line react/display-name
const PriorityIcons = forwardRef<HTMLDivElement, { value: number | undefined }>((props, ref) => {
  const { value, ...rest } = props
  const iconColor = !value||value===0||value===-1 ? 'gray' : value === 1 ? 'red' : value === 2 ? 'orange' : value === 3 ? 'yellow' : 'purple'
  const badgeColor = iconColor
  // const iconBadge = !value||value===0||value===-1 ? <IconLoader size={16} color={iconColor} /> : value === 1 ? <IconCircleNumber1 size={16} /> : value === 2 ? <IconCircleNumber2 size={16} /> : <IconCircleNumber3 size={14} />
  // const icon = !value||value===0||value===-1 ? <></> : value === 1 ? <IconTrafficCone size={16} color={iconColor} /> : value === 2 ? <IconTool size={16} color={iconColor} /> : <IconHammer size={16} color={iconColor} />
  const iconBadge = value===0 ? <IconCheck size={16} color={iconColor} /> : !value ? <IconLoader size={16} color={iconColor} /> : value === 1 ? <IconCircleNumber1 size={16} /> : value === 2 ? <IconCircleNumber2 size={16} /> : <IconCircleNumber3 size={14} />
  const icon = value===0 ? <></> : !value ? <></> : value === 1 ? <IconTrafficCone size={16} color={iconColor} /> : value === 2 ? <IconTool size={16} color={iconColor} /> : <IconHammer size={16} color={iconColor} />

  return (
    <div ref={ref} {...rest}>
      <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
        <Badge color={badgeColor} p={"3px"} pt={"7px"} style={{ display: 'flex', gap: '2px', marginRight: '5px' }}>{iconBadge}</Badge>
        {icon }
      </div>
    </div>
  )
})


/* Priority Badge Component
 * Displays a badge with an icon representing the priority level, as well as a tooltip with the priority level text.
*/
const Priority: FC<{ value: number | undefined }> = ({ value }) => {
const { t } = useTranslation('common', { keyPrefix: 'assetTable' })
const toolTipText = !value ? (value === 0 ? t('priority.na') : t('priority.unknown')) : value === -1 ? t('priority.na') : t(`priority.${value}`)
return (
  <Tooltip label={toolTipText}>
    <PriorityIcons value={value} />
  </Tooltip>
  )
}

/* Exhibit Icons Component
 * Displays an icon based on the exhibit number and volume, with a tooltip showing the exhibit number
*/
// eslint-disable-next-line react/display-name
const ExhibitIcons = forwardRef<HTMLDivElement, { exhibitNumber: number | undefined, exhibitVolume: number | undefined }>((props, ref) => {
  const { exhibitNumber, exhibitVolume, ...rest } = props
  const noExhibit = !exhibitNumber && !exhibitVolume || exhibitNumber === -1 && exhibitVolume ===-1
  const iconColor = noExhibit ? 'gray' : 'orange'
  const icon = exhibitNumber === 0 && exhibitVolume === 0 ? <IconFileOff size={16} color={iconColor} /> : !exhibitNumber && !exhibitVolume ? <IconLoader size={16} color={iconColor} /> : <IconFileAlert size={16} color={iconColor} />
  return (
    <div ref={ref} {...rest}>
      <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
        {icon}
      </div>
    </div>
  )
})

/* Exhibit Component
 * Displays an exhibit icon with a tooltip
 */
const Exhibit: FC<{ exhibitNumber: number | undefined, exhibitVolume: number | undefined }> = ({ exhibitNumber, exhibitVolume }) => {
const { t } = useTranslation('common', { keyPrefix: 'assetTable' })
const toolTipText = exhibitNumber === 0 && exhibitVolume === 0 ? t('lawsuit.na') : !exhibitNumber && !exhibitVolume ? t('lawsuit.unknown') : exhibitNumber === -1 && exhibitVolume ===-1 ? t('lawsuit.na') : t('lawsuit.exhibit')+ ` # ${exhibitNumber} volume ${exhibitVolume}`
return (
      <Tooltip label={toolTipText}>
      <ExhibitIcons exhibitNumber={exhibitNumber} exhibitVolume={exhibitVolume} />
      </Tooltip>
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
        {moment(props.value.lastChanges, 'YYYYMMDD')
          .toDate()
          .toLocaleDateString()}
      </Table.Td>
      <Table.Td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
        <Status value={props.value.extraData?.pitsBI?.actions?.realt_status} />
      </Table.Td>
      <Table.Td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
        {/* {props.value.extraData?.pitsBI?.actions?.priority} */}
        <Priority value={props.value.extraData?.pitsBI?.actions?.priority} />
        {/* <Priority value={-1} /> */}
      </Table.Td>
      <Table.Td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
        {/* {props.value.extraData?.pitsBI?.actions?.priority} */}
        <Exhibit exhibitNumber={props.value.extraData?.pitsBI?.actions?.exhibit_number} exhibitVolume={props.value.extraData?.pitsBI?.actions?.volume} />
        {/* <Exhibit exhibitNumber={-1} exhibitVolume={-1} /> */}
        {/* <Exhibit exhibitNumber={0} exhibitVolume={0} /> */}
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
      <Table.Td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
        <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
          {'-'}
        </div>
      </Table.Td>
      <Table.Td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
        <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
          {'-'}
        </div>
      </Table.Td>
      <Table.Td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
        <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
          {'-'}
        </div>
      </Table.Td>
    </Table.Tr>
  )
}

AssetTableRow.displayName = 'AssetTableRow'
