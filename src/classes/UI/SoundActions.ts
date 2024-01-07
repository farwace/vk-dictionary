import {injectable} from "inversify";
import {ISoundActions} from "@/classes/UI/Interfaces/ISoundActions";
import {UIStore} from "@/classes/Pinia/UIStore/UIStore";
import {App} from "@vue/runtime-core";

@injectable()
export class SoundActions implements ISoundActions{
    private UIStore;
    private stepSound: HTMLAudioElement;
    private successSound?: HTMLAudioElement;
    private faultSound?: HTMLAudioElement;

    constructor() {
        this.UIStore = UIStore();
        this.stepSound = new Audio('/assets/audio/step.mp3');
        this.stepSound.load();
    }
    install(app: App) {
        app.provide('SOUND', this);
    }

    stopAll(){
        this.stepSound.currentTime = 0;
        this.stepSound.pause();

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
    playStep() {
        this.stopAll();
        this.stepSound?.play();
    }
    playSuccess() {
        this.stopAll();
        this.successSound?.play();
    }
    plyFault() {
        this.stopAll();
        this.faultSound?.play();
    }
}