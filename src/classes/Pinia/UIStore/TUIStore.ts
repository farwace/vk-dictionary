import type {GetLaunchParamsResponse} from "@vkontakte/vk-bridge";
import type {TUser} from "@/classes/Pinia/UIStore/TUser";
import type {TGetLang} from "@/classes/Pinia/UIStore/TLang";

export type TUIStore = {
    isReady: boolean,
    launchError: boolean,
    launchParams?:GetLaunchParamsResponse,
    user: TUser,
    userQueryError: boolean,
    availableLanguages: TGetLang,
    isLoading: boolean,
}