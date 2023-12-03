import type {IUserActionsInterface} from "@/classes/UserActions/Interfaces/IUserActionsInterface";
import type {TAddToHomeScreenResultStatuses} from "@/classes/UI/Interfaces/IUIActions";
import type {App} from "@vue/runtime-core";
import type {IUIActions} from "@/classes/UI/Interfaces/IUIActions";
import {inject, injectable} from "inversify";
import bridge, {GetLaunchParamsResponse} from "@vkontakte/vk-bridge";
import {LaunchParams} from "@/classes/Pinia/LaunchParams/LaunchParams";

@injectable()
export class UIActions implements IUIActions{
    private LaunchParamsStore;
    constructor(
        @inject('UserActions')
        private userActions: IUserActionsInterface
    ) {
        this.LaunchParamsStore = LaunchParams();
    }

    install(app: App) {
        app.provide('UI', this);
        this.queryLaunchParams().then();
    }

    async queryLaunchParams(){
        try {
            console.log('TRY');
            const launchParams = await bridge.send('VKWebAppGetLaunchParams');
            console.log('AFTER SEND...')
            if(launchParams.vk_app_id){
                console.log('IF');
                this.LaunchParamsStore.$patch({
                    isReady: true,
                    vk_app_id: launchParams.vk_app_id,
                    sign: launchParams.sign,
                    vk_access_token_settings: launchParams.vk_access_token_settings,
                    vk_are_notifications_enabled: launchParams.vk_are_notifications_enabled,
                    vk_group_id: launchParams.vk_group_id,
                    vk_is_app_user: launchParams.vk_is_app_user,
                    vk_is_favorite: launchParams.vk_is_favorite,
                    vk_language: launchParams.vk_language,
                    vk_platform: launchParams.vk_platform,
                    vk_ref: launchParams.vk_ref,
                    vk_ts: launchParams.vk_ts,
                    vk_user_id: launchParams.vk_user_id,
                    vk_viewer_group_role: launchParams.vk_viewer_group_role
                })
            }
            else{
                console.log('ELSE');
                this.LaunchParamsStore.$patch({isReady:true});
            }
        }
        catch (e){
            console.log('CATCH');
            this.LaunchParamsStore.$patch({isReady:true});
        }
    }

    // getLaunchParams():GetLaunchParamsResponse|undefined{
    //     return this.LaunchParams;
    // }

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
}