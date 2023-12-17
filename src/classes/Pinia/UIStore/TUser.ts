export type TUser ={
    id?: number,
    userId?: number,
    isNew?: boolean,
    experience?: number,
    first_name?: string,
    last_name?: string,
    photo_100?:string,
    lives?:number,
    userLangId?: number,
    displayTranscription?: boolean,
    userLearnLangId?:number,
};

export type TGetUserInfo = {
    id: number,
    experience: number,
    isNew: boolean,
    lives: number,
    userLangId: number,
    userLearnLangId: number,
    displayTranscription: boolean,
};