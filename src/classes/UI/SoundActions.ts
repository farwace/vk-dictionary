import {injectable} from "inversify";
import {ISoundActions} from "@/classes/UI/Interfaces/ISoundActions";
import {UIStore} from "@/classes/Pinia/UIStore/UIStore";
import {App} from "@vue/runtime-core";
import bridge from "@vkontakte/vk-bridge";

@injectable()
export class SoundActions implements ISoundActions{
    private UIStore;
    private successSound?: HTMLAudioElement;
    private faultSound?: HTMLAudioElement;

    constructor() {
        this.UIStore = UIStore();
    }
    install(app: App) {
        app.provide('SOUND', this);
    }

    stopAll(){
        if(this.successSound){
            this.successSound.currentTime = 0;
            this.successSound.pause();
        }
        if(this.faultSound){
            this.faultSound.currentTime = 0;
            this.faultSound.pause();
        }
    }

    loadForTraining() {
        this.successSound = new Audio('/assets/audio/success.mp3');
        this.faultSound = new Audio('/assets/audio/fault.mp3');

        this.successSound.load();
        this.faultSound.load();
    }
    playSuccess() {
        if(this.UIStore.isVibrateEnabled){
            bridge.send('VKWebAppTapticImpactOccurred', {
                style: 'heavy',
                /* @ts-ignore */
                disable_vibration_fallback: true,
            })
        }
        if(this.UIStore.isSoundEnabled){
            this.stopAll();
            this.successSound?.play();
        }
    }
    plyFault() {
        if(this.UIStore.isVibrateEnabled){
            bridge.send('VKWebAppTapticImpactOccurred', {
                style: 'heavy',
                /* @ts-ignore */
                disable_vibration_fallback: true,
            })
        }
        if(this.UIStore.isSoundEnabled) {
            this.stopAll();
            this.faultSound?.play();
        }
    }
}