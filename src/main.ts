import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPersistedState from 'pinia-plugin-persistedstate'
import VueApexCharts from 'vue3-apexcharts'
import '@fontsource-variable/vazirmatn'
import './assets/main.css'
import App from './App.vue'
import router from './router'
import { i18n } from './i18n'

const pinia = createPinia()
pinia.use(piniaPersistedState)

createApp(App)
  .use(pinia)
  .use(router)
  .use(i18n)
  .use(VueApexCharts)
  .mount('#app')
