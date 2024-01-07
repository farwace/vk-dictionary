import App from './App.vue'
import "reflect-metadata";
import bridge from "@vkontakte/vk-bridge";
import { createApp } from 'vue'
import {doInstall} from "@/classes/install/doInstall";
import i18n from "@/classes/install/i18n";


const app = createApp(App);

app.use(i18n);
await doInstall.run(app);

app.mount('#app');
bridge.send('VKWebAppInit'); //todo: dev убрать для теста


/*TODO:
    - Параметры звука вкл/выкл
    - Возможность купить подписку на безлимитные тренировки
    - Удалить профиль, весь прогресс и наборы слов ???.
    -
    -
    - Если прошел > 3 тренировки - предложить добавить в избранное
    - Бейджики со счетчиками оповещений
    - Уведомления настраиваются в админке вк...

*/