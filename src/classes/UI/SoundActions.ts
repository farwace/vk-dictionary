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

    loadForTraining() {
        this.successSound = new Audio('/assets/audio/success.mp3');
        this.faultSound = new Audio('/assets/audio/fault.mp3');

        this.successSound.load();
        this.faultSound.load();
    }
    playStep() {
        this.stepSound?.play();
    }
    playSuccess() {
        this.successSound?.play();
    }
    plyFault() {
        this.faultSound?.play();
    }
}