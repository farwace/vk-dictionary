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
        }
    }
});