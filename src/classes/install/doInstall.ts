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
import {TestSystemActions} from "@/classes/System/TestSystemActions";


export class doInstall{
    public static run(app: App){
        app.use(Quasar, quasarUserOptions);
        app.use(createPinia());

        const container = new Container();
        container.bind<IUserActionsInterface>('UserActions').to(UserActions);
        container.bind<IUIActions>('UI').to(UIActions).inSingletonScope();
        container.bind<ISystemActions>('API').to(TestSystemActions).inSingletonScope();
        const UILayer:IUIActions = container.get('UI');
        const API:ISystemActions = container.get('API');


        API.checkLaunchParams().then((res) => {
            UILayer.install(app, res);
        });
    }
}