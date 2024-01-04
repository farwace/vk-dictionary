import type {App} from "@vue/runtime-core";
import {Quasar} from "quasar";
import quasarUserOptions from "@/quasar-user-options";
import {createPinia} from "pinia";
import {Container} from "inversify";
import {IUserActionsInterface} from "@/classes/UserActions/Interfaces/IUserActionsInterface";
import {UserActions} from "@/classes/UserActions/UserActions";
import {IUIActions} from "@/classes/UI/Interfaces/IUIActions";
import {UIActions} from "@/classes/UI/UIActions";
import {ISystemActions} from "@/classes/System/Interfaces/ISystemActions";
import {SystemActions} from "@/classes/System/SystemActions";
import {createRouter, createWebHistory} from "vue-router";

import HomePage from "@/components/Pages/HomePage.vue";
import CollectionDetail from "@/components/Pages/CollectionDetail.vue";
import WordTranslation from "@/components/Pages/Trainings/WordTranslation.vue";
import FAQ from "@/components/Pages/FAQ.vue";
//import {TestSystemActions} from "@/classes/System/TestSystemActions";


export class doInstall{
    public static run = async (app: App)=> {
        app.use(Quasar, quasarUserOptions);
        app.use(createPinia());
        doInstall.addRoutes(app);
        const container = new Container();
        container.bind<IUserActionsInterface>('UserActions').to(UserActions);
        container.bind<IUIActions>('UI').to(UIActions).inSingletonScope();
        container.bind<ISystemActions>('API').to(SystemActions).inSingletonScope();
        const UILayer:IUIActions = container.get('UI');
        const API:ISystemActions = container.get('API');

        try {
            const checkLaunchStatus = await API.checkLaunchParams();
            UILayer.install(app, checkLaunchStatus);
        }
        catch (e){

        }
    }

    private static addRoutes = (app: App) => {
        const routes = [
            {name: 'home', path: '/', component: HomePage},
            {name: 'collection', path: '/collection/:id', component: CollectionDetail},
            {name: 'faq', path: '/faq', component: FAQ},
            {name: 'trainingWordTranslation', path: '/training/word-translation', component: WordTranslation},
        ];

        const router = createRouter({
            history: createWebHistory(),
            routes,
        });

        app.use(router);
    }
}