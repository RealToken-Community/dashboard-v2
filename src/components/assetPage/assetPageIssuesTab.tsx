import { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { UserRealtoken } from 'src/store/features/wallets/walletsSelector'
import { RealTokenToBeFixedStatus } from 'src/types/APIPitsBI'

import { AssetPageTable } from './assetPageTable'

export const AssetPageIssuesTab: FC<{
  realtoken: UserRealtoken
}> = ({ realtoken }) => {
  const { t } = useTranslation('common', { keyPrefix: 'assetPage.issues' })
  const { t: tAssetIssues } = useTranslation('common', {
    keyPrefix: 'assetIssues',
  })

  const statusLabel = () => {
    switch (realtoken.extraData?.pitsBI?.actions?.realt_status) {
      case RealTokenToBeFixedStatus.NoExhibit:
        return tAssetIssues('status.noExhibit')
      case RealTokenToBeFixedStatus.Scheduled:
        return tAssetIssues('status.scheduled')
      case RealTokenToBeFixedStatus.UpgradedAndReady:
        return tAssetIssues('status.upgradedReady')
      case undefined:
      default:
        return tAssetIssues('status.unknown')
    }
  }

  return (
    <>
      <AssetPageTable
        data={[
          {
            label: t('status'),
            value: statusLabel(),
          },
          {
            label: t('priority'),
            value:
              realtoken.extraData?.pitsBI?.actions?.priority === undefined
                ? tAssetIssues('priority.unknown')
                : realtoken.extraData?.pitsBI?.actions?.priority !== 0
                  ? `${realtoken.extraData?.pitsBI?.actions?.priority}`
                  : tAssetIssues('priority.na'),
          },
          {
            label: t('lawsuit'),
            value:
              realtoken.extraData?.pitsBI?.actions?.exhibit_number &&
              realtoken.extraData?.pitsBI?.actions?.volume
                ? `${tAssetIssues('lawsuit.exhibit')} ${tAssetIssues('lawsuit.exhibitNumber')} ${realtoken.extraData?.pitsBI?.actions?.exhibit_number} ${tAssetIssues('lawsuit.volumeNumber')} ${realtoken.extraData?.pitsBI?.actions?.volume}`
                : tAssetIssues('lawsuit.na'),
          },
        ]}
      />
    </>
  )
}

AssetPageIssuesTab.displayName = 'AssetPageIssuesTab'
