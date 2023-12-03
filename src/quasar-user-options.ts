
import type {QuasarPluginOptions} from "quasar/dist/types/plugin";
import './styles/quasar.scss'
import lang from 'quasar/lang/ru.js'
import '@quasar/extras/roboto-font/roboto-font.css'
import '@quasar/extras/material-icons/material-icons.css'
import {Loading, Dark} from 'quasar'

// To be used on app.use(Quasar, { ... })
export default <QuasarPluginOptions>{
  config: {

  },
  plugins: {
    Dark,
    Loading
  },
  lang: lang
}