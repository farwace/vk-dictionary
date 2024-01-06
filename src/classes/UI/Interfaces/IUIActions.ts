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

    setContentHeight(val:string):void;
    getApi():ISystemActions;
    setLanguage(languageId: number, learnLanguageId: number):Promise<void>;
    setTranscription(isEnabled:boolean):Promise<void>;
    loadCollections():Promise<any>;
    createCollection(name: string, description: string):Promise<TCollection>
    updateSystemCollections():Promise<TCollections>;
    updateUserCollections():Promise<TCollections>;
    getCollectionWords(collectionId:number):Promise<TWords>;
    getSystemCollectionWords(collectionId:number):Promise<TWords>;
    cloneCollection(collectionId: number):Promise<TCollection>;
    addWordToCollection(neoWord: string, neoTranscription: string, neoForeignWord: string, collectionId: number):Promise<TWord>;
    removeWord(wordId:number):Promise<boolean>;
    updateWord(word: TWord):Promise<boolean>;
    updateCollection(collection:TCollection):Promise<boolean>;
    removeCollection(collectionId:number):Promise<boolean>;
    share(hash?: string):Promise<boolean>;
    clearSharedId():void;
    updateTrainingWords(arCollections: number[]):Promise<void>;
}