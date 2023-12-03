import type {App} from '@vue/runtime-core';
import type {TAddToHomeScreenResultStatuses} from "@/classes/UI/Interfaces/TAddToHomeScreenResultStatuses";

export interface IUIActions {
    install(app:App, successfulInitialize: boolean):void;
    addToHomeScreen(): Promise<TAddToHomeScreenResultStatuses>;
    addToFavorites():Promise<boolean>;
}