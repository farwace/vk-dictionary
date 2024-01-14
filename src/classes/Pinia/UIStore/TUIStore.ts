import type {GetLaunchParamsResponse} from "@vkontakte/vk-bridge";
import type {TUser} from "@/classes/Pinia/UIStore/TUser";
import type {TGetLang} from "@/classes/Pinia/UIStore/TLang";
import type {TCollection, TCollections} from "@/classes/Pinia/UIStore/TCollection";
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
    appliedCollection: { collection?:TCollection, words?: TWord[], filled: boolean},
    appliedCollectionId: number,
    trainingWords?:TWord[],
    trainingCollections: number[],
    isSoundEnabled: boolean,
    collectionExamples: {[key:string]:TWord[]}
}