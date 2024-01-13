export type TCollection = {
    id?:number,
    name?:string,
    languageId?:number,
    originalLangId?:number,
    description?:string,
    fileId?:number,
    originalId?:number,
    sort?:number,
    system?:boolean,
    userId?:number,
    shareId?:string|null,
};

export type TCollections = TCollection[];