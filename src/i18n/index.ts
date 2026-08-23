import { createI18n } from 'vue-i18n'
import fa from './locales/fa'

export const i18n = createI18n({
  legacy: false,
  locale: 'fa',
  fallbackLocale: 'fa',
  messages: { fa },
})
