import { FC, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

import { NextPage } from 'next'
import Image from 'next/image'
import { useRouter } from 'next/router'

import { Anchor, Breadcrumbs, Button, Flex, createStyles } from '@mantine/core'
import { IconExternalLink } from '@tabler/icons'

import { AssetPageMainTab } from 'src/components/assetPage/assetPageMainTab'
import { AssetPagePropertyTab } from 'src/components/assetPage/assetPagePropertyPage'
import { AssetPageTransfersTab } from 'src/components/assetPage/assetPageTransfersTab'
import { selectIsLoading } from 'src/store/features/settings/settingsSelector'
import { selectOwnedRealtokens } from 'src/store/features/wallets/walletsSelector'

const useStyles = createStyles({
  imageContainer: {
    borderRadius: '10px',
    overflow: 'hidden',
  },
})

enum Tabs {
  Main = 'main',
  Property = 'property',
  Transfers = 'transfers',
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
  const realtokens = useSelector(selectOwnedRealtokens)
  const isLoading = useSelector(selectIsLoading)
  const { classes } = useStyles()
  const router = useRouter()
  const { assetId } = router.query
  const [activeTab, setActiveTab] = useState<Tabs>(Tabs.Main)

  const data = useMemo(
    () => realtokens.find((asset) => asset.id === assetId),
    [realtokens, assetId]
  )

  if (!data) {
    return <div>{isLoading ? 'Loading...' : 'Asset not found'}</div>
  }

  return (
    <Flex my={'xl'} direction={'column'} align={'center'}>
      <div style={{ maxWidth: '450px', marginBottom: '300px' }}>
        <Breadcrumbs>
          <Anchor onClick={() => router.push('/')}>{t('home')}</Anchor>
          {data.shortName}
        </Breadcrumbs>

        <h2 style={{ textAlign: 'center' }}>{data.fullName}</h2>

        <Image
          src={data.imageLink[0]}
          className={classes.imageContainer}
          width={500}
          height={300}
          objectFit={'cover'}
          alt={data.fullName}
        />

        <div style={{ width: '100%' }}>
          <TabButton
            label={t('tabs.main')}
            active={activeTab === Tabs.Main}
            onClick={() => setActiveTab(Tabs.Main)}
          />
          {activeTab === Tabs.Main ? (
            <div style={{ margin: '5px 10px' }}>
              <AssetPageMainTab data={data} />
            </div>
          ) : null}

          <TabButton
            label={t('tabs.property')}
            active={activeTab === Tabs.Property}
            onClick={() => setActiveTab(Tabs.Property)}
          />
          {activeTab === Tabs.Property ? (
            <div style={{ margin: '5px 10px' }}>
              <AssetPagePropertyTab data={data} />
            </div>
          ) : null}

          <TabButton
            label={t('tabs.transfers')}
            active={activeTab === Tabs.Transfers}
            onClick={() => setActiveTab(Tabs.Transfers)}
          />
          {activeTab === Tabs.Transfers ? (
            <div style={{ margin: '5px 10px' }}>
              <AssetPageTransfersTab data={data} />
            </div>
          ) : null}

          <Button
            component={'a'}
            fullWidth={true}
            variant={'outline'}
            size={'xs'}
            href={data.marketplaceLink}
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
