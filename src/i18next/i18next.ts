import { initReactI18next } from 'react-i18next'

import i18next from 'i18next'

import { resources } from './locales'

import 'dayjs/locale/en'
import 'dayjs/locale/fr'

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

export { i18next }
