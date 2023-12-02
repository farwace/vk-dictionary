import {App} from '@vue/runtime-core';
export interface IUIActions {
    install(app:App):void;
    addToHomeScreen(): Promise<TAddToHomeScreenResultStatuses>;
    addToFavorites():Promise<boolean>;
}

export type TAddToHomeScreenResultStatuses = "SUCCESS" | "ERROR" | "ALREADY_ADDED" | "CAN_NOT_ADD";