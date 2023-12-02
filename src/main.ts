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

var container = new Container();


container.bind<IUserActionsInterface>('UserActions').to(UserActions);
container.bind<IUIActions>('UI').to(UIActions);

const app = createApp(App);
app.use(Quasar, quasarUserOptions);
const UILayer:IUIActions = container.get('UI');
UILayer.install(app);
app.mount('#app');


bridge.send('VKWebAppInit');