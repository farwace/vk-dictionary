import type {TUser} from "@/classes/Pinia/UIStore/TUser";
import type {GetLaunchParamsResponse} from "@vkontakte/vk-bridge";
import type {TRawWord, TWord} from "@/classes/Pinia/UIStore/TWord";
import type {TGetLang} from "@/classes/Pinia/UIStore/TLang";
import type {TCollection, TCollections} from "@/classes/Pinia/UIStore/TCollection";

export interface ISystemActions{
    /** Проверяет параметры запуска, делает запрос на бэк чтобы пройти валидацию параметров */
    checkLaunchParams():Promise<boolean>;
    /** получает инфу с вк о пользователе и делает запрос на бэк для обновления и получения доп инфы о пользователе */
    getUserInfo(launchParams: GetLaunchParamsResponse):Promise<TUser|undefined>,
    /** возвращает список слов для тренировки */
    getWordsForTraining(langId: number, originalLangId: number, arCollectionIds: number[]):Promise<TRawWord[]>;

    getCollections(langId: number, originalLangId: number):Promise<TCollections>;
    getSystemCollections(langId: number, originalLangId: number):Promise<TCollections>;
    createCollection(name: string, langId: number, originalLangId: number, description:string):Promise<TCollection>;
    cloneCollection(collectionId: number|string):Promise<TCollection>;
    getCollectionWords(collectionId: number):Promise<any>;
    addNeoWord(neoWord: TWord):Promise<any>;
    updateWord(neoWord: TWord):Promise<string>;
    updateWords(neoWords: TWord[]):Promise<string>;
    updateWordExperience(wordsExperience: { wordId: number; experience: number }[]):Promise<any>;
    getLanguages():Promise<TGetLang>;
    setLanguage(langId: number, learnLangId: number):Promise<{result: 'ok' | 'error'}>;
    toggleTranscription(isEnabled: boolean):Promise<any>;
    removeWord(wordId:number|number[]):Promise<string>;
    updateCollection(collection:TCollection):Promise<string>;
    removeCollection(collectionId: number):Promise<string>;
    updateShareLink(collectionId:number, clear:boolean):Promise<string>;
    getCloneCollectionInfo(collectionOrShareId: number | string):Promise<{collection?: TCollection, words?: TWord[]}>
}