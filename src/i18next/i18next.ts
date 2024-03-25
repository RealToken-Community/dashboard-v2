import { initReactI18next } from 'react-i18next'

import i18next from 'i18next'

import { setDefaultOptions as setDefaultOptionsDateFns } from 'date-fns'
import { enUS as enUSDateFns, fr as frDateFns } from 'date-fns/locale'
import 'dayjs/locale/en'
import 'dayjs/locale/fr'

import { resources } from './locales'

export const DEFAULT_NS = 'common'
export const FALLBACK_LNG = 'en'

declare module 'i18next' {
  interface CustomTypeOptions {
    returnNull: false
  }
}

i18next.use(initReactI18next).init({
  resources: resources,
  defaultNS: DEFAULT_NS,
  returnNull: false,
  fallbackLng: FALLBACK_LNG,
  debug: false,
  interpolation: {
    escapeValue: false,
  },
})

i18next.on('languageChanged', (lng) => {
  setDefaultOptionsDateFns({
    locale: lng === 'fr' ? frDateFns : enUSDateFns,
  })
})

export { i18next }
