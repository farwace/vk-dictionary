import {injectable} from "inversify";
import type {IUserActionsInterface, TICanAddToHomeScreen} from "@/classes/UserActions/Interfaces/IUserActionsInterface";
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
        let res:TICanAddToHomeScreen = {canAdd: false, isAdded:false};
        try {
            const IsInHomeScreenOb = await bridge.send('VKWebAppAddToHomeScreenInfo');
            res.isAdded = IsInHomeScreenOb.is_added_to_home_screen;
            res.canAdd = IsInHomeScreenOb.is_feature_supported;
        }
        catch (e){

        }
        return res;
    }
}