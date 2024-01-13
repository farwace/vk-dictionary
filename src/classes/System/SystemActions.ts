import type {ISystemActions} from "@/classes/System/Interfaces/ISystemActions";
import type {GetLaunchParamsResponse, UserInfo} from "@vkontakte/vk-bridge";
import type {TGetUserInfo, TUser} from "@/classes/Pinia/UIStore/TUser";
import {injectable} from "inversify";
import type {TWord} from "@/classes/Pinia/UIStore/TWord";
import bridge from "@vkontakte/vk-bridge";
import {UIStore} from "@/classes/Pinia/UIStore/UIStore";
import {TGetLang} from "@/classes/Pinia/UIStore/TLang";
import {TCollection, TCollections} from "@/classes/Pinia/UIStore/TCollection";

@injectable()
export class SystemActions implements ISystemActions{
    private API_URL:string = 'https://api.dictionary.total-black.ru/api/';
    //private API_URL:string = 'http://127.0.0.1:4001/api/';
    //private API_URL:string = 'http://192.168.0.155:4001/api/';//todo: dev вернуть

    private UIStore;

    private CAN_TOGGLE_TRANSCRIPTION:boolean = true;

    constructor() {
        this.UIStore = UIStore();
    }
    checkLaunchParams = async () => {
        this.UIStore.$patch({
            Authorization: `Bearer ${window.location.search.slice(1)}`
        });
        const fetchResult = await this.sendQuery('launchParams', {}, 'POST');
        return fetchResult.ok;
    }

    getUserInfo = async (launchParams: GetLaunchParamsResponse): Promise<TUser | undefined> => {
        try {
            const userInfo = await bridge.send('VKWebAppGetUserInfo', {user_id: launchParams.vk_user_id}); //todo: dev вернуть!!!
            //todo: dev убрать для теста
            /*const userInfo:UserInfo = {
                first_name: 'Виталий',
                last_name: 'Панфилов',
                photo_100: 'https://sun150-2.userapi.com/s/v1/ig2/XWo-x21PL_JxvDM09fwi0HFV_SyYD3GCLDPHrfE5XFw-3Nvln9gQ7u3DQt4DH0YrerdYS2mOZsrC6Ftn1JD_lVuM.jpg?size=50x50&quality=95&crop=225,243,427,427&ava=1',
                id: 73736329,
                city: {
                    id: 1,
                    title: 'empty'
                },
                sex: 0,
                country: {
                    id: 0,
                    title: 'RUssia'
                },
                photo_200: 'https://sun150-2.userapi.com/s/v1/ig2/XWo-x21PL_JxvDM09fwi0HFV_SyYD3GCLDPHrfE5XFw-3Nvln9gQ7u3DQt4DH0YrerdYS2mOZsrC6Ftn1JD_lVuM.jpg?size=50x50&quality=95&crop=225,243,427,427&ava=1',
            } */

            const fetchResult = await this.sendQuery('getUserInfo', {
                firstName: userInfo.first_name,
                lastName: userInfo.last_name,
            }, 'POST');
            const bUser = await fetchResult.json() as TGetUserInfo;

            let subscriptionExpired = bUser.subscriptionExpired as unknown as string;
            let subscriptionExpiredDate: Date | undefined = undefined;
            const currentDate = new Date();
            if(subscriptionExpired && subscriptionExpired.length > 0){
                subscriptionExpiredDate = new Date(subscriptionExpired);
                if(currentDate > subscriptionExpiredDate){
                    subscriptionExpiredDate = undefined;
                }
            }

            return {
                userId: userInfo.id,
                first_name: userInfo.first_name,
                last_name: userInfo.last_name,
                photo_100: userInfo.photo_100,
                subscriptionExpired: subscriptionExpiredDate,
                id: bUser.id,
                experience: bUser.experience,
                isNew: bUser.isNew,
                lives: bUser.lives,
                userLangId: bUser.userLangId,
                displayTranscription: bUser.displayTranscription,
                userLearnLangId: bUser.userLearnLangId,
            }
        }
        catch (e){
            return undefined;
        }


    }

    getWordsForTraining = async (langId: number, originalLangId: number, arCollections?: number[]) => {
        try {
            const fetchResult = await this.sendQuery('training', {
                langId: langId,
                originalLangId: originalLangId,
                arCollections: arCollections || [],
            });
            return await fetchResult.json();
        }
        catch (e){
            return [];
        }
    }

    getCollections = async (langId: number, originalLangId: number):Promise<TCollections> => {
        try {
            const fetchResult = await this.sendQuery('collections', {
                langId: langId,
                originalLangId: originalLangId,
            });
            return await fetchResult.json();
        }
        catch (e){
            return [];
        }
    }

    createCollection = async (name: string, langId: number, originalLangId: number, description = ''): Promise<TCollection> => {
        try {
            const fetchResult = await this.sendQuery('neoCollection', {
                langId: langId,
                originalLangId: originalLangId,
                name: name,
                description: description
            });
            return await fetchResult.json();
        }
        catch (e){
            return {};
        }
    }
    cloneCollection = async (collectionId: number|string): Promise<TCollection> => {
        try {
            const fetchResult = await this.sendQuery('cloneCollection', {
                collectionId: collectionId,
            });
            return await fetchResult.json();
        }
        catch (e){
            return {};
        }
    }
    getCollectionWords = async (collectionId: number): Promise<any> => {
        try {
            const fetchResult = await this.sendQuery('words', {
                collectionId: collectionId,
            });
            return await fetchResult.json();
        }
        catch (e){
            return [];
        }
    }

    addNeoWord = async (neoWord: TWord): Promise<any> => {
        try {
            const fetchResult = await this.sendQuery('neoWord', {
                collectionId: neoWord.collectionId,
                neoWord: neoWord
            });
            return await fetchResult.json();
        }
        catch (e){
            return [];
        }
    }


    getSystemCollections = async (langId: number, originalLangId: number):Promise<TCollections> => {
        try {
            const fetchResult = await this.sendQuery('systemCollections', {
                langId: langId,
                originalLangId: originalLangId,
            });
            return await fetchResult.json();
        }
        catch (e){
            return [];
        }
    }

    updateWord = async (word: TWord) => {
        try {
            const fetchResult = await this.sendQuery('updateWord', {
                neoWord: word
            });
            return await fetchResult.text();
        }
        catch (e){
            return '';
        }
    }

    updateWordExperience = async (wordsExperience: { wordId: number; experience: number }[]): Promise<any> => {
        try {
            const fetchResult = await this.sendQuery('updateWordsExperience', {
                wordsExperience: wordsExperience
            });
            return await fetchResult.json();
        }
        catch (e){
            return {};
        }
    }

    getLanguages = async (): Promise<TGetLang> => {
        try {
            const fetchResult = await this.sendQuery('getLanguages', {});
            return await fetchResult.json();
        }
        catch (e){
            return [];
        }
    }
    setLanguage = async (langId: number, learnLangId: number):Promise<{result: 'ok' | 'error'}> => {
        try {
            try {
                const fetchResult = await this.sendQuery('setLanguage', {
                    langId: langId,
                    learnLangId: learnLangId
                });
                return await fetchResult.json();
            }
            catch (e){
                return {result: 'error'};
            }
        }
        catch (e){
            return {result: 'error'}
        }
    }

    toggleTranscription = async (isEnabled: boolean): Promise<any> => {
        try {
            if(!this.CAN_TOGGLE_TRANSCRIPTION){
                await this.timeout(800);
            }
            this.CAN_TOGGLE_TRANSCRIPTION = false;
            const fetchResult = await this.sendQuery('toggleTranscription', {
                isEnabled: isEnabled
            });
            this.delayCanToggleTranscription();
            return await fetchResult.json();
        }
        catch (e){
            return [];
        }
    }

    delayCanToggleTranscription = () => {
        this.timeout(1000).then(() => {
            this.CAN_TOGGLE_TRANSCRIPTION = true;
        })
    }

    removeWord = async (wordId: number):Promise<string> => {
        try {
            const fetchResult = await this.sendQuery('removeWord', {
                id:wordId
            });
            return await fetchResult.text();
        }
        catch (e){
            return '';
        }
    }

    updateCollection = async(collection:TCollection):Promise<string> => {
        try {
            const fetchResult = await this.sendQuery('updateCollection', {
                neoCollection: {
                    name: collection.name,
                    id: collection.id,
                    description: collection.description
                }
            });
            return await fetchResult.text();
        }
        catch (e){
            return '';
        }
    }

    removeCollection = async(collectionId:number):Promise<string> => {
        try {
            const fetchResult = await this.sendQuery('removeCollection', {
                id: collectionId
            });
            return await fetchResult.text();
        }
        catch (e){
            return '';
        }
    }

    updateShareLink = async (collectionId:number, clear: boolean):Promise<string> => {
        try {
            const fetchResult = await this.sendQuery('generateShareLink', {
                collectionId: collectionId,
                clear: clear
            });
            return await fetchResult.text();
        }
        catch (e){
            return '';
        }
    }

    getCloneCollectionInfo = async (collectionOrShareId: number | string) => {
        try {
            const fetchResult = await this.sendQuery('getCloneCollectionInfo', {
                collectionId: collectionOrShareId,
            });
            return await fetchResult.json();
        }
        catch (e){
            return {};
        }
    }

    sendQuery = async (path: string, body: any, method:string|undefined = 'POST') => {
        let response;
        try {
            response = await fetch(this.API_URL + path, {
                method: method,
                headers: this.getFetchHeaders(),
                body: JSON.stringify(body)
            });
        }
        catch (e){
            response = new Response();
        }
        return response;
    }

    getFetchHeaders = () => {
        return {
            'Content-Type': 'application/json',
            Authorization: this.UIStore.$state.Authorization
        }
    }

    timeout = async (ms:number) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}