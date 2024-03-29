import type {App} from '@vue/runtime-core';
import type {TAddToHomeScreenResultStatuses} from "@/classes/UI/Interfaces/TAddToHomeScreenResultStatuses";
import type {ShowSlidesSheetRequest} from "@vkontakte/vk-bridge/dist/types/src/types/data";
import {EGetLaunchParamsResponseLanguages} from "@vkontakte/vk-bridge";
import {ISystemActions} from "@/classes/System/Interfaces/ISystemActions";
import {TCollection, TCollections} from "@/classes/Pinia/UIStore/TCollection";
import {TWord, TWords} from "@/classes/Pinia/UIStore/TWord";

export interface IUIActions {
    install(app:App, successfulInitialize: boolean):void;
    addToHomeScreen(): Promise<TAddToHomeScreenResultStatuses>;
    addToFavorites():Promise<boolean>;
    getLanguage():EGetLaunchParamsResponseLanguages;
    showWelcomeSlides(slides:ShowSlidesSheetRequest):void;
    copyToClipboard(str:string):Promise<boolean>;

    setContentHeight(val:string):void;
    getApi():ISystemActions;
    setLanguage(languageId: number, learnLanguageId: number):Promise<void>;
    setTranscription(isEnabled:boolean):Promise<boolean>;
    loadCollections():Promise<any>;
    createCollection(name: string, description: string):Promise<TCollection>
    updateSystemCollections():Promise<TCollections>;
    updateUserCollections():Promise<TCollections>;
    getCollectionWords(collectionId:number):Promise<TWords>;
    getSystemCollectionWords(collectionId:number):Promise<TWords>;
    cloneCollection(collectionOrShareId: number | string):Promise<TCollection>;
    addWordToCollection(neoWord: string, neoTranscription: string, neoForeignWord: string, collectionId: number):Promise<TWord>;
    removeWord(wordId:number|number[]):Promise<boolean>;
    updateWord(word: TWord):Promise<boolean>;
    updateWords(words: TWord[]):Promise<boolean>;
    updateCollection(collection:TCollection):Promise<boolean>;
    removeCollection(collectionId:number):Promise<boolean>;
    share(hash?: string, text?:string):Promise<boolean>;
    clearSharedId():void;
    updateTrainingWords(arCollections: number[]):Promise<void>;
    addWordExperience(wordId: number, count: number):Promise<void>;
    showBetweenScreenAd():Promise<void>;
    trySubscribe(days:number):Promise<boolean>;
    updateUserInfo():Promise<void>;
    updateShareLink(collectionId: number, doClear:boolean):Promise<string>;
    tryCloneCollection(collectionOrShareId: number | string):Promise<void>;
    setLoading(show:boolean):void;
    toggleSoundEnabled(val?:boolean):void;
    toggleVibrateEnabled(val?:boolean):void;
    vibro(force?:boolean):void;
    tryTranslate(str:string):Promise<string|undefined>;
    easyStart():Promise<number[] | undefined>;
    tryAllowNotifications():void;
    tryRecommend():void;
}