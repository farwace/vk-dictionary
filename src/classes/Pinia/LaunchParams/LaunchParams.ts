import type {TLaunchParams} from "@/classes/Pinia/LaunchParams/TLaunchParams";
import {defineStore} from "pinia";
import { EGetLaunchParamsResponseGroupRole, EGetLaunchParamsResponseLanguages, EGetLaunchParamsResponsePlatforms } from "@vkontakte/vk-bridge";

export const LaunchParams = defineStore('LaunchParams', {
    state:():TLaunchParams=>{
        return {
            isReady: false,
            vk_app_id: 0,
            sign: '',
            vk_group_id: undefined,
            vk_are_notifications_enabled: 0,
            vk_is_app_user: 0,
            vk_ts: 0,
            vk_ref: '',
            vk_is_favorite: 0,
            vk_language: EGetLaunchParamsResponseLanguages.RU,
            vk_platform: EGetLaunchParamsResponsePlatforms.DESKTOP_WEB,
            vk_user_id: 0,
            vk_viewer_group_role: EGetLaunchParamsResponseGroupRole.NONE,
            vk_access_token_settings: ''
        }
    }
});