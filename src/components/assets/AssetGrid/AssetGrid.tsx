import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

import { Badge, Button, Card, Grid, Group, Image, Text } from '@mantine/core'

import { Divider } from 'src/components/Divider'
import {
  Realtoken,
  selectOwnedRealtokens,
} from 'src/store/features/wallets/walletsSelector'

const AssetCard: FC<{ value: Realtoken }> = (props) => {
  const { t: tNumbers } = useTranslation('common', { keyPrefix: 'numbers' })
  const { t } = useTranslation('common', { keyPrefix: 'assetCard' })

  return (
    <Card shadow='sm' radius='md' withBorder>
      <Card.Section>
        <Image
          src={props.value.imageLink[0]}
          height={150}
          alt={props.value.fullName}
        />
      </Card.Section>

      <Group position='apart' mt='md'>
        <Text weight={500}>{props.value.shortName}</Text>
        <Badge variant='light'>
          {tNumbers('currency', { value: props.value.value })}
        </Badge>
      </Group>

      <Divider height={1} my='xs' />

      <Group position='apart'>
        <Text size='sm'>{t('tokens')}</Text>
        <Text size='sm'>
          {tNumbers('decimal', { value: props.value.amount })}
          {' / '}
          {tNumbers('integer', { value: props.value.totalTokens })}
        </Text>
      </Group>

      <Group position='apart'>
        <Text size='sm'>{t('apr')}</Text>
        <Text size='sm'>
          {tNumbers('percent', { value: props.value.annualPercentageYield })}
        </Text>
      </Group>

      <Group position='apart'>
        <Text size='sm'>{t('weekly')}</Text>
        <Text size='sm'>
          {tNumbers('currency', {
            value: props.value.amount * props.value.netRentDayPerToken * 7,
          })}
        </Text>
      </Group>

      <Group position='apart'>
        <Text size='sm'>{t('yearly')}</Text>
        <Text size='sm'>
          {tNumbers('currency', {
            value: props.value.amount * props.value.netRentYearPerToken,
          })}
        </Text>
      </Group>

      <Group position='apart'>
        <Text size='sm'>{t('propertyValue')}</Text>
        <Text size='sm'>
          {tNumbers('currency', {
            value: props.value.totalInvestment,
          })}
        </Text>
      </Group>

      <Divider height={1} my='xs' />

      <Text size='xs' align='center' mb='xs'>
        {props.value.fullName}
      </Text>

      <Button
        component='a'
        fullWidth
        variant='outline'
        size='xs'
        href={props.value.marketplaceLink}
        target='_blank'
      >
        {t('viewOnRealt')}
      </Button>
    </Card>
  )
}

export const AssetGrid: FC = () => {
  const realtokens = useSelector(selectOwnedRealtokens)

  return (
    <Grid>
      {realtokens.map((realtoken) => (
        <Grid.Col key={realtoken.id} span={12} sm={6} md={4} lg={3} xl={2}>
          <AssetCard value={realtoken} />
        </Grid.Col>
      ))}
    </Grid>
  )
}
