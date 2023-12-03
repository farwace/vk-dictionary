import {injectable} from "inversify";
import type {IUserActionsInterface} from "@/classes/UserActions/Interfaces/IUserActionsInterface";
import type {TICanAddToHomeScreen} from "@/classes/UserActions/Interfaces/TICanAddToHomeScreen"
import bridge from "@vkontakte/vk-bridge";

@injectable()
export class UserActions implements IUserActionsInterface{
    async AddToHomeScreen():Promise<boolean> {
        try {
            const addResult = await bridge.send('VKWebAppAddToHomeScreen');
            if(addResult.result){
                return true;
            }
        }
        catch (e){

        }
        return false;
    }
    async CheckAddHomeScreen(): Promise<TICanAddToHomeScreen> {
        const res:TICanAddToHomeScreen = {canAdd: false, isAdded:false};
        try {
            const IsInHomeScreenOb = await bridge.send('VKWebAppAddToHomeScreenInfo');
            res.isAdded = IsInHomeScreenOb.is_added_to_home_screen;
            res.canAdd = IsInHomeScreenOb.is_feature_supported;
        }
        catch (e){

        }
        return res;
    }

    async AddToFavorites(): Promise<boolean> {

        try {
            const addResult = await bridge.send('VKWebAppAddToFavorites');
            if(addResult.result){
                return true;
            }
        }
        catch (e){

        }

        return false;
    }
}