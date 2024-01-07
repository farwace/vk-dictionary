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
import Vue3Lottie from 'vue3-lottie'
import HomePage from "@/components/Pages/HomePage.vue";
import CollectionDetail from "@/components/Pages/CollectionDetail.vue";
import FAQ from "@/components/Pages/FAQ.vue";
import Training from "@/components/Pages/Trainings/Training.vue";
import {ISoundActions} from "@/classes/UI/Interfaces/ISoundActions";
import {SoundActions} from "@/classes/UI/SoundActions";
//import {TestSystemActions} from "@/classes/System/TestSystemActions";


export class doInstall{
    public static run = async (app: App)=> {
        app.use(Quasar, quasarUserOptions);
        app.use(createPinia());
        app.use(Vue3Lottie, {name: 'Vue3Lottie'});
        doInstall.addRoutes(app);
        const container = new Container();
        container.bind<IUserActionsInterface>('UserActions').to(UserActions);
        container.bind<IUIActions>('UI').to(UIActions).inSingletonScope();
        container.bind<ISystemActions>('API').to(SystemActions).inSingletonScope();
        container.bind<ISoundActions>('SOUND').to(SoundActions).inSingletonScope();
        const UILayer:IUIActions = container.get('UI');
        const API:ISystemActions = container.get('API');
        const SoundLayer:ISoundActions = container.get('SOUND');

        try {
            const checkLaunchStatus = await API.checkLaunchParams();
            UILayer.install(app, checkLaunchStatus);
            SoundLayer.install(app);
        }
        catch (e){

        }
    }

    private static addRoutes = (app: App) => {
        const routes = [
            {name: 'home', path: '/', component: HomePage},
            {name: 'collection', path: '/collection/:id', component: CollectionDetail},
            {name: 'faq', path: '/faq', component: FAQ},
            {name: 'training', path: '/training', component: Training},
        ];

        const router = createRouter({
            history: createWebHistory(),
            routes,
        });

        app.use(router);
    }
}