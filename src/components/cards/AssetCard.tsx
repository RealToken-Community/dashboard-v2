import { FC } from 'react'
import { useTranslation } from 'react-i18next'

import Image from 'next/image'

import { Badge, Button, Card, Group, Text, createStyles } from '@mantine/core'

import { OwnedRealtoken } from 'src/store/features/wallets/walletsSelector'

import { Divider, RentStatusTag, RmmStatusTag } from '../commons'

const useStyles = createStyles({
  imageContainer: {
    height: '150px',
    position: 'relative',

    '& > span': {
      height: '100% !important',
      width: '100% !important',
    },
  },
})

export const AssetCard: FC<{ value: OwnedRealtoken }> = (props) => {
  const { t: tNumbers } = useTranslation('common', { keyPrefix: 'numbers' })
  const { t } = useTranslation('common', { keyPrefix: 'assetCard' })

  const { classes } = useStyles()

  return (
    <Card
      shadow={'sm'}
      radius={'md'}
      withBorder={true}
      style={{ height: '100%' }}
    >
      <Card.Section>
        <div className={classes.imageContainer}>
          <Image
            src={props.value.imageLink[0]}
            width={400}
            height={300}
            objectFit={'cover'}
            alt={props.value.fullName}
          />
        </div>
      </Card.Section>

      <Group position={'apart'} mt={'md'}>
        <Text weight={500}>{props.value.shortName}</Text>
        <Badge variant={'light'}>
          {tNumbers('currency', { value: props.value.value })}
        </Badge>
      </Group>

      <Group position={'left'} mt={'xs'}>
        <RentStatusTag value={props.value} />
        {props.value.isRmmAvailable ? <RmmStatusTag /> : null}
      </Group>

      <Divider height={1} my={'xs'} />

      <Group position={'apart'}>
        <Text size={'sm'}>{t('tokens')}</Text>
        <Text size={'sm'}>
          {tNumbers('decimal', { value: props.value.amount })}
          {' / '}
          {tNumbers('integer', { value: props.value.totalTokens })}
        </Text>
      </Group>

      <Group position={'apart'}>
        <Text size={'sm'}>{t('apr')}</Text>
        <Text size={'sm'}>
          {tNumbers('percent', { value: props.value.annualPercentageYield })}
        </Text>
      </Group>

      <Group position={'apart'}>
        <Text size={'sm'}>{t('weekly')}</Text>
        <Text size={'sm'}>
          {tNumbers('currency', {
            value: props.value.amount * props.value.netRentDayPerToken * 7,
          })}
        </Text>
      </Group>

      <Group position={'apart'}>
        <Text size={'sm'}>{t('yearly')}</Text>
        <Text size={'sm'}>
          {tNumbers('currency', {
            value: props.value.amount * props.value.netRentYearPerToken,
          })}
        </Text>
      </Group>

      <Group position={'apart'}>
        <Text size={'sm'}>{t('rentedUnits')}</Text>
        <Text size={'sm'}>
          {tNumbers('integer', { value: props.value.rentedUnits })} {' / '}{' '}
          {tNumbers('integer', { value: props.value.totalUnits })}
        </Text>
      </Group>

      <Group position={'apart'}>
        <Text size={'sm'}>{t('propertyValue')}</Text>
        <Text size={'sm'}>
          {tNumbers('currency', {
            value: props.value.totalInvestment,
          })}
        </Text>
      </Group>

      <Divider height={1} my={'xs'} />

      <Text size={'xs'} align={'center'} mb={'xs'}>
        {props.value.fullName}
      </Text>

      <Button
        component={'a'}
        fullWidth={true}
        variant={'outline'}
        size={'xs'}
        href={props.value.marketplaceLink}
        target={'_blank'}
      >
        {t('viewOnRealt')}
      </Button>
    </Card>
  )
}
