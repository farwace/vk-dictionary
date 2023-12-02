export interface IUIActions {
    addToHomeScreen(): TAddToHomeScreenResultStatuses;
}

export type TAddToHomeScreenResultStatuses = "SUCCESS" | "ERROR" | "ALREADY_ADDED" | "CAN_NOT_ADD";