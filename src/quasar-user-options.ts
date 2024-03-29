
import type {QuasarPluginOptions} from "quasar/dist/types/plugin";
import './styles/quasar.scss'
import lang from 'quasar/lang/ru.js'
import '@quasar/extras/material-icons/material-icons.css'
import {Loading, Dark, Dialog, Notify} from 'quasar'
import iconSet from "quasar/icon-set/mdi-v7";
import "@quasar/extras/mdi-v7/mdi-v7.css";
import "@quasar/extras/animate/fadeInLeft.css"
import "@quasar/extras/animate/fadeOutLeft.css"
import "@quasar/extras/animate/fadeInRight.css"
import "@quasar/extras/animate/fadeOutRight.css"
import "@quasar/extras/animate/fadeInDown.css"
import "@quasar/extras/animate/fadeIn.css"
import "@quasar/extras/animate/fadeOut.css"


// To be used on app.use(Quasar, { ... })
export default <QuasarPluginOptions>{
  config: {

  },
  iconSet: iconSet,
  plugins: {
    Dark,
    Loading,
    Dialog,
    Notify
  },
  lang: lang
}