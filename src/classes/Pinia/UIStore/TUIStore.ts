import type {GetLaunchParamsResponse} from "@vkontakte/vk-bridge";
import type {TUser} from "@/classes/Pinia/UIStore/TUser";

export type TUIStore = {
    isReady: boolean,
    launchError: boolean,
    launchParams?:GetLaunchParamsResponse,
    user?: TUser,
    userQueryError: boolean,
}