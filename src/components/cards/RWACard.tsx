import { FC, memo } from 'react'
import { useTranslation } from 'react-i18next'

import Image from 'next/image'

import { Badge, Card, Group } from '@mantine/core'

import { useCurrencyValue } from 'src/hooks/useCurrencyValue'
import { OtherRealtoken } from 'src/store/features/wallets/walletsSelector'

import { Divider } from '../commons'
import styles from './AssetCard.module.sass'

interface RWACardProps {
  value: OtherRealtoken
  onClick?: (id: string) => unknown
}

const RWACardComponent: FC<RWACardProps> = (props) => {
  const { t: tNumbers } = useTranslation('common', { keyPrefix: 'numbers' })
  const { t } = useTranslation('common', { keyPrefix: 'assetCard' })

  const value = props.value.value
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
        <div className={styles.imageContainer}>
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
        <div className={styles.textSm}>{t('tokenPrice')}</div>
        <div className={styles.textSm}>
          {useCurrencyValue(props.value.tokenPrice)}
        </div>
      </div>

      <div className={styles.groupApart}>
        <div className={styles.textSm}>{t('propertyValue')}</div>
        <div className={styles.textSm}>{useCurrencyValue(totalInvestment)}</div>
      </div>

      <div style={{ flex: '1 1 auto' }} />
      <Divider height={1} my={'xs'} />

      <div className={styles.textLocation}>{props.value.fullName}</div>
    </Card>
  )
}

export const RWACard = memo(RWACardComponent)
