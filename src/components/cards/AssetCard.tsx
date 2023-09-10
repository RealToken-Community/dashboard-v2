import { FC, memo } from 'react'
import { useTranslation } from 'react-i18next'

import Image from 'next/image'

import { Badge, Button, Card, Group, createStyles } from '@mantine/core'

import { OwnedRealtoken } from 'src/store/features/wallets/walletsSelector'

import { Divider, RentStatusTag, RmmStatusTag, SubsidyStatusTag } from '../commons'

const useStyles = createStyles({
  imageContainer: {
    height: '150px',
    position: 'relative',

    '& > span': {
      height: '100% !important',
      width: '100% !important',
    },
  },
  textBold: {
    fontWeight: 500,
  },
  textSm: {
    fontSize: '14px',
  },
  textLocation: {
    fontSize: '12px',
    textAlign: 'center',
    marginBottom: '10px',
  },
  groupApart: {
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    '& > *': {
      boxSizing: 'border-box',
      flexGrow: 0,
    },
  },
})

const AssetCardComponent: FC<{ value: OwnedRealtoken }> = (props) => {
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
        <div className={classes.textBold}>{props.value.shortName}</div>
        <Badge variant={'light'}>
          {tNumbers('currency', { value: props.value.value })}
        </Badge>
      </Group>

      <Group position={'left'} mt={'xs'}>
        <RentStatusTag value={props.value} />
        <SubsidyStatusTag value={props.value} />
        {props.value.isRmmAvailable ? <RmmStatusTag /> : null}
      </Group>

      <Divider height={1} my={'xs'} />

      <div className={classes.groupApart}>
        <div className={classes.textSm}>{t('tokens')}</div>
        <div className={classes.textSm}>
          {tNumbers('decimal', { value: props.value.amount })}
          {' / '}
          {tNumbers('integer', { value: props.value.totalTokens })}
        </div>
      </div>

      <div className={classes.groupApart}>
        <div className={classes.textSm}>{t('apr')}</div>
        <div className={classes.textSm}>
          {tNumbers('percent', { value: props.value.annualPercentageYield })}
        </div>
      </div>

      <div className={classes.groupApart}>
        <div className={classes.textSm}>{t('weekly')}</div>
        <div className={classes.textSm}>
          {tNumbers('currency', {
            value: props.value.amount * props.value.netRentDayPerToken * 7,
          })}
        </div>
      </div>

      <div className={classes.groupApart}>
        <div className={classes.textSm}>{t('yearly')}</div>
        <div className={classes.textSm}>
          {tNumbers('currency', {
            value: props.value.amount * props.value.netRentYearPerToken,
          })}
        </div>
      </div>

      <div className={classes.groupApart}>
        <div className={classes.textSm}>{t('rentedUnits')}</div>
        <div className={classes.textSm}>
          {tNumbers('integer', { value: props.value.rentedUnits })}
          {' / '}
          {tNumbers('integer', { value: props.value.totalUnits })}
          {` (${tNumbers('percentInteger', {
            value: (props.value.rentedUnits / props.value.totalUnits) * 100,
          })})`}
        </div>
      </div>

      <div className={classes.groupApart}>
        <div className={classes.textSm}>{t('propertyValue')}</div>
        <div className={classes.textSm}>
          {tNumbers('currency', {
            value: props.value.totalInvestment,
          })}
        </div>
      </div>

      <Divider height={1} my={'xs'} />

      <div className={classes.textLocation}>{props.value.fullName}</div>

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

export const AssetCard = memo(AssetCardComponent)
