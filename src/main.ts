import App from './App.vue'
import "reflect-metadata";
import bridge from "@vkontakte/vk-bridge";
import { createApp } from 'vue'
import {doInstall} from "@/classes/install/doInstall";
import i18n from "@/classes/install/i18n";


const app = createApp(App);

app.use(i18n);
doInstall.run(app);

app.mount('#app');
bridge.send('VKWebAppInit');


/*TODO:
    - Окно загрузки приложения пока получаются Launch Params, информация о пользователе из базы данных и т.д.
    - При первом запуске отображать слайдер с инструкцией https://dev.vk.com/ru/mini-apps/development/information-screens
    - При запуске делать запрос на бэк с ID юзера, получать список доступных словарей, уровень, опыт,
    -
*/