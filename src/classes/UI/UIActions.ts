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
import {TRawWord, TWord, TWords} from "@/classes/Pinia/UIStore/TWord";
import {TCollection} from "@/classes/Pinia/UIStore/TCollection";

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

                                const currentHash = window.location.hash;
                                const cloneCollectionRegex = /collection-\d+/;
                                const match = currentHash.match(cloneCollectionRegex);

                                if(match){
                                    const tryingCloneId = match[0].replace('collection-', '');
                                    const arAddedCollections = this.UIStore.$state.collections.filter((collection) => {
                                        return collection.originalId == parseInt(tryingCloneId) || collection.id == parseInt(tryingCloneId);
                                    });

                                    if(arAddedCollections.length < 1){
                                        this.cloneCollection(parseInt(tryingCloneId)).then((res) => {
                                            if(res.id){
                                                this.UIStore.$patch((state) => {
                                                    state.collections.unshift(res);
                                                    state.isReady = true;
                                                    state.appliedCollection = res.id as number;
                                                });

                                            }
                                        }).catch((e) => {
                                            this.UIStore.$patch({
                                                isReady: true,
                                            });
                                        })
                                    }
                                    else{
                                        this.UIStore.$patch({
                                            isReady: true,
                                        });
                                    }
                                }
                                else{
                                    this.UIStore.$patch({
                                        isReady: true,
                                    })
                                }

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
    clearSharedId(){
        this.UIStore.$patch({
            appliedCollection: 0
        });
    }
    setInitializeError(){
        this.UIStore.$patch({
            launchError: true
        });
    }

    async queryLaunchParams(){
        try {
            const launchParams = await bridge.send('VKWebAppGetLaunchParams');
            //todo: dev убрать для теста
            /*const launchParams: GetLaunchParamsResponse = {
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
            }*/ //todo: убратЬ!!!!
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
        //todo: dev убрать для теста
        bridge.send('VKWebAppShowSlidesSheet', slides).then().catch();
    }


    setContentHeight(val: string) {
        this.UIStore.$patch({
            contentHeight: val
        })
    }

    share = async (hash:string = ''):Promise<boolean> => {
        if(hash.length > 0){
            hash = '#' + hash
        }
        try {
            const shareRes:any = await bridge.send('VKWebAppShare', {
                link: 'https://vk.com/app51805937' + hash
            });

            return !!shareRes.result; //может быть массив вида `type:"message"`, а что с ним делать - пока ничего)

        }
        catch (e){
            return false;
        }


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

    updateTrainingWords = async (arCollections: number[]):Promise<void> => {
        const user = this.UIStore.$state.user;
        if(user.userLearnLangId){
            const trainingResult:TRawWord[] = await this.API.getWordsForTraining(user.userLearnLangId!, user.userLangId!, arCollections)
            const trainingWords:TWord[] = [];
            trainingResult.forEach((rawWord: TRawWord) => {
                trainingWords.push({
                    word: rawWord.word,
                    foreignWord: rawWord.foreign_word!,
                    collectionId: rawWord.collection_id!,
                    id: rawWord.id,
                    fileId: rawWord.file_id!,
                    transcription: rawWord.transcription
                })
            });

            this.UIStore.$patch({
                trainingWords: trainingWords,
                trainingCollections: arCollections
            });
            return;
        }
        return;
    }

    updateUserCollections = async () => {
        const userLang = this.UIStore.$state?.user?.userLangId;
        const learnLang = this.UIStore.$state?.user?.userLearnLangId;
        if(userLang && learnLang){
            const collections = await this.API.getCollections(learnLang, userLang);
            if(!!collections.length){

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
                    state.currentCollectionWords = undefined;
                });
                return neoCollection;
            }
            return {};
        }
        else{
            return {};
        }
    }

    updateCollection = async (collection:TCollection):Promise<boolean> => {
        const updateCollectionRes = await this.API.updateCollection(collection);
        const isOk = updateCollectionRes == 'OK';
        if(isOk){
            this.UIStore.$patch(state => {
                state.collections.map((stateCollection) => {
                    if(collection.id && stateCollection.id == collection.id){
                        stateCollection.name = collection.name;
                        stateCollection.description = collection.description;
                    }
                    return stateCollection;
                })
            })
        }
        return isOk;
    }

    removeCollection = async (collectionId:number):Promise<boolean> => {
        const removeCollectionRes = await this.API.removeCollection(collectionId);
        const isOk = removeCollectionRes == 'OK';
        if(isOk){
            this.UIStore.$patch(state => {
                state.collections = state.collections.filter((stateCollection) => {
                    return stateCollection.id != collectionId;
                })
            })
        }
        return isOk;
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

        this.UIStore.$patch({
            currentCollectionWords: collectionWords
        })
        return collectionWords;
    }

    getSystemCollectionWords = async(collectionId: number):Promise<TWords> => {
        return await this.API.getCollectionWords(collectionId) || [];
    }

    cloneCollection = async (collectionId: number):Promise<TCollection> => {
        const cloneCollectionResult =  await this.API.cloneCollection(collectionId);

        if(cloneCollectionResult.id){
            await this.setLanguage(cloneCollectionResult.originalLangId!, cloneCollectionResult.languageId!);
            this.UIStore.$patch((state) => {
                state.collections.unshift({
                    name: cloneCollectionResult.name,
                    description: cloneCollectionResult.description,
                    originalLangId: cloneCollectionResult.originalLangId,
                    languageId: cloneCollectionResult.languageId,
                    originalId: cloneCollectionResult.originalId,
                    sort: cloneCollectionResult.sort,
                    fileId: cloneCollectionResult.fileId,
                    userId: cloneCollectionResult.userId,
                    system: cloneCollectionResult.system,
                    id: cloneCollectionResult.id,
                });
                state.currentCollectionWords = undefined;
            });
        }

        return cloneCollectionResult;
    }

    addWordToCollection = async (neoWord: string, neoTranscription: string, neoForeignWord: string, collectionId: number):Promise<TWord> => {
        const neoWordRes = await this.API.addNeoWord({
            word: neoWord,
            transcription: neoTranscription,
            foreignWord: neoForeignWord,
            collectionId: collectionId
        });
        const addedWord:TWord = {
            id: neoWordRes.id,
            collectionId: neoWordRes.collectionId,
            word: neoWordRes.word,
            foreignWord: neoWordRes.foreignWord,
            transcription: neoWordRes.transcription,
        }
        this.UIStore.$patch((state) => {
            if(!state.currentCollectionWords){
                state.currentCollectionWords = [];
            }
            state.currentCollectionWords.splice(0,0,addedWord);
        })
        return neoWordRes;
    }

    removeWord = async (wordId: number) => {
        const removeWordResult = await this.API.removeWord(wordId);
        const isOk = removeWordResult == 'OK';
        if(isOk){
            this.UIStore.$patch((state) => {
                if(state.currentCollectionWords){
                    state.currentCollectionWords = state.currentCollectionWords.filter((word) => {
                        return word.id != wordId;
                    })
                }
            })
        }

        return isOk;
    }

    addWordExperience = async (id: number, count: number) => {
        await this.API.updateWordExperience([
            {
                wordId: id,
                experience: count
            }
        ])
    }

    updateWord = async(word: TWord) => {
        const updateRes = await this.API.updateWord(word);
        const isOk = updateRes === 'OK';
        if(isOk){
            this.UIStore.$patch((state) => {
                if(state.currentCollectionWords){
                    state.currentCollectionWords = state.currentCollectionWords.map((stateWord) => {
                        if(word.id && word.id == stateWord.id){
                            stateWord.word = word.word;
                            stateWord.transcription = word.transcription;
                            stateWord.foreignWord = word.foreignWord;
                        }
                        return stateWord;
                    })
                }
            })

        }
        return isOk;
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