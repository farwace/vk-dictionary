import type {IUserActionsInterface} from "@/classes/UserActions/Interfaces/IUserActionsInterface";
import type {TAddToHomeScreenResultStatuses} from "@/classes/UI/Interfaces/TAddToHomeScreenResultStatuses";
import type {App} from "@vue/runtime-core";
import type {IUIActions} from "@/classes/UI/Interfaces/IUIActions";
import {inject, injectable} from "inversify";
import bridge, {
    EGetLaunchParamsResponseLanguages,
    EGetLaunchParamsResponsePlatforms,
    GetLaunchParamsResponse
} from "@vkontakte/vk-bridge";
import {UIStore} from "@/classes/Pinia/UIStore/UIStore";
import {ISystemActions} from "@/classes/System/Interfaces/ISystemActions";
import {ShowSlidesSheetRequest} from "@vkontakte/vk-bridge/dist/types/src/types/data";
import {TWords} from "@/classes/Pinia/UIStore/TWord";

@injectable()
export class UIActions implements IUIActions{
    private UIStore;
    private language:EGetLaunchParamsResponseLanguages = EGetLaunchParamsResponseLanguages.RU;

    constructor(
        @inject('UserActions')
        private userActions: IUserActionsInterface,

        @inject('API')
        private API:ISystemActions
    ) {
        this.UIStore = UIStore();
    }

    getLanguage(){
        return this.language;
    }
    install(app: App, successfulInitialize:boolean) {
        app.provide('UI', this);
        if(successfulInitialize){
            this.queryLaunchParams().then(() => {
                const launchParams = this.UIStore.$state.launchParams;
                if(launchParams){
                    this.API.getUserInfo(launchParams).then((res) => {
                        if(res){
                            this.UIStore.$patch({
                                user: res,
                            });
                            this.updateSystemCollections().then();
                            this.updateUserCollections().then(() => {
                                this.UIStore.$patch({
                                    isReady: true,
                                })
                            });
                        }
                        else{
                            this.UIStore.$patch({userQueryError: true});
                        }
                        this.API.getLanguages().then((res) => {
                            this.UIStore.$patch({
                                availableLanguages: res,
                            });
                        })
                    }).catch(() => {
                        this.UIStore.$patch({userQueryError: true});
                    });
                }

            }).catch(() => {

            });
        }
        else{
            this.setInitializeError();
        }
    }

    setInitializeError(){
        this.UIStore.$patch({
            launchError: true
        });
    }

    async queryLaunchParams(){
        try {
            //const launchParams = await bridge.send('VKWebAppGetLaunchParams');
            //todo: убрать для теста
            const launchParams: GetLaunchParamsResponse = {
                vk_app_id: 51805937,
                sign: '',
                vk_language: EGetLaunchParamsResponseLanguages.RU,
                vk_access_token_settings: '',
                vk_are_notifications_enabled: 0,
                vk_ts: 1,
                vk_is_app_user: 1,
                vk_ref: '',
                vk_is_favorite: 1,
                vk_user_id: 73736329,
                vk_platform: EGetLaunchParamsResponsePlatforms.DESKTOP_WEB
            } //todo: убратЬ!!!!
            if(launchParams.vk_app_id){
                this.UIStore.$patch({
                    launchParams: launchParams
                });
                if(launchParams.vk_language in ['ru', 'en']){
                    this.language = launchParams.vk_language;
                }
            }
        }
        catch (e){

        }
    }

    CanIAddToHomeScreen = async () => {
        try {
            const checkIfICan = await this.userActions.CheckAddHomeScreen();
            return checkIfICan.canAdd && !checkIfICan.isAdded;
        }
        catch (e){
            return false;
        }

    }

    addToHomeScreen = async (): Promise<TAddToHomeScreenResultStatuses> => {
        try {
            const CanIAdd = await this.userActions.CheckAddHomeScreen();
            if(CanIAdd.isAdded){
                return "ALREADY_ADDED";
            }
            if(CanIAdd.canAdd && !CanIAdd.isAdded){
                try {
                    if(await this.userActions.AddToHomeScreen()){
                        return "SUCCESS";
                    }
                    else{
                        return "ERROR";
                    }
                }
                catch (e1){
                    return "ERROR";
                }
            }
            return "CAN_NOT_ADD";
        }
        catch (e){
            return "ERROR";
        }
    }

    addToFavorites = async (): Promise<boolean> => {
        try {
            return await this.userActions.AddToFavorites();
        }
        catch (e){
            return false;
        }
    }

    showWelcomeSlides(slides: ShowSlidesSheetRequest){
        console.log('sendShowSLides')
        //todo: убрать для теста
        bridge.send('VKWebAppShowSlidesSheet', slides).then().catch(); //todo: вернуть
    }


    setContentHeight(val: string) {
        this.UIStore.$patch({
            contentHeight: val
        })
    }

    async setLanguage(languageId: number, learnLanguageId: number) {

        const oldUserLangId = this.UIStore?.user?.userLangId;
        const oldUserLearnLangId = this.UIStore?.user?.userLearnLangId;

        //ничего не меняли, ничего и не отправляем...
        if(languageId == oldUserLangId && learnLanguageId == oldUserLearnLangId){
            return;
        }

        this.UIStore.$patch({
            isLoading: true,
        });
        const setLangResult = await this.API.setLanguage(languageId, learnLanguageId);
        if(setLangResult.result == 'ok'){
            const user = this.UIStore.$state.user;
            user.userLangId = languageId;
            user.userLearnLangId = learnLanguageId;
            this.UIStore.$patch({
                user: user,
                isLoading: false,
            });
            this.updateSystemCollections().then();
            this.updateUserCollections().then();
        }
        else{
            //todo: почему может не выставиться язык? что делать?
        }
    }

    updateSystemCollections = async () => {
        const userLang = this.UIStore.$state?.user?.userLangId;
        const learnLang = this.UIStore.$state?.user?.userLearnLangId;
        if(userLang && learnLang){
            const systemCollections = await this.API.getSystemCollections(learnLang, userLang);
            if(!!systemCollections.length){
                console.log('>>> SYSTEM COLLECTIONS >>> ', systemCollections);

                this.UIStore.$patch({
                    systemCollections: systemCollections
                });
                return systemCollections;
            }
            else{
                this.UIStore.$patch({
                    systemCollections: []
                });
                return [];
            }
        }
        else{
            this.UIStore.$patch({
                systemCollections: []
            });
            return [];
        }
    }

    updateUserCollections = async () => {
        const userLang = this.UIStore.$state?.user?.userLangId;
        const learnLang = this.UIStore.$state?.user?.userLearnLangId;
        if(userLang && learnLang){
            const collections = await this.API.getCollections(learnLang, userLang);
            if(!!collections.length){
                console.log('>>> collections >>> ', collections);

                this.UIStore.$patch({
                    collections: collections
                });
                return collections;
            }
            else{
                this.UIStore.$patch({
                    collections: []
                });
                return [];
            }
        }
        else{
            this.UIStore.$patch({
                collections: []
            });
            return [];
        }

    }

    createCollection = async (name: string, description: string) => {
        const userLang = this.UIStore.$state?.user?.userLangId;
        const learnLang = this.UIStore.$state?.user?.userLearnLangId;
        if(userLang && learnLang){
            const neoCollection = await this.API.createCollection(name, learnLang, userLang, description);
            if(neoCollection.id){
                this.UIStore.$patch((state) => {
                    state.collections.push(neoCollection);
                });
                return neoCollection;
            }
            return {};
        }
        else{
            return {};
        }
    }

    async setTranscription(neoVal: boolean) {
        this.UIStore.$patch({
            isLoading: true,
        });
        const toggleTranscriptionResult = await this.API.toggleTranscription(neoVal);
        if(toggleTranscriptionResult.result == 'ok'){
            const user = this.UIStore.$state.user;
            user.displayTranscription = neoVal;
            this.UIStore.$patch({
                user: user,
                isLoading: false,
            });
        }
        else{
            //todo: почему может не выставиться праметр?
        }
    }

    getCollectionWords = async (collectionId:number):Promise<TWords> => {
        this.UIStore.$patch({
            currentCollectionWords: [],
        })
        const collectionWords = await this.API.getCollectionWords(collectionId) || [];
        console.log('>>> COLLECTION WORDS', collectionWords);
        this.UIStore.$patch({
            currentCollectionWords: collectionWords
        })
        return collectionWords;
    }

    loadCollections = async () => {
        // this.API.getCollections({
        //
        // })

    }

    getApi(){
        return this.API;
    }
}