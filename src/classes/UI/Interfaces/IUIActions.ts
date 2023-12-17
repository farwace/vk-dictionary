import type {App} from '@vue/runtime-core';
import type {TAddToHomeScreenResultStatuses} from "@/classes/UI/Interfaces/TAddToHomeScreenResultStatuses";
import type {ShowSlidesSheetRequest} from "@vkontakte/vk-bridge/dist/types/src/types/data";
import {EGetLaunchParamsResponseLanguages} from "@vkontakte/vk-bridge";
import {ISystemActions} from "@/classes/System/Interfaces/ISystemActions";

export interface IUIActions {
    install(app:App, successfulInitialize: boolean):void;
    addToHomeScreen(): Promise<TAddToHomeScreenResultStatuses>;
    addToFavorites():Promise<boolean>;
    getLanguage():EGetLaunchParamsResponseLanguages;
    showWelcomeSlides(slides:ShowSlidesSheetRequest):void;

    getApi():ISystemActions;
    setLanguage(languageId: number, learnLanguageId: number):Promise<void>;
    setTranscription(isEnabled:boolean):Promise<void>;
    loadCollections():Promise<any>;
}