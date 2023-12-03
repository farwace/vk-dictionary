import {GetLaunchParamsResponse} from "@vkontakte/vk-bridge";

export type TLaunchParams = GetLaunchParamsResponse & {
    isReady: boolean
}