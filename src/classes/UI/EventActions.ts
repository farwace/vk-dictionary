import {injectable} from "inversify";
import {App} from "@vue/runtime-core";
import {UIStore} from "@/classes/Pinia/UIStore/UIStore";
import {IEventActions} from "@/classes/UI/Interfaces/IEventActions";
import bridge from "@vkontakte/vk-bridge";

@injectable()
export class EventActions implements IEventActions{
    private UIStore;

    constructor() {
        this.UIStore = UIStore();
    }
    install(app: App) {
        app.provide('TARGET_EVENTS', this);
    }

    sendEvent = (eventName: string) => {
        const userId = this.UIStore.$state?.user?.id;
        let props:{event_name: string, user_id?: number} = {
            event_name: eventName,
        };
        if(userId){
            props.user_id = userId;
        }
        try {
            /* @ts-ignore */
            bridge.send('VKWebAppTrackEvent', props).then((sendRes) => {
                //console.log('>>> SEND RES', sendRes)
            }).catch((e) => {
                //console.log('>>> send error', e)
            });

        }
        catch (e){

        }
    }



}