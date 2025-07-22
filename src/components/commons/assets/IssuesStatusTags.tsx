import { FC, forwardRef } from 'react'
import { useTranslation } from 'react-i18next'

import { ActionIcon, Badge, Tooltip } from '@mantine/core'

import { IconCalendarTime, IconCheck, IconCircleNumber1, IconCircleNumber2, IconCircleNumber3, IconFileAlert, IconFileOff, IconHammer, IconHomeCheck, IconQuestionMark, IconTool, IconTrafficCone } from '@tabler/icons'
import { RealTokenToBeFixedStatus } from 'src/types/APIPitsBI'

const IconLoading = () => (
  <ActionIcon loading={true} loaderProps={{ type: 'oval' }} color={'gray'} /> 
)

/* Priority Icons Component
 * Displays icons based on priority
*/
// eslint-disable-next-line react/display-name
const PriorityIcons = forwardRef<HTMLDivElement, { value: number | undefined }>((props, ref) => {
  const { value, ...rest } = props
  const iconColor = !value||value===0||value===-1 ? 'gray' : value === 1 ? 'red' : value === 2 ? 'orange' : value === 3 ? 'yellow' : 'purple'
  const badgeColor = iconColor
  const iconBadge = value===0 ? <IconCheck size={16} color={iconColor} /> : !value ? <></> : value === 1 ? <IconCircleNumber1 size={16} /> : value === 2 ? <IconCircleNumber2 size={16} /> : <IconCircleNumber3 size={14} />
  const icon = value===0 ? <></> : !value ? <IconLoading /> : value === 1 ? <IconTrafficCone size={16} color={iconColor} /> : value === 2 ? <IconTool size={16} color={iconColor} /> : <IconHammer size={16} color={iconColor} />

  return (
    <div ref={ref} {...rest}>
      <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
        {value !== undefined && <Badge color={badgeColor} p={"3px"} pt={"7px"} style={{ display: 'flex', gap: '2px', marginRight: '5px' }}>{iconBadge}</Badge>}
        {icon}
      </div>
    </div>
  )
})

/* Priority Badge Component
 * Displays a badge with an icon representing the priority level, as well as a tooltip with the priority level text.
*/
export const PriorityStatusTag: FC<{ value: number | undefined }> = ({ value }) => {
const { t } = useTranslation('common', { keyPrefix: 'assetIssues' })
const toolTipText = !value ? (value === 0 ? t('priority.na') : t('priority.unknown')) : value === -1 ? t('priority.na') : t(`priority.${value}`)
return (
  <Tooltip label={toolTipText}>
    <PriorityIcons value={value} />
  </Tooltip>
  )
}

PriorityStatusTag.displayName = 'PriorityStatusTag'

/* Exhibit Icons Component
 * Displays an icon based on the exhibit number and volume, with a tooltip showing the exhibit number
*/
// eslint-disable-next-line react/display-name
const ExhibitIcons = forwardRef<HTMLDivElement, { exhibitNumber: number | undefined, exhibitVolume: number | undefined }>((props, ref) => {
  const { exhibitNumber, exhibitVolume, ...rest } = props
  const noExhibit = !exhibitNumber && !exhibitVolume || exhibitNumber === -1 && exhibitVolume ===-1
  const iconColor = noExhibit ? 'gray' : 'orange'
  const icon = exhibitNumber === 0 && exhibitVolume === 0 ? <IconFileOff size={16} color={iconColor} /> : !exhibitNumber && !exhibitVolume ? <IconLoading /> : <IconFileAlert size={16} color={iconColor} />
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
export const ExhibitStatusTag: FC<{ exhibitNumber: number | undefined, exhibitVolume: number | undefined }> = ({ exhibitNumber, exhibitVolume }) => {
const { t } = useTranslation('common', { keyPrefix: 'assetIssues' })
const toolTipText = exhibitNumber === 0 && exhibitVolume === 0 ? t('lawsuit.na') : !exhibitNumber && !exhibitVolume ? t('lawsuit.unknown') : exhibitNumber === -1 && exhibitVolume ===-1 ? t('lawsuit.na') : t('lawsuit.exhibit')+ ` # ${exhibitNumber} volume ${exhibitVolume}`
return (
  <Tooltip label={toolTipText}>
    <ExhibitIcons exhibitNumber={exhibitNumber} exhibitVolume={exhibitVolume} />
  </Tooltip>
)
}

 ExhibitStatusTag.displayName = ' ExhibitStatusTag'


// eslint-disable-next-line react/display-name
const StatusIcons = forwardRef<HTMLDivElement, { value: string | undefined }>((props, ref) => {
  const { value, ...rest } = props
  const iconColor = !value||value==='na' ? 'gray' : value === RealTokenToBeFixedStatus.NoExhibit ? 'green' : value === RealTokenToBeFixedStatus.Scheduled ? 'orange' : value === RealTokenToBeFixedStatus.UpgradedAndReady ? 'green' : 'purple'
  const icon = !value ? <IconLoading /> : value === RealTokenToBeFixedStatus.NoExhibit || value == 'na' ? <IconCheck size={16} color={iconColor}/> : value === RealTokenToBeFixedStatus.Scheduled ? <IconCalendarTime size={16} color={iconColor}/> : value === RealTokenToBeFixedStatus.UpgradedAndReady ? <IconHomeCheck size={16} color={iconColor}/> : <IconQuestionMark size={16} color={iconColor}/>

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
export const IssueStatusTag: FC<{ value: string | undefined }> = ({ value }) => {
const { t } = useTranslation('common', { keyPrefix: 'assetIssues' })
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

IssueStatusTag.displayName = 'IssueStatusTag'
