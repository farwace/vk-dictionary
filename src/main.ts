import type {IUserActionsInterface} from "@/classes/UserActions/Interfaces/IUserActionsInterface";
import type {IUIActions} from "@/classes/UI/Interfaces/IUIActions";
import App from './App.vue'
import {Container} from "inversify";
import "reflect-metadata";
import {UserActions} from "@/classes/UserActions/UserActions";
import bridge from "@vkontakte/vk-bridge";
import quasarUserOptions from './quasar-user-options'
import { createApp } from 'vue'
import { Quasar } from 'quasar'
import {UIActions} from "@/classes/UI/UIActions";

const container = new Container();


container.bind<IUserActionsInterface>('UserActions').to(UserActions);
container.bind<IUIActions>('UI').to(UIActions).inSingletonScope();

const UILayer:IUIActions = container.get('UI');

const app = createApp(App);
app.use(Quasar, quasarUserOptions);
UILayer.install(app);
app.mount('#app');
bridge.send('VKWebAppInit');


/*TODO:
    - Окно загрузки приложения пока получаются Launch Params, информация о пользователе из базы данных и т.д.
    - При первом запуске отображать слайдер с инструкцией https://dev.vk.com/ru/mini-apps/development/information-screens
    - При запуске делать запрос на бэк с ID юзера, получать список доступных словарей, уровень, опыт,
    -
*/