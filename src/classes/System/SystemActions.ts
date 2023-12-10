import type {ISystemActions} from "@/classes/System/Interfaces/ISystemActions";
import type {GetLaunchParamsResponse} from "@vkontakte/vk-bridge";
import type {TUser} from "@/classes/Pinia/UIStore/TUser";
import {injectable} from "inversify";
import bridge from "@vkontakte/vk-bridge";
import {TWord} from "@/classes/Pinia/UIStore/TWord";

@injectable()
export class SystemActions implements ISystemActions{
    //private API_URL:string = 'https://api.dictionary.total-black.ru/';
    private API_URL:string = 'http://127.0.0.1:4001/api/';

    checkLaunchParams = async () => {
        const fetchResult = await this.sendQuery('launchParams', {}, 'POST');
        return fetchResult.ok;
    }

    getUserInfo = async (launchParams: GetLaunchParamsResponse): Promise<TUser | undefined> => {
        try {
            const userInfo = await bridge.send('VKWebAppGetUserInfo', {user_id: launchParams.vk_user_id});
            const fetchResult = await this.sendQuery('getUserInfo', {
                firstName: userInfo.first_name,
                lastName: userInfo.last_name,
            }, 'POST');
            const bUser = await fetchResult.json() as TUser;

            return {
                userId: userInfo.id,
                first_name: userInfo.first_name,
                last_name: userInfo.last_name,
                photo_100: userInfo.photo_100,

                id: bUser.id,
                experience: bUser.experience,
                isNew: bUser.isNew,
            }
        }
        catch (e){
            return undefined;
        }


    }

    getWordsForTraining = async (langId: number, arCollections?: number[]) => {
        try {
            const fetchResult = await this.sendQuery('training', {
                langId: langId,
                arCollections: arCollections || [],
            });
            return await fetchResult.json();
        }
        catch (e){
            return {};
        }
    }

    getCollections = async (langId: number) => {
        try {
            const fetchResult = await this.sendQuery('collections', {
                langId: langId,
            });
            return await fetchResult.json();
        }
        catch (e){
            return [];
        }
    }

    createCollection = async (name: string, langId: number): Promise<any> => {
        try {
            const fetchResult = await this.sendQuery('neoCollection', {
                langId: langId,
                name: name,
            });
            return await fetchResult.json();
        }
        catch (e){
            return [];
        }
    }
    cloneCollection = async (collectionId: number): Promise<any> => {
        try {
            const fetchResult = await this.sendQuery('cloneCollection', {
                collectionId: collectionId,
            });
            return await fetchResult.json();
        }
        catch (e){
            return [];
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

    addNeoWord = async (collectionId: number, neoWord: TWord): Promise<any> => {
        try {
            const fetchResult = await this.sendQuery('neoWord', {
                collectionId: collectionId,
                word: neoWord
            });
            return await fetchResult.json();
        }
        catch (e){
            return [];
        }
    }


    getSystemCollections = async (langId: number) => {
        try {
            const fetchResult = await this.sendQuery('systemCollections', {
                langId: langId,
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
            return await fetchResult.json();
        }
        catch (e){
            return {};
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

    getLanguages = async (): Promise<any> => {
        try {
            const fetchResult = await this.sendQuery('getLanguages', {});
            return await fetchResult.json();
        }
        catch (e){
            return [];
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
            Authorization: `Bearer ${window.location.search.slice(1)}`
        }
    }
}