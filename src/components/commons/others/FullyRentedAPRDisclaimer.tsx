import { useTranslation } from 'react-i18next'

import { Text } from '@mantine/core'

const FullyRentedAPRDisclaimer = () => {
  const { t } = useTranslation('common', { keyPrefix: 'disclaimer' })
  return (
    <Text style={{ fontSize: 'small', color: 'grey' }}>
      {'*'}
      {t('fullyRentedAPR')}
    </Text>
  )
}

export default FullyRentedAPRDisclaimer
