import type {IUserActionsInterface} from "@/classes/UserActions/Interfaces/IUserActionsInterface";
import type {TAddToHomeScreenResultStatuses} from "@/classes/UI/Interfaces/TAddToHomeScreenResultStatuses";
import type {App} from "@vue/runtime-core";
import type {IUIActions} from "@/classes/UI/Interfaces/IUIActions";
import {inject, injectable} from "inversify";
import bridge, {
    BannerAdLocation,
    EAdsFormats,
    EGetLaunchParamsResponseLanguages,
    EGetLaunchParamsResponsePlatforms,
    GetLaunchParamsResponse
} from "@vkontakte/vk-bridge";
import {UIStore} from "@/classes/Pinia/UIStore/UIStore";
import {ISystemActions} from "@/classes/System/Interfaces/ISystemActions";
import {ShowSlidesSheetRequest} from "@vkontakte/vk-bridge/dist/types/src/types/data";
import {TRawWord, TWord, TWords} from "@/classes/Pinia/UIStore/TWord";
import {TCollection} from "@/classes/Pinia/UIStore/TCollection";
import {bufferTime, Subject, throttleTime} from "rxjs";

@injectable()
export class UIActions implements IUIActions{
    private UIStore;
    private language:EGetLaunchParamsResponseLanguages = EGetLaunchParamsResponseLanguages.RU;
    private CAN_TRANSLATE:boolean = true;
    private updateWordExperience$:Subject<{ id:number, count: number }>;

    constructor(
        @inject('UserActions')
        private userActions: IUserActionsInterface,

        @inject('API')
        private API:ISystemActions
    ) {
        this.UIStore = UIStore();
        this.updateWordExperience$ = new Subject();
        this.updateWordExperience$.pipe(
            bufferTime(3000)
        ).subscribe((values) => {
            this.sendWordExperience(values);
        })
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
                    if(launchParams.vk_platform == 'mobile_iphone' || launchParams?.vk_platform == 'mobile_ipad' || launchParams?.vk_platform == 'mobile_iphone_messenger'){
                        bridge.send('VKWebAppSetSwipeSettings', {
                            history: true
                        });
                    }
                    this.API.getUserInfo(launchParams).then((res) => {
                        if(res){
                            this.UIStore.$patch({
                                user: res,
                            });
                            this.updateSystemCollections().then();
                            this.updateUserCollections().then(() => {
                                this.checkStorageVariables();
                                this.checkSharedCollection();
                                bridge.subscribe((e) => {
                                    if (e.detail.type === 'VKWebAppChangeFragment') {
                                        if(e.detail.data && e.detail.data.location){
                                            this.checkSharedCollection(e.detail.data.location);
                                        }
                                    }
                                });
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

    private checkSharedCollection = (location?:string) => {
        let currentHash = window.location.hash;
        if(location){
            currentHash = location;
        }
        const cloneCollectionRegex = /collection-\S+/;
        const match = currentHash.match(cloneCollectionRegex);

        if(match){
            const tryingCloneId = match[0].replace('collection-', '');
            //для того чтобы исключить, что это системная и уже была добавлена или пытаемся какую-то из своих дублировать.
            const arAddedCollections = this.UIStore.$state.collections.filter((collection) => {
                return collection.originalId == parseInt(tryingCloneId) || collection.shareId == tryingCloneId;
            });

            if(arAddedCollections.length < 1){
                this.setReady();

                this.tryCloneCollection(tryingCloneId);
            }
            else{
                this.setReady();
            }
        }
        else{
            this.setReady();
        }
    }

    private setReady = () => {
        this.UIStore.$patch({
            isReady: true,
        })
    }

    clearSharedId(){
        this.UIStore.$patch({
            appliedCollection: {},
            appliedCollectionId: 0
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
            const urlParams = new URLSearchParams(window.location.search);
            const client = urlParams.get('vk_client') || '';
            if(client == 'browser_atom' || client == 'ok' || client == 'mail'){
                const paramsObject:{[key:string]:string | number} = {};

                for (const [key, value] of urlParams) {
                    paramsObject[key] = value;
                }
                this.UIStore.$patch({
                    launchParams: paramsObject as unknown as GetLaunchParamsResponse
                });
            }
            else{
                this.setInitializeError();
            }
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
        //todo: dev убрать для теста
        bridge.send('VKWebAppShowSlidesSheet', slides).then().catch();
    }

    copyToClipboard = async (text:string) => {
        try {
            const copyResult = await bridge.send('VKWebAppCopyText', {
                text: text
            });
            console.log(copyResult);
            return true;
        }
        catch (e){
            console.log(e);
            return false;
        }
    }

    setContentHeight(val: string) {
        this.UIStore.$patch({
            contentHeight: val
        })
    }

    share = async (hash:string = '', message?:string):Promise<boolean> => {
        if(hash.length > 0){
            hash = '#' + hash
        }

        //if(!message){
            try {
                const shareRes:any = await bridge.send('VKWebAppShare', {
                    link: 'https://vk.com/app51805937' + hash,
                });

                return !!shareRes.result; //может быть массив вида `type:"message"`, а что с ним делать - пока ничего)

            }
            catch (e){
                return false;
            }
        //}
        // else{
        //     try {
        //         const shareRes:any = await bridge.send('VKWebAppShowWallPostBox', {
        //             message: message,
        //             attachments: 'https://vk.com/app51805937' + hash
        //         });
        //
        //         return !!shareRes.result; //может быть массив вида `type:"message"`, а что с ним делать - пока ничего)
        //
        //     }
        //     catch (e){
        //         return false;
        //     }
        // }

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
        bridge.send('VKWebAppCheckNativeAds', { ad_format: EAdsFormats.INTERSTITIAL});
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
        else{
            return;
        }
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
                this.showBannerAds();
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
            const neoCollection = await this.API.createCollection(name.trim(), learnLang, userLang, description.trim());
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
        const toggleTranscriptionResult = await this.API.toggleTranscription(neoVal);
        const user = this.UIStore.$state.user;
        if(toggleTranscriptionResult.result == 'ok'){
            user.displayTranscription = neoVal;
            this.UIStore.$patch({
                user: user,
            });
            return true;
        }
        else{
            return false;
        }
    }

    getCollectionWords = async (collectionId:number):Promise<TWords> => {
        this.UIStore.$patch({
            currentCollectionWords: [],
        })
        const collectionWords = await this.API.getCollectionWords(collectionId) || [];

        this.UIStore.$patch({
            currentCollectionWords: collectionWords
        });
        this.showBannerAds();
        return collectionWords;
    }

    getSystemCollectionWords = async(collectionId: number):Promise<TWords> => {
        this.showBannerAds();
        return await this.API.getCollectionWords(collectionId) || [];
    }

    easyStart = async () => {
        this.showBannerAds();

        const easyResult = await this.API.easyStart();
        if(easyResult && easyResult[0]){
            this.updateUserCollections();
        }
        return easyResult;
    }

    cloneCollection = async (collectionId: number | string):Promise<TCollection> => {
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
                state.appliedCollectionId = cloneCollectionResult.id!;
            });
        }

        return cloneCollectionResult;
    }

    addWordToCollection = async (neoWord: string, neoTranscription: string, neoForeignWord: string, collectionId: number):Promise<TWord> => {
        const neoWordRes = await this.API.addNeoWord({
            word: neoWord.trim(),
            transcription: neoTranscription.trim(),
            foreignWord: neoForeignWord.trim(),
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

    removeWord = async (wordId: number|number[]) => {
        const removeWordResult = await this.API.removeWord(wordId);
        const isOk = removeWordResult == 'OK';
        if(isOk){
            this.UIStore.$patch((state) => {
                if(state.currentCollectionWords){
                    state.currentCollectionWords = state.currentCollectionWords.filter((word) => {
                        if(Array.isArray(wordId)){
                            return wordId.indexOf(word.id!) < 0;
                        }
                        else{
                            return word.id != wordId;
                        }
                    })
                }
            })
        }

        return isOk;
    }

    addWordExperience = async (id: number, count: number) => {
        this.updateWordExperience$.next({id: id, count: count});
        // await this.API.updateWordExperience([
        //     {
        //         wordId: id,
        //         experience: count
        //     }
        // ])
    }

    private sendWordExperience = async (values: {id: number, count: number}[]) => {
        if(values.length < 1){
            return;
        }
        await this.API.updateWordExperience(values.map((val) => {
            return {
                wordId: val.id,
                experience: val.count
            }
        }))
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

    vibro = (force?:boolean) => {
        if(this.UIStore.isVibrateEnabled || force === true){
            bridge.send('VKWebAppTapticImpactOccurred', {
                style: 'medium',
            })
        }
    }

    updateWords = async(words: TWord[]) => {
        const updateRes = await this.API.updateWords(words);
        const isOk = updateRes === 'OK';
        if(isOk){
            this.UIStore.$patch((state) => {
                if(state.currentCollectionWords){
                    state.currentCollectionWords = state.currentCollectionWords.map((stateWord) => {
                        const arCurrentWord = words.filter((w) => {
                            return w.id && w.id == stateWord.id;
                        });
                        if(arCurrentWord[0]){
                            const word = arCurrentWord[0];
                            if(word.id && word.id == stateWord.id){
                                stateWord.word = word.word;
                                stateWord.transcription = word.transcription;
                                stateWord.foreignWord = word.foreignWord;
                            }
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

    canShowAd = () => {
        let canShow = true;
        const user = this.UIStore.$state.user;
        if(user.subscriptionExpired){
            const date = new Date();
            if(user.subscriptionExpired && user.subscriptionExpired > date){
                canShow = false;
            }
        }
        return canShow;
    }

    showBetweenScreenAd = async () => {
        if(!this.canShowAd()){
            return;
        }
        bridge.send('VKWebAppShowNativeAds', { ad_format: EAdsFormats.INTERSTITIAL })
            .then((data) => {

            })
            .catch((error) => { console.log(error); /* Ошибка */ });
        return;
    }
    showBannerAds = () => {
        if(!this.canShowAd()){
            return;
        }
        bridge.send('VKWebAppShowBannerAd', {
            banner_location: BannerAdLocation.BOTTOM,
            can_close: true
        })
            .then((data) => {
                if (data.result) {
                    // Баннерная реклама отобразилась
                }
            })
            .catch((error) => {
                // Ошибка
                console.log(error);
            });
    }

    trySubscribe = async (days:number) => {
        try {
            const bridgeRes = await bridge.send('VKWebAppShowSubscriptionBox', {
                action: 'create',
                item: 'hideADS_'+days, // Идентификатор подписки в приложении
            });

            if(bridgeRes.success){
                bridge.send('VKWebAppHideBannerAd')
                    .then((data) => {
                        if (data.result) {
                            // Баннерная реклама скрыта
                        }
                    })
                    .catch((error) => {
                        // Ошибка
                        //console.log(error);
                    });
                const date = new Date();
                date.setDate(date.getDate() + days);
                this.UIStore.$patch((state) => {
                    state.user.subscriptionExpired = date;
                });
            }

            //console.log('Покупка прошла успешно', bridgeRes);
            return true;
        }
        catch (e){
            console.log('Ошибка!', e);
            return false;
        }
    }

    updateUserInfo = async () => {
        const launchParams = this.UIStore.$state.launchParams;
        if(launchParams){
            const userRes = await this.API.getUserInfo(launchParams);
            if(userRes?.id){
                this.UIStore.$patch({
                    user: userRes,
                });

            }
        }
    }

    updateShareLink = async(collectionId: number, clear:boolean) => {
        const neoShareId = await this.API.updateShareLink(collectionId, clear);
        let neoShareHash:string | null = '';
        if(clear && neoShareId == 'OK'){
            neoShareHash = null;
        }
        else if(!clear && neoShareId.length > 0){
            neoShareHash = neoShareId;
        }
        if(neoShareHash!=''){
            this.UIStore.$patch((state) => {
                state.collections.map((origCollection) => {
                    if(origCollection.id == collectionId){
                        origCollection.shareId = neoShareHash;
                    }
                    return origCollection;
                })
            });
        }

        return '';
    }

    checkStorageVariables = () => {
        bridge.send('VKWebAppStorageGet', {
            keys: [
                'isSoundEnabled',
                'isVibrateEnabled',
                'notificationsAsked',
                'recommendAsked',
            ]})
            .then((data) => {
                if (data.keys) {
                    let obData:{[key:string]:string} = {};
                    data.keys.forEach((dataKey) => {
                        obData[dataKey.key] = dataKey.value
                    });

                    if(obData.isSoundEnabled == '0' || obData.isSoundEnabled == '1'){
                        let isSoundEnabled = true;
                        if(obData.isSoundEnabled == '0'){
                            isSoundEnabled = false;
                        }
                        this.UIStore.$patch({
                            isSoundEnabled: isSoundEnabled
                        });
                    }
                    if(obData.isVibrateEnabled == '0' || obData.isVibrateEnabled == '1'){
                        let isVibrateEnabled = true;
                        if(obData.isVibrateEnabled == '0'){
                            isVibrateEnabled = false;
                        }
                        this.UIStore.$patch({
                            isVibrateEnabled: isVibrateEnabled
                        });
                    }
                    if(obData.notificationsAsked == '1'){
                        this.UIStore.$patch({
                            notificationsAsked: true
                        });
                    }
                    if(obData.recommendAsked == '1'){
                        this.UIStore.$patch({
                            recommendAsked: true
                        });
                    }

                }
            })
            .catch((error) => {
                // Ошибка
                //console.log(error);
            });
    }

    toggleSoundEnabled = (val?:boolean) => {
        if(val == undefined){
            val = !(this.UIStore.$state.isSoundEnabled)
        }

        this.UIStore.$patch({
            isSoundEnabled: val
        });
        let strVal = '0';
        if(val){
            strVal = '1';
        }
        bridge.send('VKWebAppStorageSet', {
            key: 'isSoundEnabled',
            value: strVal
        })
    }
    toggleVibrateEnabled = (val?:boolean) => {
        if(val == undefined){
            val = !(this.UIStore.$state.isVibrateEnabled)
        }

        this.UIStore.$patch({
            isVibrateEnabled: val
        });
        let strVal = '0';
        if(val){
            strVal = '1';
        }
        bridge.send('VKWebAppStorageSet', {
            key: 'isVibrateEnabled',
            value: strVal
        })
    }

    tryCloneCollection = async (collectionOrShareId: number | string) => {
        const cloneCollectionInfo = await this.API.getCloneCollectionInfo(collectionOrShareId);
        let collectionInfo:{collection?:TCollection, words?:TWord[], filled: boolean} = {filled: false};
        if(cloneCollectionInfo.collection){
            collectionInfo.collection = cloneCollectionInfo.collection;
        }
        if(cloneCollectionInfo.words){
            collectionInfo.words = cloneCollectionInfo.words;
        }
        if(collectionInfo.collection && collectionInfo.words){
            collectionInfo.filled = true;
            this.UIStore.$patch({
                appliedCollection: collectionInfo
            });
        }
    }
    setLoading = (show = false) => {
        this.UIStore.$patch({
            isLoading: show
        });
    }

    tryTranslate = async (str:string) => {
        if(!str || str.length < 1){
            return undefined;
        }
        if(!this.CAN_TRANSLATE){
            await this.timeout(1000);
        }
        this.CAN_TRANSLATE = false;
        const translateLanguages = ['en', 'es', 'pt', 'ru'];

        const availableLanguages = this.UIStore.$state.availableLanguages;

        if(availableLanguages && availableLanguages.length > 0){
            await this.timeout(100);
            let obLangs:{[key:number]:string} = {};
            availableLanguages.forEach((lang) => {
                obLangs[lang.id] = lang.nameCode;
            });

            const user = this.UIStore.$state.user;
            const strLang = obLangs[user.userLearnLangId!] || '';
            const toTranslateLang = obLangs[user.userLangId!] || '';

            if(translateLanguages.indexOf(strLang) > -1 && translateLanguages.indexOf(toTranslateLang) > -1){
                try {
                    const translateResult = await bridge.send('VKWebAppTranslate', {
                        texts: [str],
                        translation_language: strLang + '-' + toTranslateLang
                    });

                    if(translateResult.result.texts[0] && translateResult.result.texts[0] != str){
                        this.delayCanTranslate();
                        return this.filterBadText(translateResult.result.texts[0]);
                    }
                    else{
                        this.delayCanTranslate();
                        return undefined;
                    }
                }
                catch (e){
                    this.delayCanTranslate();
                    return undefined;
                }
            }
            else{
                this.delayCanTranslate();
                return undefined;
            }
        }
        else{
            this.delayCanTranslate();
            return undefined;
        }
    }

    tryAllowNotifications = () => {
        if(this.UIStore.$state.notificationsAsked || this.UIStore.$state.launchParams?.vk_are_notifications_enabled == 1){
            return;
        }
        bridge.send('VKWebAppAllowNotifications')
            .then((data) => {

                bridge.send('VKWebAppStorageSet', {
                    key: 'notificationsAsked',
                    value: '1'
                });

                if (data.result) {

                } else {

                }
            })
            .catch((error) => {
                //console.log(error);
            });
    }

    tryRecommend = () => {
        if(this.UIStore.$state.recommendAsked){
            return;
        }
        bridge.send('VKWebAppRecommend')
            .then((data) => {
                if (data.result) {
                    // Мини-приложение порекомендовано
                }
            })
            .catch((error) => {
                // Ошибка
                console.log(error);
            });

        bridge.send('VKWebAppStorageSet', {
            key: 'recommendAsked',
            value: '1'
        });
    }



    private filterBadText = (word:string):string|undefined => {
        const profanityList = ['ПИЗД', 'ЕБА', 'БЛЯ', 'ХУЙ'];

        for (const profanity of profanityList) {
            if (word.toUpperCase().indexOf(profanity) !== -1) {
                return undefined;
            }
        }
        return word;
    }

    private delayCanTranslate = () => {
        this.timeout(1000).then(() => {
            this.CAN_TRANSLATE = true;
        })
    }

    timeout = async (ms:number) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
