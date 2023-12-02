import type {IUserActionsInterface} from "@/classes/UserActions/Interfaces/IUserActionsInterface";
import type {TAddToHomeScreenResultStatuses} from "@/classes/UI/Interfaces/IUIActions";
import type {IUIActions} from "@/classes/UI/Interfaces/IUIActions";
import {inject, injectable} from "inversify";

@injectable()
export class UIActions implements IUIActions{

    constructor(
        @inject('UserActions')
        private userActions: IUserActionsInterface
    ) {
    }

    addToHomeScreen = (): TAddToHomeScreenResultStatuses => {
        this.userActions.CheckAddHomeScreen().then((res) => {
            if(res.canAdd){
                if(!res.isAdded){
                    this.userActions.AddToHomeScreen().then(() => {
                        return "SUCCESS"
                    });
                }
                else{
                    return "ALREADY_ADDED";
                }
            }
            else{
                return "CAN_NOT_ADD";
            }
        }).catch(() => {

        })
        return "ERROR";
    }
}