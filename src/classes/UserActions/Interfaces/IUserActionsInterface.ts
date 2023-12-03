import type {TICanAddToHomeScreen} from "@/classes/UserActions/Interfaces/TICanAddToHomeScreen";

export interface IUserActionsInterface{
    AddToHomeScreen():Promise<boolean>;
    AddToFavorites():Promise<boolean>;

    CheckAddHomeScreen():Promise<TICanAddToHomeScreen>;
}
