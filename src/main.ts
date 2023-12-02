import { createApp } from 'vue'
import App from './App.vue'
import bridge from "@vkontakte/vk-bridge";
import { Quasar } from 'quasar'
import quasarUserOptions from './quasar-user-options'

createApp(App).use(Quasar, quasarUserOptions).mount('#app');
bridge.send('VKWebAppInit');