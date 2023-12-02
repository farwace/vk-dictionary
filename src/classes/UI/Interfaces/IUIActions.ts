import {App} from '@vue/runtime-core';
import {GetLaunchParamsResponse} from "@vkontakte/vk-bridge";
export interface IUIActions {
    install(app:App):void;
    queryLaunchParams():Promise<void>;
    getLaunchParams():GetLaunchParamsResponse|undefined;
    addToHomeScreen(): Promise<TAddToHomeScreenResultStatuses>;
    addToFavorites():Promise<boolean>;
}

export type TAddToHomeScreenResultStatuses = "SUCCESS" | "ERROR" | "ALREADY_ADDED" | "CAN_NOT_ADD";