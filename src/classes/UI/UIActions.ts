import type {IUserActionsInterface} from "@/classes/UserActions/Interfaces/IUserActionsInterface";
import type {TAddToHomeScreenResultStatuses} from "@/classes/UI/Interfaces/TAddToHomeScreenResultStatuses";
import type {App} from "@vue/runtime-core";
import type {IUIActions} from "@/classes/UI/Interfaces/IUIActions";
import {inject, injectable} from "inversify";
import bridge, {EGetLaunchParamsResponseLanguages} from "@vkontakte/vk-bridge";
import {UIStore} from "@/classes/Pinia/UIStore/UIStore";
import {ISystemActions} from "@/classes/System/Interfaces/ISystemActions";
import {ShowSlidesSheetRequest} from "@vkontakte/vk-bridge/dist/types/src/types/data";

@injectable()
export class UIActions implements IUIActions{
    private UIStore;
    private language:EGetLaunchParamsResponseLanguages = EGetLaunchParamsResponseLanguages.RU;

    constructor(
        @inject('UserActions')
        private userActions: IUserActionsInterface,

        @inject('API')
        private API:ISystemActions
    ) {
        this.UIStore = UIStore();
    }

    getLanguage(){
        return this.language;
    }
    install(app: App, successfulInitialize:boolean) {
        app.provide('UI', this);
        if(successfulInitialize){
            this.queryLaunchParams().then(() => {
                const launchParams = this.UIStore.$state.launchParams;
                if(launchParams){
                    this.API.getUserInfo(launchParams).then((res) => {
                        if(res){
                            this.UIStore.$patch({
                                user: res,
                                isReady: true,
                            })
                        }
                        else{
                            this.UIStore.$patch({userQueryError: true});
                        }
                    }).catch(() => {
                        this.UIStore.$patch({userQueryError: true});
                    })
                }

            }).catch(() => {

            });
        }
        else{
            this.setInitializeError();
        }
    }

    setInitializeError(){
        this.UIStore.$patch({
            launchError: true
        });
    }

    async queryLaunchParams(){
        try {
            const launchParams = await bridge.send('VKWebAppGetLaunchParams');
            if(launchParams.vk_app_id){
                this.UIStore.$patch({
                    launchParams: launchParams
                });
                if(launchParams.vk_language in ['ru', 'en']){
                    this.language = launchParams.vk_language;
                }
            }
        }
        catch (e){

        }
    }

    CanIAddToHomeScreen = async () => {
        try {
            const checkIfICan = await this.userActions.CheckAddHomeScreen();
            return checkIfICan.canAdd && !checkIfICan.isAdded;
        }
        catch (e){
            return false;
        }

    }

    addToHomeScreen = async (): Promise<TAddToHomeScreenResultStatuses> => {
        try {
            const CanIAdd = await this.userActions.CheckAddHomeScreen();
            if(CanIAdd.isAdded){
                return "ALREADY_ADDED";
            }
            if(CanIAdd.canAdd && !CanIAdd.isAdded){
                try {
                    if(await this.userActions.AddToHomeScreen()){
                        return "SUCCESS";
                    }
                    else{
                        return "ERROR";
                    }
                }
                catch (e1){
                    return "ERROR";
                }
            }
            return "CAN_NOT_ADD";
        }
        catch (e){
            return "ERROR";
        }
    }

    addToFavorites = async (): Promise<boolean> => {
        try {
            return await this.userActions.AddToFavorites();
        }
        catch (e){
            return false;
        }
    }

    showWelcomeSlides(slides: ShowSlidesSheetRequest){
        console.log('sendShowSLides')
        bridge.send('VKWebAppShowSlidesSheet', slides).then().catch();
    }
}