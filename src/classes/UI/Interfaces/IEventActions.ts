import type {App} from "@vue/runtime-core";

export interface IEventActions {
    install(app:App):void;
    sendEvent(eventName:string):void;
}