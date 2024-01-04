import type {GetLaunchParamsResponse} from "@vkontakte/vk-bridge";
import type {TUser} from "@/classes/Pinia/UIStore/TUser";
import type {TGetLang} from "@/classes/Pinia/UIStore/TLang";
import type {TCollections} from "@/classes/Pinia/UIStore/TCollection";
import type {TWord, TWords} from "@/classes/Pinia/UIStore/TWord";

export type TUIStore = {
    isReady: boolean,
    launchError: boolean,
    launchParams?:GetLaunchParamsResponse,
    user: TUser,
    userQueryError: boolean,
    availableLanguages: TGetLang,
    isLoading: boolean,
    collections: TCollections,
    systemCollections: TCollections,
    currentCollectionWords?:TWord[],
    contentHeight:string,
    Authorization: string,
}