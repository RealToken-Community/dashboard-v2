import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

import { Card, Loader, LoadingOverlay, Text, Title } from '@mantine/core'

import { selectTransfersIsInitialLoading } from 'src/store/features/transfers/transfersSelector'

export const InitialTransfersLoader: FC = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'initialTransfersLoader',
  })
  const transfersIsInitialLoading = useSelector(selectTransfersIsInitialLoading)

  return (
    <LoadingOverlay
      visible={transfersIsInitialLoading}
      style={{ padding: '10px' }}
      loaderProps={{
        children: (
          <Card shadow={'sm'} radius={'md'} withBorder={true}>
            <Card.Section style={{ maxWidth: '400px', padding: '20px' }}>
              <div style={{ textAlign: 'center' }}>
                <Title size={'xl'} fw={500}>
                  {t('title')}
                </Title>

                <Loader style={{ margin: '20px auto', textAlign: 'center' }} />
              </div>

              <Text size={'sm'} c={'dimmed'}>
                {t('description')}
              </Text>
            </Card.Section>
          </Card>
        ),
      }}
    />
  )
}
