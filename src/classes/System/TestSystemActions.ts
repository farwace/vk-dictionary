import type {ISystemActions} from "@/classes/System/Interfaces/ISystemActions";
import type {GetLaunchParamsResponse} from "@vkontakte/vk-bridge";
import {injectable} from "inversify";
import {TUser} from "@/classes/Pinia/UIStore/TUser";
import bridge from "@vkontakte/vk-bridge";

@injectable()
export class TestSystemActions implements ISystemActions{
    private timer(ms:number):Promise<void> {
        return new Promise((res) => {
            setTimeout(() => {
                res();
            }, ms)
        })
    }
    checkLaunchParams = async (): Promise<boolean> => {
        await this.timer(200);
        return true;
    }

    getUserInfo = async (launchParams: GetLaunchParamsResponse):Promise<TUser|undefined>=> {
        try {
            const userInfo = await bridge.send('VKWebAppGetUserInfo', {user_id: launchParams.vk_user_id})
            await this.timer(2000);
            return {
                userId: userInfo.id,
                first_name: userInfo.first_name,
                last_name: userInfo.last_name,
                photo_100: userInfo.photo_100,

                id: 1,
                experience: 0,
                isNew: true,
            }
        }
        catch (e){
            await this.timer(2000);
            return undefined;
        }
    }
}