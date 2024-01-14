import type {App} from "@vue/runtime-core";

export interface ISoundActions {
    install(app:App):void;
    stopAll():void;
    loadForTraining():void;
    playSuccess():void;
    plyFault():void;
}