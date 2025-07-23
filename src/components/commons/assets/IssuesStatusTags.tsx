import { FC, forwardRef } from 'react'
import { useTranslation } from 'react-i18next'

import { Skeleton, Tooltip } from '@mantine/core'

import { IconCalendarTime, IconCheck, IconCircleNumber1, IconCircleNumber2, IconCircleNumber3, IconFileAlert, IconFileOff, IconFileUnknown, IconHammer, IconHomeCheck, IconTool, IconTrafficCone, IconZoomQuestion } from '@tabler/icons'
import { RealTokenToBeFixedStatus } from 'src/types/APIPitsBI'
import { useSelector } from 'react-redux'
import { selectRealtokensIsLoadingExtraData } from 'src/store/features/realtokens/realtokensSelector'

/* Priority Icons Component
 * Displays icons based on priority
  * @param value: number representing the priority level
  * use forwardRef to allow the component to be used as with a tooltip
*/
// eslint-disable-next-line react/display-name
const PriorityIcons = forwardRef<HTMLDivElement, { value: number | undefined }>((props, ref) => {
  const { value, ...rest } = props
  const iconColor = !value||value===0||value===-1 ? 'gray' : value === 1 ? 'red' : value === 2 ? 'orange' : value === 3 ? 'yellow' : 'purple'
  const piorityColor = iconColor
  const prioritySize = 22
  const iconSize = 16
  const iconPriority = !value ? value===0 ? <IconCheck size={prioritySize} color={piorityColor} /> : <></> : value === 1 ? <IconCircleNumber1 size={prioritySize} color={piorityColor} /> : value === 2 ? <IconCircleNumber2 size={prioritySize} color={piorityColor} /> : <IconCircleNumber3 size={prioritySize} color={piorityColor} />
  const icon = value===0 ? <></> : value === 1 ? <IconTrafficCone size={iconSize} color={iconColor} /> : value === 2 ? <IconTool size={iconSize} color={iconColor} /> : <IconHammer size={iconSize} color={iconColor} />

  return (
    <div ref={ref} {...rest}>
      <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
        {iconPriority}
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
const isLoadingExtraData = useSelector(selectRealtokensIsLoadingExtraData)
const toolTipText = !value ? (value === 0 ? t('priority.na') : t('priority.unknown')) : value === -1 ? t('priority.na') : t(`priority.${value}`)
return (
  isLoadingExtraData ? (
    <Skeleton width={30} height={20} />
    ) : (
      <Tooltip label={toolTipText}>
        <PriorityIcons value={value} />
      </Tooltip>
    )
  )
}

PriorityStatusTag.displayName = 'PriorityStatusTag'

/* Exhibit Icons Component
 * Displays an icon based on the exhibit number and volume, with a tooltip showing the exhibit number
 * use forwardRef to allow the component to be used as with a tooltip
*/
// eslint-disable-next-line react/display-name
const ExhibitIcons = forwardRef<HTMLDivElement, { exhibitNumber: number | undefined, exhibitVolume: number | undefined, priority: number | undefined }>((props, ref) => {
  const { exhibitNumber, exhibitVolume, priority, ...rest } = props
  const noExhibit = !exhibitNumber && !exhibitVolume || exhibitNumber === -1 && exhibitVolume ===-1
  const iconColor = noExhibit ? 'gray' : (priority === 1 ? 'red' : priority === 2 ? 'orange' : priority === 3 ? 'yellow' : !priority ? 'gray' : 'purple')
  const iconSize = 16
  const icon = !exhibitNumber && !exhibitVolume ? exhibitNumber === 0 && exhibitVolume === 0 ? <IconFileOff size={iconSize} color={iconColor} />: <IconFileUnknown size={iconSize} color={iconColor} /> : <IconFileAlert size={iconSize} color={iconColor} />
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
export const ExhibitStatusTag: FC<{
  exhibitNumber: number | undefined,
  exhibitVolume: number | undefined,
  priority: number | undefined }> = ({ exhibitNumber, exhibitVolume, priority }) => {
const { t } = useTranslation('common', { keyPrefix: 'assetIssues' })
const isLoadingExtraData = useSelector(selectRealtokensIsLoadingExtraData)
const toolTipText = exhibitNumber === 0 && exhibitVolume === 0 ? t('lawsuit.na') : !exhibitNumber && !exhibitVolume ? t('lawsuit.unknown') : exhibitNumber === -1 && exhibitVolume ===-1 ? t('lawsuit.na') : t('lawsuit.exhibit')+ ` # ${exhibitNumber} volume ${exhibitVolume}`
return (
  <>
    {isLoadingExtraData ? (
      <Skeleton width={30} height={20} />
    ) : (
      <Tooltip label={toolTipText}>
        <ExhibitIcons exhibitNumber={exhibitNumber} exhibitVolume={exhibitVolume} priority={priority} />
      </Tooltip>
    )}
  </>
  )
}

ExhibitStatusTag.displayName = 'ExhibitStatusTag'


/* Status Icons Component
 * Displays an icon based on the value, with a tooltip showing the status text
 * use forwardRef to allow the component to be used as with a tooltip
*/
// eslint-disable-next-line react/display-name
const StatusIcons = forwardRef<HTMLDivElement, { value: string | undefined, priority: number | undefined }>((props, ref) => {
  const { value, priority, ...rest } = props
  const iconColor = !value||value==='na' ? 'gray' : value === RealTokenToBeFixedStatus.NoExhibit ? 'green' : value === RealTokenToBeFixedStatus.Scheduled ? (priority === 1 ? 'red' : priority === 2 ? 'orange' : priority === 3 ? 'yellow' : !priority ? 'gray'  : 'purple') : value === RealTokenToBeFixedStatus.UpgradedAndReady ? 'green' : 'purple'
  const icon = value === RealTokenToBeFixedStatus.NoExhibit || value == 'na' ? <IconCheck size={16} color={iconColor}/> : value === RealTokenToBeFixedStatus.Scheduled ? <IconCalendarTime size={16} color={iconColor}/> : value === RealTokenToBeFixedStatus.UpgradedAndReady ? <IconHomeCheck size={16} color={iconColor}/> : <IconZoomQuestion size={16} color={iconColor}/>
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
export const IssueStatusTag: FC<{ value: string | undefined, priority: number | undefined }> = ({ value, priority }) => {
const { t } = useTranslation('common', { keyPrefix: 'assetIssues' })
const isLoadingExtraData = useSelector(selectRealtokensIsLoadingExtraData)
const toolTipText = !value ? t(`status.unknown`) :
  value === 'na' ? t('status.na') : 
  value === RealTokenToBeFixedStatus.NoExhibit ? t('status.noExhibit') : 
  value === RealTokenToBeFixedStatus.Scheduled ? t('status.scheduled') : 
  value === RealTokenToBeFixedStatus.UpgradedAndReady ? t('status.upgradedReady') : t('status.unknown')
  return (
    <>
      {isLoadingExtraData ? (
        <Skeleton width={30} height={20} />
      ) : (
        <Tooltip label={toolTipText}>
          <StatusIcons value={value} priority={priority} />
        </Tooltip>
      )}
    </>
  )
}

IssueStatusTag.displayName = 'IssueStatusTag'
