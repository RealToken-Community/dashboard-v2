import { FC, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

import { NextPage } from 'next'
import Image from 'next/image'
import { useRouter } from 'next/router'

import { Anchor, Breadcrumbs, Button, Flex } from '@mantine/core'
import { IconExternalLink } from '@tabler/icons'

import { AssetPageHistoryTab } from 'src/components/assetPage/assetPageHistoryTab'
import { AssetPageMainTab } from 'src/components/assetPage/assetPageMainTab'
import { AssetPagePropertyTab } from 'src/components/assetPage/assetPagePropertyTab'
import { AssetPageTransfersTab } from 'src/components/assetPage/assetPageTransfersTab'
import { AssetPageYamStatisticsTab } from 'src/components/assetPage/assetPageYamStatisticsTab'
import { selectIsLoading } from 'src/store/features/settings/settingsSelector'
import { selectTransfersIsLoaded } from 'src/store/features/transfers/transfersSelector'
import { selectAllUserRealtokens } from 'src/store/features/wallets/walletsSelector'

import styles from './AssetPage.module.sass'

enum Tabs {
  Main = 'main',
  Property = 'property',
  Transfers = 'transfers',
  History = 'history',
  YamStatistics = 'yamStatistics',
}

interface TabButtonProps {
  label: string
  active: boolean
  onClick: () => void
}

const TabButton: FC<TabButtonProps> = ({ label, active, onClick }) => {
  return (
    <Button
      variant={active ? 'filled' : 'outline'}
      style={{ width: '100%', marginTop: '10px' }}
      onClick={onClick}
    >
      {label}
    </Button>
  )
}

const AssetPage: NextPage = () => {
  const { t } = useTranslation('common', { keyPrefix: 'assetPage' })
  const realtokens = useSelector(selectAllUserRealtokens)
  const transfersIsLoaded = useSelector(selectTransfersIsLoaded)

  const isLoading = useSelector(selectIsLoading)
  const router = useRouter()
  const { assetId } = router.query
  const [activeTab, setActiveTab] = useState<Tabs>(Tabs.Main)

  const realtoken = useMemo(
    () => realtokens.find((asset) => asset.id === assetId),
    [realtokens, assetId],
  )

  if (!realtoken) {
    return <div>{isLoading ? 'Loading...' : 'Asset not found'}</div>
  }

  return (
    <Flex my={'lg'} direction={'column'} align={'center'}>
      <div style={{ maxWidth: '450px', marginBottom: '300px' }}>
        <Breadcrumbs>
          <Anchor onClick={() => router.push('/')}>{t('home')}</Anchor>
          {realtoken.shortName}
        </Breadcrumbs>

        <h2 style={{ textAlign: 'center' }}>{realtoken.fullName}</h2>

        <Image
          src={realtoken.imageLink[0]}
          className={styles.imageContainer}
          width={500}
          height={300}
          objectFit={'cover'}
          alt={realtoken.fullName}
        />

        <div style={{ width: '100%' }}>
          <TabButton
            label={t('tabs.main')}
            active={activeTab === Tabs.Main}
            onClick={() => setActiveTab(Tabs.Main)}
          />
          {activeTab === Tabs.Main ? (
            <div style={{ margin: '5px 10px' }}>
              <AssetPageMainTab realtoken={realtoken} />
            </div>
          ) : null}

          <TabButton
            label={t('tabs.property')}
            active={activeTab === Tabs.Property}
            onClick={() => setActiveTab(Tabs.Property)}
          />
          {activeTab === Tabs.Property ? (
            <div style={{ margin: '5px 10px' }}>
              <AssetPagePropertyTab realtoken={realtoken} />
            </div>
          ) : null}

          <TabButton
            label={t('tabs.history')}
            active={activeTab === Tabs.History}
            onClick={() => setActiveTab(Tabs.History)}
          />
          {activeTab === Tabs.History ? (
            <div style={{ margin: '5px 10px' }}>
              <AssetPageHistoryTab realtoken={realtoken} />
            </div>
          ) : null}

          {transfersIsLoaded ? (
            <>
              <TabButton
                label={t('tabs.transfers')}
                active={activeTab === Tabs.Transfers}
                onClick={() => setActiveTab(Tabs.Transfers)}
              />
              {activeTab === Tabs.Transfers ? (
                <div style={{ margin: '5px 10px' }}>
                  <AssetPageTransfersTab realtoken={realtoken} />
                </div>
              ) : null}
            </>
          ) : null}

          <TabButton
            label={t('tabs.yamStatistics')}
            active={activeTab === Tabs.YamStatistics}
            onClick={() => setActiveTab(Tabs.YamStatistics)}
          />
          {activeTab === Tabs.YamStatistics ? (
            <div style={{ margin: '5px 10px' }}>
              <AssetPageYamStatisticsTab realtoken={realtoken} />
            </div>
          ) : null}

          <Button
            component={'a'}
            fullWidth={true}
            variant={'outline'}
            size={'xs'}
            href={realtoken.marketplaceLink}
            target={'_blank'}
            style={{ marginTop: '20px' }}
          >
            {t('viewOnRealt')}
            <IconExternalLink style={{ marginLeft: '5px' }} size={14} />
          </Button>
        </div>
      </div>
    </Flex>
  )
}

export default AssetPage
