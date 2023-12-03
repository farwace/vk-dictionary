import type {TUser} from "@/classes/Pinia/UIStore/TUser";
import {GetLaunchParamsResponse} from "@vkontakte/vk-bridge";

export interface ISystemActions{
    /** Проверяет параметры запуска, делает запрос на бэк чтобы пройти валидацию параметров */
    checkLaunchParams():Promise<boolean>;
    /** получает инфу с вк о пользователе и делает запрос на бэк для обновления и получения доп инфы о пользователе */
    getUserInfo(launchParams: GetLaunchParamsResponse):Promise<TUser|undefined>,
}