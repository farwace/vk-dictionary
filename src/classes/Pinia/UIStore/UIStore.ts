import type {TUIStore} from "@/classes/Pinia/UIStore/TUIStore";
import {defineStore} from "pinia";

export const UIStore = defineStore('UIStore', {
    state:():TUIStore=>{
        return {
            isReady: false,
            launchError: false,
            launchParams: undefined,
            user: {},
            userQueryError: false,
            availableLanguages: [],
            isLoading: false,
            collections: [],
            systemCollections: [],
            currentCollectionWords: undefined,
            trainingWords: undefined,
            contentHeight: '',
            Authorization: '',
            appliedCollection: {filled: false},
            appliedCollectionId: 0,
            trainingCollections: [],
            isSoundEnabled: true,
            notificationsAsked: false,
            recommendAsked: false,
            isVibrateEnabled: true,
            collectionExamples: {
                "ru-en": [
                    {foreignWord: "I",transcription: "Ай",word: "Я",collectionId: 0},
                    {foreignWord: "Cat",transcription: "Кэт",word: "Кошка",collectionId: 0},
                    {foreignWord: "Dog",transcription: "Дог",word: "Собака",collectionId: 0},
                ],
                "ru-es": [
                    {foreignWord: "Yo",transcription: "Ё",word: "Я",collectionId: 0},
                    {foreignWord: "El gato",transcription: "Гато",word: "Кот",collectionId: 0},
                    {foreignWord: "El Perro",transcription: "Пéрро",word: "Собака",collectionId: 0},
                ],
                "ru-pt": [
                    {foreignWord: "Eu",transcription: "",word: "Я",collectionId: 0},
                    {foreignWord: "Gato",transcription: "",word: "Кот",collectionId: 0},
                    {foreignWord: "Cão",transcription: "",word: "Собака",collectionId: 0},
                ],
                "ru-de": [
                    {foreignWord: "Ich",transcription: "",word: "Я",collectionId: 0},
                    {foreignWord: "Der Kater",transcription: "",word: "Кот",collectionId: 0},
                    {foreignWord: "Der Hund",transcription: "",word: "Собака",collectionId: 0},
                ],
                "ru-fr": [
                    {foreignWord: "Chat",transcription: "",word: "Кот",collectionId: 0},
                    {foreignWord: "Chien",transcription: "",word: "Собака",collectionId: 0},
                ],
            },
        }
    }
});