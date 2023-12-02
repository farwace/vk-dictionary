export interface IUserActionsInterface{
    AddToHomeScreen():Promise<boolean>;
    CheckAddHomeScreen():Promise<TICanAddToHomeScreen>;
}

export type TICanAddToHomeScreen = {
    canAdd: boolean,
    isAdded: boolean,
}