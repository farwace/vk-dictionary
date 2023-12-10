import type {TUser} from "@/classes/Pinia/UIStore/TUser";
import type {GetLaunchParamsResponse} from "@vkontakte/vk-bridge";
import type {TWord} from "@/classes/Pinia/UIStore/TWord";

export interface ISystemActions{
    /** Проверяет параметры запуска, делает запрос на бэк чтобы пройти валидацию параметров */
    checkLaunchParams():Promise<boolean>;
    /** получает инфу с вк о пользователе и делает запрос на бэк для обновления и получения доп инфы о пользователе */
    getUserInfo(launchParams: GetLaunchParamsResponse):Promise<TUser|undefined>,
    /** возвращает список слов для тренировки */
    getWordsForTraining(langId: number, arCollectionIds: number[]):Promise<any[]>;

    getCollections(langId: number):Promise<any>;
    getSystemCollections(langId: number):Promise<any>;
    createCollection(name: string, langId: number):Promise<any>;
    cloneCollection(collectionId: number):Promise<any>;
    getCollectionWords(collectionId: number):Promise<any>;
    addNeoWord(collectionId: number, neoWord: TWord):Promise<any>;
    updateWord(neoWord: TWord):Promise<any>;
    updateWordExperience(wordsExperience: { wordId: number; experience: number }[]):Promise<any>;
}